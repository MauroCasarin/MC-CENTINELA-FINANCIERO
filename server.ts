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

// Función de respaldo final: Análisis sintético AVANZADO basado en reglas financieras
function generateSyntheticAnalysis(prompt: string): string {
  console.log(">>> ⚠️ Activando modo de supervivencia AVANZADO: Generando análisis sintético.");
  
  // 1. Extracción de Datos (Parsing Robusto)
  const dolarOficial = parseFloat(prompt.match(/Dólar Oficial: \$([\d\.]+)/)?.[1] || "0");
  const dolarBlue = parseFloat(prompt.match(/Dólar Blue: \$([\d\.]+)/)?.[1] || "0");
  const dolarMep = parseFloat(prompt.match(/Dólar MEP: \$([\d\.]+)/)?.[1] || "0");
  const inflacion = parseFloat(prompt.match(/Inflación.*: ([\d\.]+)%/)?.[1] || "0");
  const riesgoPais = parseFloat(prompt.match(/Riesgo País: ([\d\.]+)/)?.[1] || "0");
  
  // Extracción de TNA Plazo Fijo (tomamos el primero/más alto)
  const pfMatch = prompt.match(/Plazos Fijos.*?: ([\d\.]+)%/);
  const tnaPF = pfMatch ? parseFloat(pfMatch[1]) : 0;

  // 2. Cálculo de Indicadores Financieros
  const brecha = dolarOficial > 0 ? ((dolarBlue - dolarOficial) / dolarOficial * 100) : 0;
  const spreadMepBlue = dolarMep > 0 ? ((dolarBlue - dolarMep) / dolarMep * 100) : 0;
  
  // Tasa Real Mensual Aproximada: (TNA / 12) - Inflación Mensual
  const tasaMensualPF = tnaPF / 12;
  const tasaReal = tasaMensualPF - inflacion;
  
  // 3. Termómetro de Mercado (Análisis de Sentimiento por Keywords)
  const newsMatches = prompt.match(/- .+/g) || [];
  const topNews = newsMatches.slice(0, 8).map(n => n.replace('- ', '').trim());
  const lowerNews = topNews.join(" ").toLowerCase();

  let marketMood = "Neutral";
  let moodScore = 0; // -2 (Pánico) a +2 (Euforia)

  // Diccionario de palabras clave financieras argentinas
  if (lowerNews.match(/récord|dispara|salta|vuela|sube fuerte|alza|trepa/)) moodScore += 1;
  if (lowerNews.match(/baja|cede|cae|pierde|retrocede|estable|planchado/)) moodScore -= 1;
  if (lowerNews.match(/crisis|riesgo|deuda|fmi|default|cepo|restricción/)) moodScore -= 1;
  if (lowerNews.match(/acuerdo|superávit|inversión|bopreal|blanqueo|crédito/)) moodScore += 1;

  if (moodScore >= 2) marketMood = "Alcista / Volátil";
  else if (moodScore <= -2) marketMood = "Bajista / Aversión al Riesgo";
  else if (brecha < 20) marketMood = "Estabilidad Cambiaria";
  else marketMood = "Incertidumbre Moderada";

  // 4. Selección de Perfil de Estrategia
  let estrategia = "";
  let recomendacion = "";

  if (tasaReal > 0.5 && brecha < 25) {
    // Escenario: Tasa gana a inflación y dólar calmo -> CARRY TRADE
    estrategia = "Carry Trade Táctico";
    recomendacion = "Aprovechar tasas en pesos (Lecaps/PF) que superan a la inflación, monitoreando de cerca la brecha.";
  } else if (brecha > 40 || moodScore <= -2) {
    // Escenario: Brecha alta o pánico -> COBERTURA
    estrategia = "Cobertura Defensiva";
    recomendacion = "Priorizar dolarización de carteras vía MEP/Cedears ante la volatilidad cambiaria.";
  } else if (riesgoPais < 1200 && moodScore >= 1) {
    // Escenario: Riesgo bajo y buenas noticias -> RENTA VARIABLE
    estrategia = "Apuesta a Renta Variable";
    recomendacion = "Oportunidad en acciones del panel líder (Merval) y Bonos Soberanos ante la compresión del riesgo país.";
  } else {
    // Escenario: Incertidumbre o datos mixtos -> DIVERSIFICACIÓN
    estrategia = "Cautela y Diversificación";
    recomendacion = "Mantener cartera equilibrada: 50% cobertura dólar (Obligaciones Negociables) y 50% instrumentos CER/UVA.";
  }

  // 5. Generación del Reporte Estructurado
  const newsList = topNews.length > 0 
    ? topNews.slice(0, 4).map(n => `*   "${n}"`).join("\n")
    : "*   Sin noticias destacadas para el análisis.";

  return `**ANÁLISIS DE MERCADO (Modo Respaldo Avanzado)**

**🌡️ Termómetro del Mercado:**
El sentimiento actual es de **${marketMood}**.
${newsList}

**📊 Indicadores Clave:**
*   **Tasa Real:** ${tasaReal > 0 ? "🟢 Positiva" : "🔴 Negativa"} (${tasaReal.toFixed(2)}% mensual aprox). ${tasaReal > 0 ? "El plazo fijo gana poder de compra." : "La inflación licúa los ahorros en pesos."}
*   **Brecha Cambiaria:** ${brecha.toFixed(1)}%. ${brecha < 20 ? "Niveles bajos históricos." : "Niveles que requieren atención."}
*   **Arbitraje MEP/Blue:** ${spreadMepBlue.toFixed(1)}%. ${Math.abs(spreadMepBlue) > 3 ? "Oportunidad de arbitraje detectada." : "Precios alineados."}

**🎯 Veredicto: ${estrategia}**
${recomendacion}

*Nota: Este análisis fue generado mediante algoritmos de lógica financiera ante la indisponibilidad de los modelos neuronales principales.*`;
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
    const MAX_REQUEST_TIME = 25000; // Aumentamos un poco para dar tiempo a la búsqueda

    for (const idx of indices) {
      const apiKey = potentialKeys[idx];
      const keyName = foundNames[idx];
      
      try {
        if (Date.now() - startTime > MAX_REQUEST_TIME) break;
        
        const ai = new GoogleGenAI({ apiKey });
        let response = null;
        
        // Usamos gemini-2.5-flash que soporta búsqueda
        const model = "gemini-2.5-flash";
        
        try {
          console.log(`>>> [${keyName}] Probando Gemini: ${model} con Google Search`);
          response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              tools: [{ googleSearch: {} }],
            }
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
      } catch (error: any) {
        console.error(`[${keyName}] Error Gemini:`, error.message);
      }
    }
  }

  // --- INTENTO 2: GROQ (Fallback) ---
  const groqText = await callGroq(prompt);
  if (groqText) {
    analysisCache.set(normalizedPrompt, { text: groqText, timestamp: Date.now() });
    return { text: groqText, source: "groq" };
  }
  
  // --- INTENTO 3: SUPERVIVENCIA (Sintético) ---
  // Si todo falla, generamos un análisis sintético para no mostrar error
  // IMPORTANTE: No lanzar error aquí, devolver el objeto directamente
  const syntheticText = generateSyntheticAnalysis(prompt);
  return { text: syntheticText, source: "synthetic" };
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
