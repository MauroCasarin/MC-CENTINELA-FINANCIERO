import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(express.json());

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Caché simple en memoria para evitar llamadas repetitivas
const analysisCache = new Map<string, { text: string, timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// Ruta para análisis con Groq
app.post("/api/analyze", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  // Verificar caché
  const normalizedPrompt = prompt.trim().toLowerCase();
  const cached = analysisCache.get(normalizedPrompt);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log(">>> Devolviendo análisis desde caché (Groq)");
    return res.json({ text: cached.text });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "MY_GROQ_API_KEY" || apiKey.trim() === "") {
      throw new Error("GROQ_API_KEY no configurada en los Secretos.");
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
    console.error("Groq Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
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
