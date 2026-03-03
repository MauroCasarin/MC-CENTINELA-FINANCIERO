import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Caché simple en memoria para evitar llamadas repetitivas
const analysisCache = new Map<string, { text: string, timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora de caché

// Registro de enfriamiento para claves que fallan por cuota
// Desactivamos el enfriamiento persistente para permitir reintentos manuales
const keyCooldowns = new Map<string, number>();

// Función genérica para procesar el análisis con rotación de claves
async function processAnalysis(prompt: string) {
  // Normalizar prompt para mejor caché
  const normalizedPrompt = prompt.trim().toLowerCase();
  
  // Verificar caché
  const cached = analysisCache.get(normalizedPrompt);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log(">>> Devolviendo análisis desde caché");
    return { text: cached.text };
  }

  const potentialKeys: string[] = [];
  const foundNames: string[] = [];
  const keysToTry = ['cent'];

  for (const keyName of keysToTry) {
    const val = process.env[keyName];
    if (val && val.length > 10 && val !== "AI Studio Free Tier" && val !== "MY_GEMINI_API_KEY") {
      potentialKeys.push(val);
      foundNames.push(keyName);
    }
  }

  if (potentialKeys.length === 0) {
    throw new Error("No se encontró ninguna API Key válida (variable 'cent').");
  }

  const indices = Array.from({ length: potentialKeys.length }, (_, i) => i);
  // Shuffle simple
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const startTime = Date.now();
  const MAX_REQUEST_TIME = 55000;
  let lastError = null;

  for (const idx of indices) {
    const apiKey = potentialKeys[idx];
    const keyName = foundNames[idx];
    
    try {
      if (Date.now() - startTime > MAX_REQUEST_TIME) break;
      console.log(`>>> Intentando con clave: ${keyName}`);
      const ai = new GoogleGenAI({ apiKey });
      
      let response = null;
      // Intentar con varios modelos en orden de preferencia
      // gemini-2.0-flash es el único que ha confirmado existencia (aunque con cuota limitada)
      const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
      ];
      
      for (const model of modelsToTry) {
        try {
          console.log(`>>> Probando modelo: ${model}`);
          response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
          });
          if (response && response.text) break; // Éxito
        } catch (innerError: any) {
          console.warn(`>>> Falló modelo ${model}:`, innerError.message);
          
          // Si es 404 (modelo no encontrado) o 429 (cuota), seguimos al siguiente modelo
          // A veces diferentes modelos tienen diferentes cuotas o disponibilidades
          continue;
        }
      }

      if (response && response.text) {
        analysisCache.set(normalizedPrompt, { text: response.text, timestamp: Date.now() });
        return { text: response.text };
      } else {
        throw new Error("Ningún modelo pudo generar respuesta.");
      }

    } catch (error: any) {
      console.error(`[${keyName}] Error crítico:`, error.message);
      lastError = error;
    }
  }
  
  // Mensaje amigable para el usuario final
  if (lastError?.message?.includes("429") || lastError?.message?.includes("RESOURCE")) {
    throw new Error("⚠️ La IA está saturada momentáneamente. Intenta de nuevo en unos minutos.");
  }
  
  throw lastError || new Error("Error desconocido al conectar con la IA.");
}

// Ruta de salud para verificar que el servidor responde
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    environment: process.env.VERCEL ? "vercel" : "local",
    timestamp: new Date().toISOString()
  });
});

// Ruta unificada para análisis
app.post(["/api/analyze", "/api/analyze-news"], async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const result = await processAnalysis(prompt);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Configuración de middleware y rutas estáticas
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  // Vite middleware for development - cargado dinámicamente solo en dev
  const setupVite = async () => {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  };
  setupVite();
} else if (!process.env.VERCEL) {
  // Serve static files in production ONLY if not on Vercel
  // Vercel handles static files via vercel.json rewrites
  app.use(express.static("dist"));
}

// Solo escuchar si no estamos en Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
