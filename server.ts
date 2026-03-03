import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// API Route for Gemini Analysis
app.post("/api/analyze", async (req, res) => {
  const { prompt } = req.body;
  
  // Recolectar todas las posibles claves configuradas (buscamos variaciones con guion y guion bajo)
  const potentialKeys: string[] = [];
  const foundNames: string[] = [];
  
  // Añadir claves específicas y genéricas
  const keysToTry = [
    'Key_Cent', 'Key_Cent_2', 'Key_Cent_3', 'Key_Cent_4', 'Key_Cent_5',
    'Key-Cent', 'Key-Cent-2', 'Key-Cent-3', 'Key-Cent-4', 'Key-Cent-5',
    'KeyCent', 'KeyCent2', 'KeyCent3',
    'GEMINI_API_KEY', 'NEXT_PUBLIC_GEMINI_API_KEY', 'API_KEY'
  ];

  for (const keyName of keysToTry) {
    const val = process.env[keyName];
    if (val && val !== "MY_GEMINI_API_KEY" && val.length > 10) {
      potentialKeys.push(val);
      foundNames.push(keyName);
    }
  }

  console.log("Claves detectadas en el servidor:", foundNames);

  if (potentialKeys.length === 0) {
    // Debug: Ver qué hay en el proceso (solo nombres)
    const allEnvKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('key') || k.toLowerCase().includes('gemini'));
    
    return res.status(500).json({ 
      error: "No se encontraron claves de API configuradas.\n\n" +
             "SISTEMA DETECTÓ ESTOS NOMBRES: " + (allEnvKeys.join(", ") || "Ninguno") + "\n\n" +
             "PASO OBLIGATORIO:\n" +
             "1. Ve al panel de la LLAVE (🔑).\n" +
             "2. Asegúrate de que el nombre sea exactamente Key_Cent o Key-Cent.\n" +
             "3. ¡HAZ CLIC EN EL BOTÓN NEGRO 'APPLY CHANGES' ABAJO! Si no le das, la web no se entera."
    });
  }

  // Intentar con cada clave hasta que una funcione (Fallback)
  let lastError = null;
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const apiKey of potentialKeys) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Implementación de reintentos para error 503 (High Demand)
      let response = null;
      let retries = 3;
      for (let i = 0; i < retries; i++) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts: [{ text: prompt }] }],
          });
          break; // Éxito, salir del bucle de reintentos
        } catch (error: any) {
          const isUnavailable = error.message?.includes("503") || error.message?.includes("UNAVAILABLE");
          if (isUnavailable && i < retries - 1) {
            console.log(`Modelo saturado (503). Reintentando en ${Math.pow(2, i)}s...`);
            await sleep(Math.pow(2, i) * 1000);
            continue;
          }
          throw error; // Si no es 503 o ya no hay reintentos, lanzar error
        }
      }

      if (response && response.text) {
        return res.json({ text: response.text });
      }
    } catch (error: any) {
      console.error(`Error con una de las claves:`, error.message);
      lastError = error;
    }
  }

  res.status(500).json({ 
    error: "Todas las claves de API fallaron o están agotadas. Detalle: " + (lastError?.message || "Error desconocido") 
  });
});

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
  }

  // Solo escuchar si no estamos en Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
