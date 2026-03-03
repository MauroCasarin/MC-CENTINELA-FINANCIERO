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

// Función para llamar a Groq como respaldo
async function callGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log(">>> Groq API Key no configurada. Saltando fallback.");
    return null;
  }

  try {
    console.log(">>> 🚀 Iniciando protocolo de emergencia: Cambiando a motor Groq (Llama 3)...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-8b-8192",
        temperature: 0.5,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`>>> Groq Error (${response.status}):`, errText);
      return null;
    }

    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (text) {
      console.log(">>> ✅ Éxito recuperando análisis vía Groq.");
      return text;
    }
    return null;
  } catch (e: any) {
    console.error(">>> Error crítico conectando con Groq:", e.message);
    return null;
  }
}

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

  // --- INTENTO 1: GEMINI (Google) ---
  const potentialKeys: string[] = [];
  const foundNames: string[] = [];
  const keysToTry = ['cent', 'cent2'];

  for (const keyName of keysToTry) {
    const val = process.env[keyName];
    if (val && val.length > 10 && val !== "AI Studio Free Tier" && val !== "MY_GEMINI_API_KEY") {
      potentialKeys.push(val);
      foundNames.push(keyName);
    }
  }

  // Si tenemos claves de Gemini, intentamos usarlas
  if (potentialKeys.length > 0) {
    const indices = Array.from({ length: potentialKeys.length }, (_, i) => i);
    // Shuffle simple
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const startTime = Date.now();
    const MAX_REQUEST_TIME = 25000; // Reducimos tiempo para dar paso a Groq más rápido

    for (const idx of indices) {
      const apiKey = potentialKeys[idx];
      const keyName = foundNames[idx];
      
      try {
        if (Date.now() - startTime > MAX_REQUEST_TIME) break;
        
        const ai = new GoogleGenAI({ apiKey });
        let response = null;
        
        // Lista de modelos Gemini
        const modelsToTry = [
          "gemini-2.0-flash",
          "gemini-2.0-flash-lite-preview-02-05",
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-pro"
        ];
        
        for (const model of modelsToTry) {
          try {
            console.log(`>>> [${keyName}] Probando Gemini: ${model}`);
            response = await ai.models.generateContent({
              model: model,
              contents: [{ parts: [{ text: prompt }] }],
            });
            
            if (response && response.text) {
               const text = response.text;
               analysisCache.set(normalizedPrompt, { text, timestamp: Date.now() });
               return { text };
            }
          } catch (innerError: any) {
            console.warn(`>>> [${keyName}] Falló Gemini ${model}:`, innerError.message);
            continue;
          }
        }
      } catch (error: any) {
        console.error(`[${keyName}] Error Gemini:`, error.message);
      }
    }
  } else {
    console.log(">>> No se encontraron claves válidas para Gemini. Pasando a Groq...");
  }

  // --- INTENTO 2: GROQ (Fallback) ---
  // Si llegamos aquí es porque Gemini falló con todas las claves y modelos
  const groqText = await callGroq(prompt);
  if (groqText) {
    analysisCache.set(normalizedPrompt, { text: groqText, timestamp: Date.now() });
    return { text: groqText, source: "groq" };
  }
  
  // Si todo falla
  throw new Error("⚠️ Todos los servicios de IA (Gemini y Groq) están saturados. Intenta más tarde.");
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
