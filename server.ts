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
    
    // Priorizar Key-Cent si existe, ya que es donde el usuario puso su clave manual
    const apiKey = process.env['Key-Cent'] || 
                   process.env.KeyCent || 
                   process.env.GEMINI_API_KEY || 
                   process.env.API_KEY;
    
    console.log("Estado de claves:", {
      'Key-Cent': !!process.env['Key-Cent'],
      KeyCent: !!process.env.KeyCent,
      GEMINI: !!process.env.GEMINI_API_KEY,
      Usando: process.env['Key-Cent'] ? "Key-Cent" : (process.env.KeyCent ? "KeyCent" : "GEMINI_API_KEY")
    });

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.length < 10) {
      return res.status(500).json({ 
        error: "¡Casi listo! La aplicación aún no detecta tu clave.\n\n" +
               "PASO FINAL OBLIGATORIO:\n" +
               "En el panel de la LLAVE (🔑) donde pegaste la clave, debes hacer clic en el botón de abajo que dice:\n" +
               "👉 'APPLY CHANGES' (Aplicar cambios) 👈\n\n" +
               "Si ya lo hiciste y sigue fallando, asegúrate de que el nombre sea exactamente GEMINI_API_KEY."
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Error de la IA: " + (error.message || "Error desconocido") });
    }
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
