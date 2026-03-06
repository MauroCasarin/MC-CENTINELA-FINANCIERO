import { useState, useEffect, useRef, RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Loader2, AlertCircle, Newspaper, ChevronRight, ChevronLeft, TrendingUp, Brain, Sparkles, RefreshCw, BarChart3, Activity, Cpu, Zap, X } from 'lucide-react';
import { NewsItem } from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbyXl8OB3W2nNyMRZJefyjsfJzYVUgBLAQDTSVCefEC2iUBUUlf3kKRCbIM5y0VA3kizdw/exec";
const DOLAR_API_URL = "https://dolarapi.com/v1/dolares/oficial";
const DOLAR_BLUE_API_URL = "https://dolarapi.com/v1/dolares/blue";
const DOLAR_MEP_API_URL = "https://dolarapi.com/v1/dolares/bolsa";
const DOLAR_CCL_API_URL = "https://dolarapi.com/v1/dolares/contadoconliqui";
const DOLAR_MAYORISTA_API_URL = "https://dolarapi.com/v1/dolares/mayorista";
const DOLAR_CRIPTO_API_URL = "https://dolarapi.com/v1/dolares/cripto";
const RIESGO_PAIS_API_URL = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais";
const INFLACION_API_URL = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const PLAZO_FIJO_API_URL = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo";
const BILLETERAS_FCI_ULTIMO = "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo";
const BILLETERAS_FCI_PENULTIMO = "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/penultimo";
const BILLETERAS_RENDIMIENTOS = "https://api.argentinadatos.com/v1/finanzas/rendimientos";
const ORO_API_URL = "https://api.gold-api.com/price/XAU";
const AMBITO_GENERAL_URL = "https://mercados.ambito.com/home/general";

