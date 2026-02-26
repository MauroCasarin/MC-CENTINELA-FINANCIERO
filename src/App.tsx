/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// Interfaces
interface Dolar {
  nombre: string;
  venta: number;
  casa: string;
}

interface NewsItem {
  titulo: string;
  link: string;
  fuente: string;
}

interface MarketData {
  dolar: Dolar[];
  riesgoPais: number;
  tasaRef: number;
  ipc: number;
  news: NewsItem[];
  brecha: number;
  tasaReal: number;
  mensualLecap: string;
}

type RiskProfile = 'CONSERVADOR' | 'MODERADO' | 'AGRESIVO';

export default function App() {
  const NEWS_URL = "https://script.google.com/macros/s/AKfycbw_6kSGlPNmSytvAZcyQKZE1EFYTo7zuhp8Nt5YyOtCNoHcx_MAksyIe_TFvorL52EYwQ/exec";
  const DOLAR_URL = "https://dolarapi.com/v1/dolares";
  const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
  const TASA_REF_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo";
  const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
  
  // State
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaderText, setLoaderText] = useState("Iniciando scan...");
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile>('CONSERVADOR');
  const [aiAnalysis, setAiAnalysis] = useState<string>("--");
  const [analyzing, setAnalyzing] = useState(false);
  const [glossary, setGlossary] = useState<string>("");

  // Refs for typeWriter effect
  const analysisRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const remData = [
      {f: "COCOS", t: 0.32, l: "https://www.cocos.capital/"}, 
      {f: "FIWIND", t: 0.32, l: "https://www.fiwind.io/"}, 
      {f: "UALÁ", t: 0.29, l: "https://www.uala.com.ar/"}, 
      {f: "BRUBANK", t: 0.27, l: "https://www.brubank.com/"}
  ];
  const pfData = [
      {e: "REBA", t: 0.34, l: "https://www.reba.com.ar/"}, 
      {e: "BICA", t: 0.33, l: "https://www.bancobica.com.ar/"}, 
      {e: "MACRO", t: 0.28, l: "https://www.macro.com.ar/"}, 
      {e: "NACIÓN", t: 0.25, l: "https://www.bna.com.ar/"}
  ];

  const diccionario: Record<string, string> = {
      "IPC": "Índice de Precios al Consumidor (mide la inflación).",
      "Rinde Real": "Ganancia final restándole la inflación.",
      "Liquidez": "Disponibilidad inmediata del dinero.",
      "CER": "Coeficiente de Estabilización de Referencia (ajusta por inflación).",
      "Lecaps": "Letras de Capitalización que emite el Tesoro.",
      "Carry Trade": "Ganar tasa en pesos apostando a un dólar estable.",
      "Brecha": "Diferencia porcentual entre el dólar oficial y el libre.",
      "Riesgo País": "Sobreprecio que paga un país para financiarse."
  };

  const generateAIAnalysis = async (data: MarketData, profile: RiskProfile) => {
    setAnalyzing(true);
    setAiAnalysis("Analizando mercado con IA...");
    setGlossary("");
    
    // Clear any existing typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    
    try {
      const prompt = `
        Actúa como un analista financiero experto en el mercado argentino ("Centinela del Mercado").
        Analiza los siguientes datos actuales:
        - Inflación (IPC): ${data.ipc}%
        - Dólar Blue: $${Math.round(data.dolar.find(d => d.casa === 'blue')?.venta || 0)}
        - Brecha Cambiaria: ${data.brecha.toFixed(1)}%
        - Riesgo País: ${data.riesgoPais} puntos
        - Tasa Real (Plazo Fijo vs IPC): ${data.tasaReal.toFixed(2)}%
        - Lecaps (Est. Mensual): ${data.mensualLecap}%

        Genera una recomendación estratégica, corta y directa (máximo 60 palabras) para un inversor con perfil **${profile}**.
        Usa negritas (**texto**) para resaltar los 2 o 3 valores o conceptos más críticos.
        No uses introducciones genéricas, ve directo al grano.
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const text = response.text.trim();
      typeWriter(text);
    } catch (error: any) {
      console.error("Error generating AI analysis:", error);
      if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 'RESOURCE_EXHAUSTED') {
        setAiAnalysis("⚠️ **Cuota de IA excedida.** El análisis se pausó temporalmente por límites de uso de la API. Por favor, espere unos minutos antes de reintentar o cambie de perfil.");
      } else {
        setAiAnalysis("Error al generar análisis. Intente nuevamente.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  function typeWriter(text: string) {
      let i = 0;
      setAiAnalysis("");
      setGlossary("");
      
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      
      typingIntervalRef.current = setInterval(() => {
        if (i < text.length) {
          const currentText = text.substring(0, i + 1);
          // Simple bold replacement for display
          const formatted = currentText.replace(/\*\*(.*?)\*\*/g, '<b style="color:var(--gold)">$1</b>');
          setAiAnalysis(formatted);
          i++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          // Generate glossary
          let encontrados = [];
          for (let termino in diccionario) { 
            if (text.includes(termino)) { 
              encontrados.push(`<span class="tech-word">${termino}:</span> ${diccionario[termino]}`); 
            } 
          }
          setGlossary(encontrados.join("<br>"));
        }
      }, 10); // Faster typing for better UX
  }

  async function ejecutarDeepScanIA() {
      setLoading(true);
      const descriptores = ["Activos Remunerados", "Tasas Nominales", "Diferencial Cambiario", "Riesgo Soberano", "Inflación Proyectada"];
      const loaderInterval = setInterval(() => {
          setLoaderText(`[ SCANNING: ${descriptores[Math.floor(Math.random() * descriptores.length)]} ]`);
      }, 180);

      try {
          // Intentamos obtener los datos. Si alguna falla, no rompemos todo el flujo.
          const fetchSafely = async (url: string, defaultValue: any) => {
            try {
              const res = await fetch(url);
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return await res.json();
            } catch (e) {
              console.warn(`Fallo al cargar ${url}:`, e);
              return defaultValue;
            }
          };

          const [resDolar, resRP, resTasa, resInf, resNews] = await Promise.all([
              fetchSafely(DOLAR_URL, []),
              fetchSafely(RP_API, { valor: 0 }),
              fetchSafely(TASA_REF_API, [{ valor: 30 }]),
              fetchSafely(INFLACION_API, [{ valor: 0 }]),
              fetchSafely(NEWS_URL, { noticias: [] })
          ]);

          clearInterval(loaderInterval);
          
          const ipcVal = resInf.length > 0 ? resInf[resInf.length - 1].valor : 0;
          const rpVal = resRP.valor || 0;
          const noticias = resNews.noticias || [];
          const tnaRef = resTasa.length > 0 ? resTasa[resTasa.length - 1].valor : 30;
          const mensualLecap = (tnaRef/12+0.3).toFixed(2);
          
          const oficial = Array.isArray(resDolar) ? (resDolar.find((d: any) => d.casa === 'oficial')?.venta || 1) : 1;
          const blue = Array.isArray(resDolar) ? (resDolar.find((d: any) => d.casa === 'blue')?.venta || 1) : 1;
          const brecha = ((blue/oficial)-1)*100;
          const tasaR = ((pfData[0].t * 100) / 12) - ipcVal;

          const newData: MarketData = {
            dolar: Array.isArray(resDolar) ? resDolar : [],
            riesgoPais: rpVal,
            tasaRef: tnaRef,
            ipc: ipcVal,
            news: noticias,
            brecha,
            tasaReal: tasaR,
            mensualLecap
          };

          setMarketData(newData);
          setLoading(false);
          
          // Generate initial analysis
          generateAIAnalysis(newData, selectedProfile);

      } catch (e) { 
        console.error("Error crítico en deep scan:", e);
        clearInterval(loaderInterval); 
        setLoaderText("Error de Conexión - Reintentando..."); 
        setTimeout(() => { setLoading(false); }, 3000); 
      }
  }

  useEffect(() => {
    ejecutarDeepScanIA();
  }, []);

  // Re-run analysis when profile changes, if data exists
  useEffect(() => {
    if (marketData && !loading) {
      generateAIAnalysis(marketData, selectedProfile);
    }
  }, [selectedProfile]);

  // Group news
  const uniqueNews = marketData?.news.filter((n, i, s) => s.findIndex(x => x.titulo === n.titulo) === i) || [];
  const groupedNews = uniqueNews.reduce((acc: any, n) => { 
    if(!acc[n.fuente]) acc[n.fuente] = []; 
    acc[n.fuente].push(n); 
    return acc; 
  }, {});

  return (
    <div className="app-container">
      <div id="scan-line" style={{display: loading ? 'block' : 'none'}}></div>

      <div className="header">
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <a href="https://www.instagram.com/3d_mc_3d/" target="_blank">
                  <img src="https://avatars.githubusercontent.com/u/70527971?v=4&size=64" style={{width:'24px', height:'24px', borderRadius:'50%', border:'2px solid var(--accent)'}} />
              </a>
              <span style={{fontWeight:900, letterSpacing:'1px', textTransform: 'uppercase'}}>CENTINELA <span style={{color:'var(--accent)'}}>DEL MERCADO</span></span>
          </div>
          <div style={{textAlign: 'right', fontFamily: 'monospace'}}>
              <div id="news-counter" style={{color:'var(--blue)', fontSize: '9px', fontWeight: 'bold', marginBottom: '2px'}}>
                NEWS: {uniqueNews.length || '--'}
              </div>
              <div id="t-stamp" style={{color:'#444', fontSize: '9px'}}>V14.5_AI_CORE</div>
          </div>
      </div>

      <div className="ai-terminal">
          {loading && (
            <div id="loader-overlay" style={{display: 'flex'}}>
                <div style={{width:'30px', height:'30px', border:'3px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation: 'spin 0.8s linear infinite'}}></div>
                <div style={{marginTop:'15px', textAlign:'center', fontFamily:'monospace'}}>
                    <div style={{color:'var(--txt)', fontSize:'11px', fontWeight:'bold', textTransform:'uppercase', marginBottom:'4px'}}>Capturando datos del mercado...</div>
                    <div id="loader-sub" style={{color:'var(--blue)', fontSize:'9px', textTransform:'uppercase', opacity:0.8}}>{loaderText}</div>
                </div>
            </div>
          )}

          {/* Risk Profile Selector */}
          <div style={{display: 'flex', gap: '8px', marginBottom: '15px', justifyContent: 'center'}}>
            {(['CONSERVADOR', 'MODERADO', 'AGRESIVO'] as RiskProfile[]).map((profile) => (
              <button
                key={profile}
                onClick={() => setSelectedProfile(profile)}
                style={{
                  background: selectedProfile === profile ? 'var(--accent)' : '#111',
                  color: selectedProfile === profile ? '#fff' : '#666',
                  border: '1px solid #333',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.2s'
                }}
              >
                {profile === 'CONSERVADOR' && <i className="fas fa-shield-alt" style={{marginRight:4}}></i>}
                {profile === 'MODERADO' && <i className="fas fa-balance-scale" style={{marginRight:4}}></i>}
                {profile === 'AGRESIVO' && <i className="fas fa-fire" style={{marginRight:4}}></i>}
                {profile}
              </button>
            ))}
          </div>

          <div className="strategy-grid">
              <div className="strat-box" style={{
                borderLeft: `4px solid ${selectedProfile === 'CONSERVADOR' ? 'var(--blue)' : selectedProfile === 'AGRESIVO' ? 'var(--gold)' : 'var(--green)'}`,
                minHeight: '140px'
              }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', borderBottom:'1px solid #1a1a1a', paddingBottom:'5px'}}>
                    <h4 style={{margin:0, border:0, padding:0}}>
                      ANÁLISIS IA: PERFIL {selectedProfile}
                    </h4>
                    {analyzing && <span style={{fontSize:'0.6rem', color:'var(--accent)', animation:'pulse 1s infinite'}}>ANALIZANDO...</span>}
                  </div>
                  
                  <div 
                    className="strat-text" 
                    dangerouslySetInnerHTML={{__html: aiAnalysis}}
                  ></div>
                  
                  <div 
                    className="tech-definitions"
                    dangerouslySetInnerHTML={{__html: glossary}}
                  ></div>
              </div>
          </div>

          <div className="info-section">
              <div className="section-title"><i className="fas fa-dollar-sign"></i> Dólar</div>
              <div id="dolar-container" className="data-grid">
                {marketData?.dolar.slice(0,4).map((d, i) => (
                  <div key={i} className="data-card">
                    <span>{d.nombre.substring(0,7)}</span>
                    <span>${Math.round(d.venta)}</span>
                  </div>
                ))}
              </div>
          </div>
          
          <div className="info-section">
              <div className="section-title"><i className="fas fa-wallet"></i> Remuneradas</div>
              <div id="rem-container" className="data-grid">
                {remData.sort((a,b)=>b.t-a.t).map((r, i) => (
                  <a key={i} href={r.l} target="_blank" className="data-card">
                    <span>{r.f}</span>
                    <span className={((r.t*100)/12) >= (marketData?.ipc || 0) ? 'up':'down'}>
                      {((r.t*100)/12).toFixed(2)}%
                    </span>
                  </a>
                ))}
              </div>
          </div>

          <div className="info-section">
              <div className="section-title"><i className="fas fa-university"></i> Plazos Fijos</div>
              <div id="pf-container" className="data-grid">
                {pfData.sort((a,b)=>b.t-a.t).map((p, i) => (
                  <a key={i} href={p.l} target="_blank" className="data-card">
                    <span>{p.e}</span>
                    <span className={((p.t*100)/12) >= (marketData?.ipc || 0) ? 'up':'down'}>
                      {((p.t*100)/12).toFixed(2)}%
                    </span>
                  </a>
                ))}
              </div>
          </div>

          <div className="info-section">
              <div className="section-title"><i className="fas fa-chart-line"></i> Lecaps</div>
              <div id="lecap-container" className="data-grid">
                <div className="data-card">
                  <span>Tasa Ref.</span>
                  <span>{marketData ? (marketData.tasaRef/12).toFixed(2) : '--'}%</span>
                </div>
                <div className="data-card">
                  <span>Lecap Est.</span>
                  <span className="up">{marketData?.mensualLecap || '--'}%</span>
                </div>
              </div>
          </div>

          <div className="info-section">
              <div className="section-title"><i className="fas fa-exclamation-triangle"></i> Riesgo País</div>
              <div id="rp-container" className="data-grid">
                <div className="data-card">
                  <span>Puntos</span>
                  <span className={(marketData?.riesgoPais || 0) < 700 ? 'up':'down'}>
                    {marketData?.riesgoPais || '--'}
                  </span>
                </div>
              </div>
          </div>

          <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-label">BRECHA</span>
                <b id="brecha-val" className="stat-value">{marketData?.brecha.toFixed(1) || '--'}%</b>
                <span className="stat-desc">Blue vs Oficial</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">IPC</span>
                <b id="inflacion-val" className="stat-value" style={{color:'var(--blue)'}}>
                  {marketData?.ipc || '--'}%
                </b>
                <span className="stat-desc">Última Inflación</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">TASA REAL</span>
                <b id="tasa-real-val" className="stat-value" style={{color: (marketData?.tasaReal || 0) >= 0 ? 'var(--green)' : 'var(--red)'}}>
                  {marketData?.tasaReal.toFixed(2) || '--'}%
                </b>
                <span className="stat-desc">Rinde vs IPC</span>
              </div>
          </div>

          <button className="update-btn" onClick={ejecutarDeepScanIA}>
            {loading ? 'Sincronizando...' : 'Sincronizar Protocolo v14.5'}
          </button>
      </div>

      <div id="master-grid" className="news-grid">
        {Object.keys(groupedNews).map((f, i) => (
          <div key={i} className="news-card">
            <div className="news-header">{f}</div>
            <div className="news-scroll-area">
              {groupedNews[f].map((n: NewsItem, j: number) => (
                <div key={j} className="news-item">
                  <a href={n.link} target="_blank">{n.titulo}</a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
