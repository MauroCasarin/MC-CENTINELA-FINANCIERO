import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Analysis
  app.post("/api/analyze", async (req, res) => {
    const { prompt } = req.body;
    
    // Recolectar todas las posibles claves configuradas (buscamos hasta 10 variaciones)
    const potentialKeys: string[] = [];
    
    // Añadir claves específicas y genéricas
    const keysToTry = [
      'Key-Cent', 'Key-Cent-2', 'Key-Cent-3', 'Key-Cent-4', 'Key-Cent-5',
      'GEMINI_API_KEY', 'API_KEY', 'KeyCent', 'KeyCent2'
    ];

    for (const keyName of keysToTry) {
      const val = process.env[keyName];
      if (val && val !== "MY_GEMINI_API_KEY" && val.length > 10) {
        potentialKeys.push(val);
      }
    }

    if (potentialKeys.length === 0) {
      return res.status(500).json({ 
        error: "No se encontraron claves de API configuradas.\n\n" +
               "Asegúrate de haber pulsado 'Apply changes' en el panel de Secrets (🔑) y que los nombres coincidan (ej: Key-Cent, Key-Cent-2)."
      });
    }

    // Intentar con cada clave hasta que una funcione (Fallback)
    let lastError = null;
    for (const apiKey of potentialKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ parts: [{ text: prompt }] }],
        });

        if (response.text) {
          return res.json({ text: response.text });
        }
      } catch (error: any) {
        console.error(`Error con una de las claves:`, error.message);
        lastError = error;
        // Continuar al siguiente ciclo para probar la siguiente clave
      }
    }

    // Si llegamos aquí, todas las claves fallaron
    res.status(500).json({ 
      error: "Todas las claves de API fallaron o están agotadas. Detalle: " + (lastError?.message || "Error desconocido") 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
