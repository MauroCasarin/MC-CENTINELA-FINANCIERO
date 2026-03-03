import Groq from "groq-sdk";

// Caché simple en memoria (Nota: en Vercel esto solo dura lo que dure la instancia de la función)
const analysisCache = new Map<string, { text: string, timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const normalizedPrompt = prompt.trim().toLowerCase();
  const cached = analysisCache.get(normalizedPrompt);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return res.status(200).json({ text: cached.text });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "MY_GROQ_API_KEY" || !apiKey.trim()) {
      return res.status(500).json({ error: "GROQ_API_KEY no configurada en Vercel." });
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

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("Groq Error:", error);
    return res.status(500).json({ error: `Error de IA: ${error.message}` });
  }
}
