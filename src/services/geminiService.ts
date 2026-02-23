import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface MarketAlert {
  assetName: string;
  verdict: 'ENTRAR' | 'SALIR' | 'MANTENER';
  confidence: number;
  reliability: 'BAJA' | 'MEDIA' | 'ALTA';
  sources: string[];
  sourcesAnalyzedCount: number;
  dataCrossAnalysis: string;
  recommendedAction: string;
  stopLoss: string;
  timeframe: 'Corto' | 'Medio' | 'Largo';
}

export interface MarketStatus {
  alerts: MarketAlert[];
  isCalm: boolean;
  sourcesAnalyzedCount: number;
  timestamp: string;
}

const SYSTEM_INSTRUCTION = `Eres "CENTINELA FINANCIERO v4.5", un motor de búsqueda y análisis financiero de grado institucional. Tu objetivo es rastrear la totalidad del ecosistema digital para detectar oportunidades de inversión proactivas.

PROTOCOLO DE AUDITORÍA Y ESCANEO (ESTRICTO):
1. RASTREO MASIVO: Utiliza Google Search para identificar y procesar la mayor cantidad de fuentes posibles (mínimo 10 fuentes por búsqueda).
2. TRIANGULACIÓN: Cruza datos de diarios, foros especializados, boletines oficiales y terminales de precios.
3. VEREDICTO: Ofrece un veredicto claro de ENTRAR, SALIR o ESPERAR.
4. CONTADOR DE FUENTES: Debes llevar la cuenta exacta de cuántas fuentes has analizado.
5. FILTRADO DE CALIDAD: Selecciona las fuentes más influyentes para fundamentar tu reporte.

Si encuentras oportunidades reales, responde en formato JSON.
Si el mercado está en calma, informa que el sistema está operativo e indica cuántas fuentes analizaste.

IMPORTANTE: Siempre usa la herramienta googleSearch para obtener datos actualizados de hoy.`;

export async function performMarketScan(): Promise<MarketStatus> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `Realiza una auditoría y escaneo completo del mercado argentino y global hoy (${new Date().toLocaleDateString()}). 
  Busca oportunidades críticas en Acciones, Bonos, Letras, CEDEARs, Cripto y Dólar.
  
  Responde estrictamente en formato JSON con la siguiente estructura:
  {
    "alerts": [
      {
        "assetName": "Nombre del Activo",
        "verdict": "ENTRAR/SALIR/MANTENER",
        "confidence": 1-10,
        "reliability": "BAJA/MEDIA/ALTA",
        "sources": ["Fuente 1", "Fuente 2", "Fuente 3"],
        "sourcesAnalyzedCount": número total de fuentes rastreadas para este activo,
        "dataCrossAnalysis": "Conclusión del análisis masivo: qué dicen la mayoría de los sitios vs. los datos de precio",
        "recommendedAction": "Instrucción directa de qué hacer",
        "stopLoss": "Precio de venta de emergencia",
        "timeframe": "Corto/Medio/Largo"
      }
    ],
    "isCalm": boolean (true si no hay alertas significativas),
    "sourcesAnalyzedCount": número total de fuentes rastreadas en todo el ecosistema digital durante este escaneo
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      alerts: result.alerts || [],
      isCalm: result.isCalm ?? (result.alerts?.length === 0),
      sourcesAnalyzedCount: result.sourcesAnalyzedCount || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in market scan:", error);
    throw error;
  }
}
