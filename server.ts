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
const keyCooldowns = new Map<string, number>();
const COOLDOWN_DURATION = 45 * 1000; // 45 segundos de enfriamiento

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
      // Verificar si la clave está en enfriamiento
      const cooldownUntil = keyCooldowns.get(keyName) || 0;
      if (Date.now() < cooldownUntil) {
        console.log(`>>> [${keyName}] En enfriamiento. Saltando...`);
        continue;
      }
      potentialKeys.push(val);
      foundNames.push(keyName);
    }
  }

  if (potentialKeys.length === 0) {
    // Si todas están en enfriamiento, intentar con la menos "caliente" o simplemente fallar
    throw new Error("Todas las claves están agotadas o en enfriamiento. Por favor, espera 30 segundos.");
  }

  const indices = Array.from({ length: potentialKeys.length }, (_, i) => i);
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
      for (let j = 0; j < 2; j++) { // 2 intentos para 503
        if (Date.now() - startTime > MAX_REQUEST_TIME) break;
        try {
          response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
          });
          break; 
        } catch (error: any) {
          const errorMsg = error.message || "";
          
          if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
            console.log(`[${keyName}] Cuota agotada (429).`);
            keyCooldowns.set(keyName, Date.now() + (COOLDOWN_DURATION * 10)); // Enfriamiento largo para 429
            throw new Error("Límite de peticiones alcanzado. Por favor, intenta de nuevo en unos minutos.");
          }
          
          if (errorMsg.includes("400") || errorMsg.includes("API_KEY_INVALID")) {
            console.log(`[${keyName}] Clave inválida. Saltando...`);
            throw error;
          }

          if ((errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE")) && j === 0) {
            console.log(`[${keyName}] Modelo saturado (503). Reintentando en 2s...`);
            await sleep(2000);
            continue;
          }
          throw error; 
        }
      }

      if (response && response.text) {
        analysisCache.set(normalizedPrompt, { text: response.text, timestamp: Date.now() });
        return { text: response.text };
      }
    } catch (error: any) {
      console.error(`[${keyName}] Error:`, error.message?.slice(0, 100));
      lastError = error;
    }
  }
  throw lastError || new Error("Todas las claves fallaron");
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
