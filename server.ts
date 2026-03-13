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
      model: "llama-3.1-8b-instant",
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
    if (error.status === 429) {
      return res.status(429).json({ error: "Límite de IA alcanzado por hoy. Por favor, intenta de nuevo más tarde." });
    }
    res.status(500).json({ error: `Error de IA: ${error.message}` });
  }
};

app.post("/api/analyze", analyzeHandler);

// Ruta para obtener datos del REM (Banco Central) vía Series de Tiempo
app.get("/api/rem", async (req, res) => {
  try {
    // Usamos el ID de serie validado para la mediana de inflación mensual del REM
    const response = await fetch("https://apis.datos.gob.ar/series/api/series?ids=430.1_REM_IPC_NAL_T_M_0_0_25_28&limit=1&sort=desc");
    if (!response.ok) throw new Error(`Error API Gob: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("REM API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

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

// Ruta para obtener el último análisis
app.get("/api/analysis/latest", async (req, res) => {
  try {
    const latestAnalysis = await kv.get("latest_global_analysis");
    if (latestAnalysis) {
      res.json(latestAnalysis);
    } else {
      res.status(404).json({ error: "No hay informes de cierre disponibles aún." });
    }
  } catch (error: any) {
    console.error("KV Error (get analysis):", error);
    res.status(500).json({ error: "Error al recuperar el informe global." });
  }
});

// Ruta para guardar el último análisis
app.post("/api/analysis/latest", async (req, res) => {
  const { content, displayDate } = req.body;
  if (!content || !displayDate) {
    return res.status(400).json({ error: "Content and displayDate are required" });
  }

  try {
    await kv.set("latest_global_analysis", {
      content,
      displayDate,
      timestamp: Date.now()
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("KV Error (set analysis):", error);
    res.status(500).json({ error: "Error al guardar el informe global." });
  }
});

// Ruta para contador de visitas
app.get("/api/visits", async (req, res) => {
  try {
    const isNew = req.query.isNew === 'true';
    const visits = await kv.incr('site_visits');
    let newUsers = await kv.get<number>('new_users') || 0;
    
    if (isNew) {
      newUsers = await kv.incr('new_users');
    }
    
    res.json({ visits, newUsers });
  } catch (error) {
    console.error("KV Error (visits):", error);
    res.status(500).json({ error: "Error al actualizar visitas" });
  }
});

// Ruta para historial de dólares
app.get("/api/historico", async (req, res) => {
  try {
    const response = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares');
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const data = await response.json();
    
    const grouped: Record<string, any[]> = {};
    for (const item of data) {
      if (!grouped[item.casa]) {
        grouped[item.casa] = [];
      }
      grouped[item.casa].push(item);
    }
    
    const result: Record<string, any[]> = {};
    for (const casa in grouped) {
      result[casa] = grouped[casa].slice(-15);
    }
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.json(result);
  } catch (error) {
    console.error('Error fetching historico:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Ruta para indicadores macro
app.get("/api/macro", async (req, res) => {
  const SERIES_IDS = {
    reservas: "174.1_RRVAS_IDOS_0_0_36",
    baseMonetaria: "331.2_SALDO_BASERIA__15", // Usamos diaria para mejor disponibilidad
    emae: "302.2_S_ORIGINALRAL_0_M_21",
    badlar: "89.2_TS_INTELAR_0_D_20"
  };

  try {
    const fetchSeries = async (id: string) => {
      // Pedimos los últimos 5 registros para asegurarnos de encontrar uno no nulo
      const url = `https://apis.datos.gob.ar/series/api/series?ids=${id}&limit=5&sort=desc`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const json = await response.json();
      
      if (json && json.data && json.data.length > 0) {
        // Buscamos el primer registro donde el valor (índice 1) no sea null
        const latestValid = json.data.find((row: any[]) => row[1] !== null);
        if (latestValid) {
          return {
            data: [latestValid],
            meta: json.meta
          };
        }
      }
      return json;
    };

    const keys = Object.keys(SERIES_IDS);
    const results = await Promise.all(keys.map(key => fetchSeries((SERIES_IDS as any)[key])));
    
    const result: any = {
      timestamp: Date.now(),
      data: {}
    };

    results.forEach((data, index) => {
      const key = keys[index];
      if (data && data.data && data.data[0]) {
        // Buscamos el objeto meta que contiene el campo 'field'
        const metaWithField = data.meta.find((m: any) => m.field);
        if (metaWithField) {
          result.data[key] = {
            valor: data.data[0][1],
            fecha: data.data[0][0],
            unidades: metaWithField.field.units,
            descripcion: metaWithField.field.description
          };
        }
      }
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching macro data:", error);
    res.status(500).json({ error: "Failed to fetch macro indicators" });
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
