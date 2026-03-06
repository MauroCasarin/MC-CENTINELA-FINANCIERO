import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { kv } from "@vercel/kv";

dotenv.config();

const app = express();
app.use(express.json());

// Caché simple en memoria para evitar llamadas repetitivas
const analysisCache = new Map<string, { text: string, timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// Ruta para análisis con Groq
const analyzeHandler = async (req: any, res: any) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const normalizedPrompt = prompt.trim().toLowerCase();
  const cached = analysisCache.get(normalizedPrompt);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return res.json({ text: cached.text });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "MY_GROQ_API_KEY" || !apiKey.trim()) {
      return res.status(500).json({ error: "GROQ_API_KEY no configurada localmente." });
    }

    const groq = new Groq({ apiKey });
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un analista financiero experto en el mercado argentino. Proporcionas análisis concisos, profesionales y directos."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || "";
    
    if (text) {
      analysisCache.set(normalizedPrompt, { text, timestamp: Date.now() });
    }

    res.json({ text });
  } catch (error: any) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: `Error de IA: ${error.message}` });
  }
};

app.post("/api/analyze", analyzeHandler);

// Ruta para registrar usuarios en Vercel KV
app.post("/api/register-user", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: "Nombre inválido" });
  }

  try {
    const timestamp = new Date().toISOString();
    const userData = { name: name.trim(), timestamp };
    
    // Guardamos en una lista de usuarios
    await kv.lpush('site_users', JSON.stringify(userData));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("KV Error:", error);
    res.status(500).json({ error: "Error al guardar en base de datos" });
  }
});

// Ruta opcional para ver usuarios (puedes borrarla luego si quieres privacidad)
app.get("/api/users", async (req, res) => {
  try {
    const users = await kv.lrange('site_users', 0, -1);
    res.json(users.map(u => typeof u === 'string' ? JSON.parse(u) : u));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV, local: true });
});

async function startServer() {
  const PORT = 3000;

  // En Vercel, no necesitamos que Express sirva los archivos estáticos, 
  // Vercel lo hace automáticamente desde la carpeta 'dist'.
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  }
}

// Ejecutar inicio solo si no es Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;