const TypewriterText = ({ text, speed = 50 }: { text: string, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

const DottedProgress = ({ size = 100 }: { size?: number }) => {
  const dots = 24;
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {[...Array(dots)].map((_, i) => {
          const angle = (i / dots) * 2 * Math.PI;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={2}
              initial={{ opacity: 0.2, fill: "#cbd5e1", scale: 1 }}
              animate={{
                opacity: [0.2, 1, 1, 0.2],
                fill: ["#cbd5e1", "#2563eb", "#2563eb", "#cbd5e1"],
                scale: [1, 1.4, 1.4, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.06,
                times: [0, 0.2, 0.7, 1],
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [dolar, setDolar] = useState<{compra: number, venta: number, timestamp?: string} | null>(null);
  const [dolarBlue, setDolarBlue] = useState<{compra: number, venta: number, timestamp?: string} | null>(null);
  const [dolarMep, setDolarMep] = useState<{compra: number, venta: number, timestamp?: string} | null>(null);
  const [dolarCcl, setDolarCcl] = useState<{compra: number, venta: number, timestamp?: string} | null>(null);
  const [dolarMayorista, setDolarMayorista] = useState<{compra: number, venta: number, timestamp?: string} | null>(null);
  const [dolarCripto, setDolarCripto] = useState<{compra: number, venta: number, timestamp?: string} | null>(null);
  const [riesgoPais, setRiesgoPais] = useState<{valor: number, fecha: string, timestamp?: string} | null>(null);
  const [inflacion, setInflacion] = useState<{valor: number, fecha: string} | null>(null);
  const [plazosFijos, setPlazosFijos] = useState<any[]>([]);
  const [billeteras, setBilleteras] = useState<any[]>([]);
  const [oro, setOro] = useState<{valor: number, timestamp?: string} | null>(null);
  const [merval, setMerval] = useState<{valor: number, variacion: number, timestamp?: string} | null>(null);
  const [bonos, setBonos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analysisDate, setAnalysisDate] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isYieldsOpen, setIsYieldsOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [showUpdateFlash, setShowUpdateFlash] = useState(false);

  const getLoadingState = (p: number) => {
    if (p < 35) return { text: "Calculando métricas...", icon: Activity };
    if (p < 45) return { text: "Capturando cotizaciones...", icon: TrendingUp };
    if (p < 55) return { text: "Sincronizando noticias del mercados...", icon: Newspaper };
    if (p < 90) return { text: "Preparando motor...", icon: Cpu };
    return { text: "Iniciando sistema...", icon: Zap };
  };

  const [displayedAnalysis, setDisplayedAnalysis] = useState<string>("");

  useEffect(() => {
    if (aiAnalysis) {
      setDisplayedAnalysis("");
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedAnalysis((prev) => prev + aiAnalysis.charAt(i));
        i++;
        if (i >= aiAnalysis.length) {
          clearInterval(intervalId);
        }
      }, 15); // Speed of typewriter effect
      return () => clearInterval(intervalId);
    }
  }, [aiAnalysis]);

  const generateAIAnalysis = async (currentData: any) => {
    setIsAnalyzing(true);
    try {
      const prompt = `
        ROL
        Actúa como Senior Portfolio Manager de un Hedge Fund especializado en Argentina. Tu análisis debe ser quirúrgico, técnico y sin rodeos.

        DASHBOARD DE MERCADO (DATOS DUROS)
        Dólares: Blue $${currentData.dolarBlue?.venta} | MEP $${currentData.dolarMep?.venta} | CCL $${currentData.dolarCcl?.venta} | Brecha: ${currentData.brecha}%
        Renta Variable (MERVAL): Indice en $${currentData.merval?.valor?.toLocaleString()} ARS (${currentData.merval?.variacion?.toFixed(2)}% diario).
        Renta Fija y Lecaps: ${currentData.bonos?.map((b: any) => `${b.nombre}: $${b.valor}`).join(' | ')}.
        Riesgo País: ${currentData.riesgoPais?.valor} bps | Inflación: ${currentData.inflacion?.valor}% mensual.
        Tasas: TNA Plazo Fijo ${currentData.plazosFijos?.[0]?.tna * 100}% | Tasa Real Proyectada: ${currentData.tasaReal?.toFixed(2)}%.
        Oro (Gramo local): $${currentData.oro?.valor?.toFixed(0)}.

        CONTEXTO DE NOTICIAS
        ${currentData.news?.slice(0, 20).map((n: any) => `- ${n.titulo || n.title}`).join('\n')}

        OBJETIVOS DE ANÁLISIS
        Tu misión es integrar TODA la información disponible (Métricas, Mercado, Rendimientos y Noticias) para generar un VERDICTO ÚNICO y COHESIVO.
        NO detalles el análisis de cada sección por separado. Ve directo a la conclusión estratégica.
        
        IMPORTANTE: Si algún dato falta o es nulo, IGNÓRALO y continúa con lo que sí tienes. NUNCA digas "faltan datos" o "imposible evaluar". Asume que la información provista es suficiente para tomar una postura.

        PREGUNTAS CLAVE A RESPONDER EN TU VERDICTO:
        1. Diagnóstico de Ciclo: ¿Es momento de Tasa (Carry Trade) o de Dolarización?
        2. Oportunidades: ¿Dónde está la ganancia real hoy? (Bonos, Acciones, Lecaps o Cauciones).
        3. Portafolio Táctico: Define una asignación de activos clara para hoy.

        FORMATO DE SALIDA
        Responde exclusivamente en Markdown profesional.
        Estructura tu respuesta en 3 bloques breves: "Diagnóstico", "Estrategia" y "Portafolio".
        Máximo 200 palabras.
        Tono: Ejecutivo financiero senior (directo, sin obviedades).
        Finaliza con una 'Alerta de Riesgo' de una sola línea.
      `;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al conectar con el servidor de análisis.");
      }

      const data = await response.json();
      setAiAnalysis(data.text || "No se pudo generar el análisis en este momento.");
      setAnalysisDate(new Date().toLocaleString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      setAiAnalysis(`Error: ${err.message || "Error al procesar el análisis."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cleanEntityName = (name: string) => {
    if (!name) return '';
    
    // 1. Fix common encoding issues (UTF-8 bytes interpreted as Latin-1)
    let fixed = name
      .replace(/Ã\u008D/g, 'Í')
      .replace(/Ã\u0091/g, 'Ñ')
      .replace(/Ã\u0093/g, 'Ó')
      .replace(/Ã\u0081/g, 'Á')
      .replace(/Ã\u0089/g, 'É')
      .replace(/Ã\u009A/g, 'Ú')
      .replace(/Ã\u00AD/g, 'í')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã³/g, 'ó')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ãº/g, 'ú')
      .replace(/CRÃDITO/gi, 'CRÉDITO') // Specific fix for user's example
      .replace(/Ã/g, 'Ñ'); // Catch-all for remaining Ã (often Ñ)

    // 2. Shorten and clean
    let cleaned = fixed
      .replace(/COMPAÑIA FINANCIERA/gi, '')
      .replace(/COMPAÑÍA FINANCIERA/gi, '')
      .replace(/S\.A\.U\./gi, '')
      .replace(/S\.A\./gi, '')
      .replace(/S\.A/gi, '')
      .replace(/BANCO/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 3. Title Case
    cleaned = cleaned.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // 4. Specific manual overrides for better display
    if (cleaned.includes('Credito Regional')) return 'Crédito Regional';
    if (cleaned.includes('Reba')) return 'Reba';
    if (cleaned.includes('Galicia')) return 'Galicia';
    if (normalizedIncludes(cleaned, 'Delsol')) return 'Banco del Sol';
    
    return cleaned;
  };

  const normalizedIncludes = (str: string, search: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .includes(search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

  const getEntityUrl = (name: string) => {
    const normalized = name.toLowerCase();
    // Billeteras
    if (normalizedIncludes(name, 'mercado pago')) return 'https://www.mercadopago.com.ar';
    if (normalizedIncludes(name, 'uala')) return 'https://www.uala.com.ar';
    if (normalizedIncludes(name, 'personal pay')) return 'https://www.personalpay.com.ar';
    if (normalizedIncludes(name, 'naranja')) return 'https://www.naranjax.com';
    if (normalizedIncludes(name, 'prex')) return 'https://www.prexcard.com.ar';
    if (normalizedIncludes(name, 'fiwind')) return 'https://www.fiwind.io';
    if (normalizedIncludes(name, 'belo')) return 'https://www.belo.app';
    if (normalizedIncludes(name, 'lemon')) return 'https://www.lemon.me';
    if (normalizedIncludes(name, 'letsbit')) return 'https://letsbit.io';
    if (normalizedIncludes(name, 'buenbit')) return 'https://www.buenbit.com';
    if (normalizedIncludes(name, 'reba')) return 'https://www.reba.com.ar';
    
    // Bancos
    if (normalizedIncludes(name, 'galicia')) return 'https://www.galicia.ar';
    if (normalizedIncludes(name, 'santander')) return 'https://www.santander.com.ar';
    if (normalizedIncludes(name, 'bbva') || normalizedIncludes(name, 'frances')) return 'https://www.bbva.com.ar';
    if (normalizedIncludes(name, 'nacion')) return 'https://www.bna.com.ar';
    if (normalizedIncludes(name, 'macro')) return 'https://www.macro.com.ar';
    if (normalizedIncludes(name, 'hsbc')) return 'https://www.hsbc.com.ar';
    if (normalizedIncludes(name, 'icbc')) return 'https://www.icbc.com.ar';
    if (normalizedIncludes(name, 'ciudad')) return 'https://www.bancociudad.com.ar';
    if (normalizedIncludes(name, 'provincia')) return 'https://www.bancoprovincia.com.ar';
    if (normalizedIncludes(name, 'supervielle')) return 'https://www.supervielle.com.ar';
    if (normalizedIncludes(name, 'hipotecario')) return 'https://www.hipotecario.com.ar';
    if (normalizedIncludes(name, 'patagonia')) return 'https://www.bancopatagonia.com.ar';
    if (normalizedIncludes(name, 'comafi')) return 'https://www.comafi.com.ar';
    if (normalizedIncludes(name, 'credicoop')) return 'https://www.bancocredicoop.coop';
    if (normalizedIncludes(name, 'bancor') || normalizedIncludes(name, 'cordoba')) return 'https://www.bancor.com.ar';
    if (normalizedIncludes(name, 'banco del sol') || normalizedIncludes(name, 'delsol')) return 'https://www.bancodelsol.com';
    if (normalizedIncludes(name, 'bica')) return 'https://www.bancobica.com.ar';
    if (normalizedIncludes(name, 'cmf')) return 'https://www.bancocmf.com.ar';
    if (normalizedIncludes(name, 'meridian')) return 'https://www.bancomeridian.com.ar';
    if (normalizedIncludes(name, 'voii')) return 'https://www.voii.com.ar';
    if (normalizedIncludes(name, 'chubut')) return 'https://www.bancochubut.com.ar';
    if (normalizedIncludes(name, 'santa fe')) return 'https://www.bancosantafe.com.ar';
    if (normalizedIncludes(name, 'entre rios')) return 'https://www.bancoentrerios.com.ar';
    if (normalizedIncludes(name, 'san juan')) return 'https://www.bancosanjuan.com';
    if (normalizedIncludes(name, 'santa cruz')) return 'https://www.bancosantacruz.com';
    if (normalizedIncludes(name, 'industrial') || normalizedIncludes(name, 'bind')) return 'https://www.bind.com.ar';
    if (normalizedIncludes(name, 'piano')) return 'https://www.bancopiano.com.ar';
    if (normalizedIncludes(name, 'roela')) return 'https://www.bancoroela.com.ar';
    if (normalizedIncludes(name, 'saenz')) return 'https://www.bancosaenz.com.ar';
    if (normalizedIncludes(name, 'columbia')) return 'https://www.bancocolumbia.com.ar';
    if (normalizedIncludes(name, 'credito regional')) return 'https://www.creditoregional.com.ar/CRInstitucional/inicio';
    
    return '#';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setProgress(0);
        // Small delay to show initial state
        await new Promise(r => setTimeout(r, 800));
        
        setProgress(35);
        // Fetch News
        const newsResponse = await fetch(API_URL);
        if (!newsResponse.ok) throw new Error(`Failed to fetch news: ${newsResponse.statusText}`);
        const newsData = await newsResponse.json();
        setProgress(45);
        
        // Process News Data
        let items: NewsItem[] = [];
        if (newsData.noticias && Array.isArray(newsData.noticias)) {
          items = newsData.noticias;
        } else if (Array.isArray(newsData)) {
          items = newsData;
        } else if (newsData && typeof newsData === 'object') {
          if (Array.isArray(newsData.data)) items = newsData.data;
          else if (Array.isArray(newsData.items)) items = newsData.items;
          else if (Array.isArray(newsData.news)) items = newsData.news;
          else items = [newsData];
        }

        // Deduplicate items
        const uniqueItems: NewsItem[] = [];
        const seenTitles = new Set<string>();
        for (const item of items) {
           const title = item.titulo || item.title || item.headline;
           const normalizedTitle = String(title || '').trim().toLowerCase();
           if (normalizedTitle && !seenTitles.has(normalizedTitle)) {
             seenTitles.add(normalizedTitle);
             uniqueItems.push(item);
           }
        }
        setNews(uniqueItems);

        // Fetch Financial Data (Non-blocking)
        const fetchJsonSafe = async (url: string) => {
            try {
                const res = await fetch(url);
                if (!res.ok) return null;
                return await res.json();
            } catch (e) {
                console.warn(`Error fetching ${url}:`, e);
                return null;
            }
        };

        try {
            const [oficial, blue, mep, ccl, mayorista, cripto, riesgo, inflacion, pf, fciUltimo, fciPenultimo, rendimientos, oroData, ambitoData] = await Promise.all([
                fetchJsonSafe(DOLAR_API_URL),
                fetchJsonSafe(DOLAR_BLUE_API_URL),
                fetchJsonSafe(DOLAR_MEP_API_URL),
                fetchJsonSafe(DOLAR_CCL_API_URL),
                fetchJsonSafe(DOLAR_MAYORISTA_API_URL),
                fetchJsonSafe(DOLAR_CRIPTO_API_URL),
                fetchJsonSafe(RIESGO_PAIS_API_URL),
                fetchJsonSafe(INFLACION_API_URL),
                fetchJsonSafe(PLAZO_FIJO_API_URL),
                fetchJsonSafe(BILLETERAS_FCI_ULTIMO),
                fetchJsonSafe(BILLETERAS_FCI_PENULTIMO),
                fetchJsonSafe(BILLETERAS_RENDIMIENTOS),
                fetchJsonSafe(ORO_API_URL),
                fetchJsonSafe(AMBITO_GENERAL_URL)
            ]);

            setProgress(55);
            const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

            if (oficial) setDolar({ ...oficial, timestamp: now });
            if (blue) setDolarBlue({ ...blue, timestamp: now });
            if (mep) setDolarMep({ ...mep, timestamp: now });
            if (ccl) setDolarCcl({ ...ccl, timestamp: now });
            if (mayorista) setDolarMayorista({ ...mayorista, timestamp: now });
            if (cripto) setDolarCripto({ ...cripto, timestamp: now });
            
            let parsedMerval = null;
            let parsedRiesgoPais = null;

            if (ambitoData && Array.isArray(ambitoData)) {
                const mervalItem = ambitoData.find((item: any) => item.nombre === "S&P Merval");
                if (mervalItem) {
                    const valorStr = mervalItem.val1 || mervalItem.ultimo;
                    const variacionStr = mervalItem.variacion;
                    if (valorStr && variacionStr) {
                        const valor = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
                        const variacion = parseFloat(variacionStr.replace('%', '').replace(',', '.'));
                        parsedMerval = { valor, variacion, timestamp: now };
                        setMerval(parsedMerval);
                    }
                }
            }

            // Bonos API is currently unavailable, setting to empty array
            setBonos([]);
            
            if (oroData && blue) {
                // Convert global gold price (oz) to local gram price: (Price * Blue) / 31.1035
                const pricePerGram = (oroData.price * blue.venta) / 31.1035;
                setOro({ valor: pricePerGram, timestamp: now });
            }

            if (riesgo && Array.isArray(riesgo) && riesgo.length > 0) {
                parsedRiesgoPais = { ...riesgo[riesgo.length - 1], timestamp: now };
                setRiesgoPais(parsedRiesgoPais);
            } else if (ambitoData && Array.isArray(ambitoData)) {
                // Fallback to Ambito for Riesgo Pais if argentinadatos fails
                const riesgoPaisItem = ambitoData.find((item: any) => item.nombre === "Riesgo País" || item.nombre === "Riesgo Pa\u00eds");
                if (riesgoPaisItem) {
                    const valor = parseFloat(riesgoPaisItem.val1.replace(/\./g, '').replace(',', '.'));
                    parsedRiesgoPais = { valor, fecha: riesgoPaisItem.fecha, timestamp: now };
                    setRiesgoPais(parsedRiesgoPais);
                }
            }
            
            if (inflacion) {
                const lastValue = Array.isArray(inflacion) ? inflacion[inflacion.length - 1] : null;
                setInflacion(lastValue);
            }
            
            // Trigger update flash
            setShowUpdateFlash(true);
            setTimeout(() => setShowUpdateFlash(false), 5000);
            
            let sortedPF: any[] = [];
            if (pf) {
                // Sort by TNA desc and take top 4
                if (Array.isArray(pf) && pf.length > 0) {
                    sortedPF = pf
                        .filter((item: any) => item.tnaClientes > 0)
                        .sort((a: any, b: any) => b.tnaClientes - a.tnaClientes)
                        .slice(0, 4)
                        .map((item: any) => ({
                            entidad: item.entidad,
                            tna: item.tnaClientes 
                        }));
                    setPlazosFijos(sortedPF);
                }
            }

            // Client-side Billeteras Calculation
            const fciMapping: Record<string, string> = {
                'Mercado Pago': 'Mercado Fondo - Clase A',
                'Ualá': 'Ualintec Ahorro Pesos - Clase A',
                'Personal Pay': 'Delta Pesos - Clase A',
                'Prex': 'Allaria Ahorro - Clase A',
                'Galicia': 'Fima Premium - Clase A'
            };

            const walletRates: any[] = [];

            if (fciUltimo && fciPenultimo) {
                for (const [walletName, fciName] of Object.entries(fciMapping)) {
                    const ultimo = Array.isArray(fciUltimo) ? fciUltimo.find((f: any) => f.fondo === fciName) : null;
                    const penultimo = Array.isArray(fciPenultimo) ? fciPenultimo.find((f: any) => f.fondo === fciName) : null;

                    if (ultimo && penultimo && ultimo.vcp && penultimo.vcp && ultimo.fecha && penultimo.fecha) {
                        const vcpUltimo = parseFloat(ultimo.vcp);
                        const vcpPenultimo = parseFloat(penultimo.vcp);
                        const diffTime = Math.abs(new Date(ultimo.fecha).getTime() - new Date(penultimo.fecha).getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                        const tna = ((vcpUltimo / vcpPenultimo) - 1) * (365 / diffDays) * 100;

                        walletRates.push({
                            entidad: walletName,
                            tna: parseFloat(tna.toFixed(2)),
                            type: 'FCI'
                        });
                    }
                }
            }

            if (Array.isArray(rendimientos)) {
                rendimientos.forEach((entity: any) => {
                    const arsRendimiento = entity.rendimientos.find((r: any) => r.moneda === 'ARS');
                    if (arsRendimiento) {
                        walletRates.push({
                            entidad: entity.entidad.charAt(0).toUpperCase() + entity.entidad.slice(1),
                            tna: parseFloat(arsRendimiento.apy),
                            type: 'Remunerada'
                        });
                    }
                });
            }

            walletRates.sort((a, b) => b.tna - a.tna);
            const topWallets = walletRates.slice(0, 4);
            setBilleteras(topWallets);

            setProgress(90);
            // Small delay to show final state
            await new Promise(r => setTimeout(r, 800));
            setProgress(100);
            // AI Analysis is now manual via button
          } catch (e) {
            console.error("Error fetching financial data:", e);
          }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group news by source
  const groupedNews = news.reduce((acc, item) => {
    let sourceName = item.fuente || item.source || item.sourceName || 'Otras Fuentes';
    if (typeof sourceName === 'object') {
        sourceName = sourceName.name || 'Otras Fuentes';
    }
    // Capitalize first letter just in case
    sourceName = String(sourceName).charAt(0).toUpperCase() + String(sourceName).slice(1);
    
    if (!acc[sourceName]) {
      acc[sourceName] = [];
    }
    acc[sourceName].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  const pfScrollRef = useRef<HTMLDivElement>(null);
  const billScrollRef = useRef<HTMLDivElement>(null);
  const newsScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getMonthName = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-AR', { month: 'long' }).toUpperCase();
    } catch (e) {
      return '';
    }
  };

  const topPF = plazosFijos.length > 0 ? plazosFijos[0].tna : 0;
  const ipcMensual = inflacion?.valor || 0;
  const tasaReal = ipcMensual > 0 ? (((1 + (topPF / 12)) / (1 + (ipcMensual / 100))) - 1) * 100 : 0;

  if (loading) {
    const currentState = getLoadingState(progress);
    const CurrentIcon = currentState.icon;

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <div className="relative mb-8 flex items-center justify-center">
          {/* Dotted Circular Progress (Continuous Loop) */}
          <DottedProgress size={130} />
          
          {/* Central Pulsing Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1], 
                 opacity: [0.9, 1, 0.9],
                 boxShadow: [
                   "0 0 0px rgba(37, 99, 235, 0)",
                   "0 0 20px rgba(37, 99, 235, 0.2)",
                   "0 0 0px rgba(37, 99, 235, 0)"
                 ]
               }}
               transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
               className="p-4 bg-white rounded-full shadow-xl border border-blue-100 z-10"
             >
               <BarChart3 className="w-9 h-9 text-blue-600" />
             </motion.div>
          </div>
        </div>
        
        <div className="h-16 flex flex-col items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentState.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <CurrentIcon className="w-5 h-5 text-blue-500" />
              <p className="text-lg font-bold text-gray-800 text-center tracking-tight">
                {currentState.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-blue-600 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Moving shine effect */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
        
        <p className="text-[10px] text-gray-400 mt-6 tracking-[0.2em] uppercase font-bold opacity-40">
          Terminal de Datos Financieros
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-500 p-4 text-center">
        <AlertCircle className="w-10 h-10 mb-4" />
        <h3 className="text-lg font-semibold">Error al cargar noticias</h3>
        <p className="max-w-md mt-2 text-sm opacity-80">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <p>No se encontraron noticias.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 space-y-6">
      {/* Iframe Modal */}
      <AnimatePresence>
        {iframeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-[92vh] md:h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                  {iframeUrl && (
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${new URL(iframeUrl).hostname}&sz=64`} 
                      alt="favicon" 
                      className="w-5 h-5 rounded-sm shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vista Externa de Datos</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIframeUrl(null)}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-gray-100 relative overflow-y-auto custom-scrollbar">
                <iframe 
                  src={iframeUrl} 
                  className="w-full h-full border-none min-h-[100%]"
                  title="External Content"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* AI Strategy Container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 rounded-2xl shadow-xl overflow-hidden text-white"
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <Brain className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
                Estrategias IA
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </h2>
              <div className="flex items-center gap-2">
                 <p className="text-xs text-blue-100/70 font-medium uppercase tracking-wider">
                    Análisis Financiero en Tiempo Real
                    {analysisDate && <span className="text-blue-200 ml-1 normal-case">({analysisDate})</span>}
                 </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
                const brechaVal = dolar && dolarBlue ? ((dolarBlue.venta - dolar.venta) / dolar.venta * 100).toFixed(1) : null;
                generateAIAnalysis({
                    dolar, dolarBlue, dolarMep, dolarCcl, dolarCripto, dolarMayorista, riesgoPais, inflacion, plazosFijos, billeteras, news,
                    oro, brecha: brechaVal, tasaReal, merval, bonos
                });
            }}
            disabled={isAnalyzing}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="Actualizar análisis"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-6 relative min-h-[120px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <Brain className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" />
              </div>
              <p className="text-sm font-medium text-blue-100 min-h-[1.25rem]">
                <TypewriterText text="Cruzando datos y noticias..." speed={40} />
                <span className="inline-block w-1 h-4 bg-blue-300 ml-1 animate-pulse align-middle"></span>
              </p>
            </div>
          ) : aiAnalysis ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-invert prose-sm max-w-none"
            >
              <div className="whitespace-pre-wrap text-blue-50 leading-relaxed text-sm font-medium">
                {displayedAnalysis}
                <span className="animate-pulse inline-block w-1.5 h-4 bg-blue-400 ml-1 align-middle"></span>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <button 
                onClick={() => {
                  const brechaVal = dolar && dolarBlue ? ((dolarBlue.venta - dolar.venta) / dolar.venta * 100).toFixed(1) : null;
                  generateAIAnalysis({
                      dolar, dolarBlue, dolarMep, dolarCcl, dolarCripto, dolarMayorista, riesgoPais, inflacion, plazosFijos, billeteras, news,
                      oro, brecha: brechaVal, tasaReal, merval, bonos
                  });
                }}
                className="px-8 py-3 bg-white text-blue-700 rounded-full font-bold text-sm shadow-xl hover:bg-blue-50 transition-all flex items-center gap-2 group"
              >
                <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
                ANALIZAR MERCADO
              </button>
            </div>
          )}
          
          {/* Decorative elements */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl"></div>
        </div>
      </motion.div>

      {/* Metrics Container */}
      <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center px-4 shrink-0">
           <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Metricas</h2>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* IPC */}
            <div className="flex items-center gap-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Activity className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">{inflacion?.valor || '0'}%</span>
                  <span className="text-xs font-bold text-rose-600 uppercase">IPC</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-medium">
                  Inflación {getMonthName(inflacion?.fecha || '')}
                </span>
              </div>
            </div>

            {/* Riesgo Pais */}
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">{riesgoPais?.valor || '0'}</span>
                  <span className="text-xs font-bold text-orange-600 uppercase">RIESGO PAÍS</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-medium">
                  Nivel de riesgo inversor
                </span>
              </div>
            </div>

            {/* Tasa Real */}
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${tasaReal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tasaReal.toFixed(2)}%
                  </span>
                  <span className="text-xs font-bold text-emerald-600 uppercase">Tasa Real</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-medium">
                  Poder adquisitivo
                </span>
              </div>
            </div>
        </div>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1">
            <span className="font-semibold">Fuente:</span> INDEC (IPC) y JP Morgan (Riesgo). Último dato oficial disponible.
        </div>
      </div>

      {/* Financial Indicators Container */}
      <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center px-4 shrink-0">
           <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
           <button 
             onClick={() => setIframeUrl('https://cotizaciones-fawn.vercel.app/')}
             className="relative flex items-center gap-2 group px-2 py-1 rounded-md hover:bg-blue-50 transition-all duration-300"
           >
             <div className="flex items-center gap-1.5">
               <span className="font-bold text-gray-800 text-sm uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                 Mercado
               </span>
               <div className="flex items-center gap-1">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 <span className="text-[9px] font-bold text-green-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">En Vivo</span>
               </div>
             </div>
             <motion.div
               whileHover={{ scale: 1.2, x: 2, y: -2 }}
               className="text-gray-400 group-hover:text-blue-600 transition-colors"
             >
               <ExternalLink className="w-3.5 h-3.5" />
             </motion.div>
             
             {/* Tooltip hint */}
             <div className="absolute left-0 -bottom-8 hidden group-hover:block bg-gray-900 text-white text-[9px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none font-bold uppercase tracking-widest border border-white/10">
               Click para expandir terminal
             </div>
           </button>
        </div>
        
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Fila 0: MERVAL, ORO y Dólares */}
            {merval && (
               <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <span className="text-indigo-600">MERVAL</span>
                    <span>${merval.valor.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                    <span className={`text-[10px] ${merval.variacion >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {merval.variacion >= 0 ? '+' : ''}{merval.variacion}%
                    </span>
                 </div>
                 <div className="flex flex-col mt-0.5">
                   <span className="text-[9px] text-gray-500 font-medium">S&P Merval ARS - Índice bursátil local</span>
                   <span className="text-[8px] text-gray-400">Ref: {merval.timestamp}hs</span>
                   {showUpdateFlash && (
                     <motion.span 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="text-[8px] text-yellow-600 font-bold"
                     >
                       Actualización automática: {merval.timestamp}hs
                     </motion.span>
                   )}
                 </div>
               </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                <span className="text-yellow-700">ORO</span>
                <span>{oro ? `$${oro.valor.toLocaleString('es-AR', { maximumFractionDigits: 0 })}` : 'Cargando...'}</span>
              </div>
              <div className="flex flex-col mt-0.5">
                <span className="text-[9px] text-gray-500 font-medium">Gramo local - Cotización pesificada</span>
                <span className="text-[8px] text-gray-400">Ref: {oro?.timestamp}hs</span>
                {showUpdateFlash && oro && (
                  <motion.span 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[8px] text-yellow-600 font-bold"
                  >
                    Actualización automática: {oro.timestamp}hs
                  </motion.span>
                )}
              </div>
            </div>

            {dolar && (
               <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <span className="text-green-600">OFICIAL</span>
                    <span>${dolar.venta}</span>
                 </div>
                 <div className="flex flex-col mt-0.5">
                   <span className="text-[9px] text-gray-500 font-medium">BNA Venta - Cotización Banco Nación</span>
                   <span className="text-[8px] text-gray-400">Ref: {dolar.timestamp}hs</span>
                   {showUpdateFlash && (
                     <motion.span 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="text-[8px] text-yellow-600 font-bold"
                     >
                       Actualización automática: {dolar.timestamp}hs
                     </motion.span>
                   )}
                 </div>
               </div>
            )}
            
            {dolarBlue && (
               <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <span className="text-blue-600">BLUE</span>
                    <span>${dolarBlue.venta}</span>
                 </div>
                 <div className="flex flex-col mt-0.5">
                   <span className="text-[9px] text-gray-500 font-medium">Informal - Mercado paralelo</span>
                   <span className="text-[8px] text-gray-400">Ref: {dolarBlue.timestamp}hs</span>
                   {showUpdateFlash && (
                     <motion.span 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="text-[8px] text-yellow-600 font-bold"
                     >
                       Actualización automática: {dolarBlue.timestamp}hs
                     </motion.span>
                   )}
                 </div>
               </div>
            )}

            {dolarCripto && (
               <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <span className="text-yellow-600">CRIPTO</span>
                    <span>${dolarCripto.venta}</span>
                 </div>
                 <div className="flex flex-col mt-0.5">
                   <span className="text-[9px] text-gray-500 font-medium">USDT/USDC - Paridad estable</span>
                   <span className="text-[8px] text-gray-400">Ref: {dolarCripto.timestamp}hs</span>
                   {showUpdateFlash && (
                     <motion.span 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="text-[8px] text-yellow-600 font-bold"
                     >
                       Actualización automática: {dolarCripto.timestamp}hs
                     </motion.span>
                   )}
                 </div>
               </div>
            )}

            {dolarMep && (
               <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <span className="text-orange-500">MEP</span>
                    <span>${dolarMep.venta}</span>
                 </div>
                 <div className="flex flex-col mt-0.5">
                   <span className="text-[9px] text-gray-500 font-medium">Dólar Bolsa - Operativa bonos</span>
                   <span className="text-[8px] text-gray-400">Ref: {dolarMep.timestamp}hs</span>
                   {showUpdateFlash && (
                     <motion.span 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="text-[8px] text-yellow-600 font-bold"
                     >
                       Actualización automática: {dolarMep.timestamp}hs
                     </motion.span>
                   )}
                 </div>
               </div>
            )}

            {dolarCcl && (
               <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <span className="text-purple-600">CCL</span>
                    <span>${dolarCcl.venta}</span>
                 </div>
                 <div className="flex flex-col mt-0.5">
                   <span className="text-[9px] text-gray-500 font-medium">Liqui - Contado con Liquidación</span>
                   <span className="text-[8px] text-gray-400">Ref: {dolarCcl.timestamp}hs</span>
                   {showUpdateFlash && (
                     <motion.span 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="text-[8px] text-yellow-600 font-bold"
                     >
                       Actualización automática: {dolarCcl.timestamp}hs
                     </motion.span>
                   )}
                 </div>
               </div>
            )}

            {dolarMayorista && (
               <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <span className="text-gray-700">MAYORISTA</span>
                    <span>${dolarMayorista.venta}</span>
                 </div>
                 <div className="flex flex-col mt-0.5">
                   <span className="text-[9px] text-gray-500 font-medium">Comex - Comercio exterior</span>
                   <span className="text-[8px] text-gray-400">Ref: {dolarMayorista.timestamp}hs</span>
                   {showUpdateFlash && (
                     <motion.span 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="text-[8px] text-yellow-600 font-bold"
                     >
                       Actualización automática: {dolarMayorista.timestamp}hs
                     </motion.span>
                   )}
                 </div>
               </div>
            )}
        </div>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1">
            <span className="font-semibold">Fuente:</span> Cotizaciones con retraso de 20min aprox. (Ámbito, DolarApi y Mercados).
        </div>
      </div>

      {/* Yields Container */}
      <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <button 
          onClick={() => setIsYieldsOpen(!isYieldsOpen)}
          className="h-9 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 hover:bg-gray-100 transition-colors w-full text-left"
        >
           <div className="flex items-center">
             <TrendingUp className="w-4 h-4 text-indigo-600 mr-2" />
             <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Rendimientos (TNA)</h2>
           </div>
           <motion.div
             animate={{ rotate: isYieldsOpen ? 180 : 0 }}
             transition={{ duration: 0.3 }}
           >
             <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
           </motion.div>
        </button>
        
        <AnimatePresence>
          {isYieldsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col divide-y divide-gray-100">
                  {/* Plazos Fijos Row */}
                  <div className="flex items-center px-4 py-2 overflow-hidden h-12 relative group/pf">
                      <span className="text-xs font-bold text-gray-500 uppercase shrink-0 mr-3 w-[100px]">Plazos Fijos:</span>
                      
                      <button 
                        onClick={() => scroll(pfScrollRef, 'left')}
                        className="absolute left-[105px] z-10 p-1.5 bg-white/95 border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition-all flex md:opacity-0 md:group-hover/pf:opacity-100"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <div 
                        ref={pfScrollRef}
                        className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar mask-gradient-right scroll-smooth px-2"
                      >
                          {loading ? (
                              <div className="animate-pulse flex gap-4">
                                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                              </div>
                          ) : plazosFijos.length > 0 ? (
                              plazosFijos.map((item, i) => {
                                  const cleanedName = cleanEntityName(item.entidad);
                                  const url = getEntityUrl(cleanedName);
                                  return (
                                      <a 
                                          key={i} 
                                          href={url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 group hover:bg-gray-50 px-2 py-1 rounded transition-colors shrink-0"
                                          title={`Ir a ${item.entidad}`}
                                      >
                                          <span className="text-xs font-medium text-gray-800 whitespace-nowrap group-hover:text-blue-600 transition-colors">{cleanedName}</span>
                                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{(item.tna * 100).toFixed(1)}%</span>
                                      </a>
                                  );
                              })
                          ) : (
                              <p className="text-xs text-gray-400">No disponible</p>
                          )}
                      </div>

                      <button 
                        onClick={() => scroll(pfScrollRef, 'right')}
                        className="absolute right-1 z-10 p-1.5 bg-white/95 border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition-all flex md:opacity-0 md:group-hover/pf:opacity-100"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                  </div>

                  {/* Billeteras Row */}
                  <div className="flex items-center px-4 py-2 overflow-hidden h-12 relative group/bill">
                      <span className="text-xs font-bold text-gray-500 uppercase shrink-0 mr-3 w-[100px]">Billeteras:</span>
                      
                      <button 
                        onClick={() => scroll(billScrollRef, 'left')}
                        className="absolute left-[105px] z-10 p-1.5 bg-white/95 border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-green-600 transition-all flex md:opacity-0 md:group-hover/bill:opacity-100"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <div 
                        ref={billScrollRef}
                        className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar mask-gradient-right scroll-smooth px-2"
                      >
                          {loading ? (
                              <div className="animate-pulse flex gap-4">
                                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                              </div>
                          ) : billeteras.length > 0 ? (
                              billeteras.map((item, i) => {
                                  const cleanedName = cleanEntityName(item.entidad);
                                  const url = getEntityUrl(cleanedName);
                                  return (
                                      <a 
                                          key={i} 
                                          href={url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 group hover:bg-gray-50 px-2 py-1 rounded transition-colors shrink-0"
                                          title={`Ir a ${item.entidad}`}
                                      >
                                          <span className="text-xs font-medium text-gray-800 whitespace-nowrap group-hover:text-green-600 transition-colors">{cleanedName}</span>
                                          <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{item.tna}%</span>
                                      </a>
                                  );
                              })
                          ) : (
                              <p className="text-xs text-gray-400">No disponible</p>
                          )}
                      </div>

                      <button 
                        onClick={() => scroll(billScrollRef, 'right')}
                        className="absolute right-1 z-10 p-1.5 bg-white/95 border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-green-600 transition-all flex md:opacity-0 md:group-hover/bill:opacity-100"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                  </div>
              </div>
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1">
                  <span className="font-semibold">Nota:</span> TNA proyectada en base al último valor de cuotaparte (ayer) y reportes BCRA.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* News Container */}
      <div className="w-full h-[320px] md:h-[180px] bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Container Header */}
        <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 overflow-x-auto no-scrollbar">
           <div className="flex items-center shrink-0 mr-4">
             <Newspaper className="w-4 h-4 text-blue-600 mr-2" />
             <button 
               onClick={() => setIframeUrl('https://noticias-pi-beryl.vercel.app/')}
               className="relative flex items-center gap-2 group px-2 py-1 rounded-md hover:bg-blue-50 transition-all duration-300"
             >
               <div className="flex items-center gap-1.5">
                 <span className="font-bold text-gray-800 text-sm uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                   Noticias
                 </span>
                 <div className="flex items-center gap-1">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                   </span>
                   <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Actualizado</span>
                 </div>
               </div>
               <motion.div
                 whileHover={{ scale: 1.2, x: 2, y: -2 }}
                 className="text-gray-400 group-hover:text-blue-600 transition-colors"
               >
                 <ExternalLink className="w-3.5 h-3.5" />
               </motion.div>

               {/* Tooltip hint */}
               <div className="absolute left-0 -bottom-8 hidden group-hover:block bg-gray-900 text-white text-[9px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none font-bold uppercase tracking-widest border border-white/10">
                 Abrir lector de noticias completo
               </div>
             </button>
             <span className="ml-2 text-[10px] font-medium text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">
                {news.length} capturadas
             </span>
           </div>
        </div>

        {/* Horizontal Flex of Sources */}
        <div className="flex-1 relative group/news overflow-hidden">
           <button 
             onClick={() => scroll(newsScrollRef, 'left')}
             className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/95 border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition-all flex opacity-80 hover:opacity-100"
           >
             <ChevronLeft className="w-4 h-4" />
           </button>

           <div 
             ref={newsScrollRef}
             className="h-full flex flex-row divide-x divide-gray-100 overflow-x-auto no-scrollbar snap-x snap-mandatory"
           >
              {(Object.entries(groupedNews) as [string, NewsItem[]][]).map(([source, items]) => (
                 <div key={source} className="flex-none w-[85vw] sm:w-[300px] md:w-[250px] flex flex-col snap-center md:snap-start hover:bg-blue-50/30 transition-colors group/column relative">
                    {/* Source Header */}
                    <div className="py-1.5 px-1 text-center border-b border-gray-100 shrink-0 bg-white/50 backdrop-blur-sm">
                       <h3 className="font-bold text-[10px] text-gray-900 truncate w-full px-1" title={source}>
                         {source}
                       </h3>
                    </div>

                    {/* News List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5">
                       {items.map((item, i) => {
                         const title = item.titulo || item.title || item.headline || 'Sin título';
                         const link = item.link || item.url || item.href;
                         
                         return (
                          <a 
                             key={i} 
                             href={link} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="block mb-2 last:mb-0 group/item"
                             title={title}
                          >
                             <p className="text-[9px] leading-snug text-gray-600 group-hover/column:text-gray-800 group-hover/item:text-blue-600 transition-colors line-clamp-3 font-medium">
                                {title}
                             </p>
                          </a>
                         );
                       })}
                    </div>
                    
                    {/* Count Badge */}
                    <div className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full bg-blue-600/20 group-hover/column:bg-blue-600 transition-colors"></div>
                 </div>
              ))}
           </div>

           <button 
             onClick={() => scroll(newsScrollRef, 'right')}
             className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/95 border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition-all flex opacity-80 hover:opacity-100"
           >
             <ChevronRight className="w-4 h-4" />
           </button>
        </div>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1">
            <span className="font-semibold">Fuente:</span> Agregador de medios en tiempo real vía Google News RSS.
        </div>
      </div>

      {/* Footer / Transparency Protocol */}
      <footer className="w-full mt-12 mb-8 px-4">
        <div className="max-w-4xl mx-auto border-t border-gray-200 pt-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-gray-300"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
              [ PROTOCOLO DE TRANSPARENCIA DE DATOS ]
            </span>
            <div className="h-px w-8 bg-gray-300"></div>
          </div>
          
          <p className="text-[11px] text-gray-500 leading-relaxed max-w-2xl font-medium">
            Sincronización activa con fuentes oficiales y mercados en tiempo real. 
            Los valores de activos, tasas de interés e indicadores macroeconómicos son extraídos de APIs financieras verificadas. 
            Este terminal actúa como procesador de datos vigentes, no como simulador.
          </p>
          
          <div className="mt-8 flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold text-gray-800 tracking-widest uppercase">
              CENTINELA FINANCIERO © 2026
            </span>
            <div className="w-12 h-0.5 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
