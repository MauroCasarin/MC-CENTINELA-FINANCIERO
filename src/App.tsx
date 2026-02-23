/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Search, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Globe,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { performMarketScan, MarketAlert, MarketStatus } from './services/geminiService';

export default function App() {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await performMarketScan();
      setStatus(result);
      setLastScan(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Error al conectar con el protocolo de inteligencia. Verifique conexión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleScan();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-primary/30 font-sans flex flex-col items-center leading-relaxed">
      {/* HEADER RESPONSIVO COMPATIBLE */}
      <header className="w-full max-w-[1000px] p-[15px_20px] flex justify-between items-center border-b border-[#222] sticky top-0 bg-bg z-[100]">
        <div className="flex items-center gap-3">
          <div className="logo-container">
            <a href="https://www.instagram.com/3d_mc_3d/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://avatars.githubusercontent.com/u/70527971?s=48&v=4" 
                alt="MC Logo" 
                className="h-[45px] max-[480px]:h-[38px] w-auto block transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_8px_var(--color-primary)]"
              />
            </a>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[1rem] max-[480px]:text-[0.85rem] font-black uppercase tracking-[0.5px]">Centinela Financiero</span>
              <span className="bg-[#ff3333] text-white text-[8px] px-[5px] py-[2px] rounded-[3px] font-bold animate-pulse-custom">LIVE</span>
            </div>
            <span className="text-[0.6rem] max-[480px]:text-[0.55rem] text-text-dim uppercase tracking-[1px] mt-[2px]">Protocolo de Inteligencia de Mercado</span>
          </div>
        </div>

        <div className="text-right min-w-[80px]">
          <div className="text-primary text-[0.7rem] font-bold flex items-center justify-end gap-[5px]">
            <span className="h-[6px] w-[6px] bg-primary rounded-full inline-block shadow-[0_0_8px_var(--color-primary)]"></span> 
            ONLINE
          </div>
          <div className="text-[0.6rem] text-text-dim mt-[3px] font-mono">
            {currentTime}
          </div>
          <button 
            onClick={handleScan}
            disabled={loading}
            className="mt-2 p-1 px-3 bg-primary/10 border border-primary/30 text-primary rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50 text-[9px] uppercase font-bold tracking-wider"
          >
            {loading ? '...' : 'Escanear'}
          </button>
        </div>
      </header>

      <main className="w-full max-w-[600px] p-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative h-64 flex flex-col items-center justify-center space-y-4 border border-[#222] bg-card-bg rounded-xl overflow-hidden"
            >
              <div className="scan-line" />
              <RefreshCw className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center px-4">
                <p className="text-lg font-bold tracking-widest animate-pulse uppercase">Ejecutando Protocolo de Investigación</p>
                <p className="text-xs text-white/40 uppercase mt-2">Rastreando portales, blogs, exchanges y boletines internacionales...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 border border-red-500/30 bg-red-500/5 rounded-xl text-center space-y-4"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-red-400 font-bold">{error}</p>
              <button onClick={handleScan} className="text-xs underline uppercase tracking-widest">Reintentar Conexión</button>
            </motion.div>
          ) : status?.isCalm ? (
            <motion.div 
              key="calm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 border border-blue-500/20 bg-blue-500/5 rounded-xl text-center space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <CheckCircle2 className="w-12 h-12 text-blue-400 mx-auto" />
              <h2 className="text-lg font-black tracking-tight uppercase text-blue-400">MERCADO EN CALMA</h2>
              <div className="bg-[#1a1a1a] p-2.5 rounded-md text-[0.75rem] color-primary border border-[#222]">
                Estado: Escaneo Proactivo Activo
              </div>
              <p className="text-white/60 max-w-md mx-auto text-sm">
                Se analizaron {status?.sourcesAnalyzedCount} fuentes. No se detectaron anomalías o disparadores de alta fiabilidad en este momento.
              </p>
            </motion.div>
          ) : status?.alerts.length ? (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {status?.alerts.map((alert: MarketAlert, idx: number) => (
                <AlertCard key={idx} alert={alert} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 border-l-4 border-l-primary bg-card-bg rounded-xl text-left space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-lg font-black tracking-tight uppercase text-primary">Sistema Operativo</h2>
              <div className="bg-[#1a1a1a] p-2.5 rounded-md text-[0.75rem] text-primary border border-[#222]">
                Estado: Escaneo Proactivo Activo
              </div>
              <p className="text-[#ccc] text-sm">
                El radar de mercado está encendido. Analizando Merval, Wall Street y Crypto.
              </p>
              <p className="text-[#ccc] text-sm">
                Generá tus reportes en AI Studio y utilizá este panel para visualizarlos con total fidelidad en cualquier dispositivo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-[0.65rem] text-[#444] mt-auto pb-8 text-center uppercase tracking-[2px]">
        &copy; 2026 Centinela Financiero v4.5 - Grado Institucional
      </footer>
    </div>
  );
}

const AlertCard: React.FC<{ alert: MarketAlert }> = ({ alert }) => {
  const isPositive = alert.verdict === 'ENTRAR';
  const isNegative = alert.verdict === 'SALIR';

  return (
    <div className="bg-card-bg border border-[#222] rounded-[12px] p-[20px] relative overflow-hidden border-l-4 border-l-primary group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {isPositive ? <TrendingUp size={60} /> : isNegative ? <TrendingDown size={60} /> : <Activity size={60} />}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className={`px-[12px] py-[4px] rounded-[4px] font-black uppercase text-[9px] tracking-widest ${
          isPositive ? 'bg-primary text-black' : isNegative ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
        }`}>
          VEREDICTO: {alert.verdict}
        </div>
        <div className="bg-[#1a1a1a] text-primary px-2 py-1 rounded-md font-mono text-[0.65rem] border border-primary/10">
          Auditoría: {alert.sourcesAnalyzedCount} fuentes
        </div>
      </div>
      
      <h2 className="m-0 mb-[12px] text-[1.1rem] font-black text-primary tracking-tight uppercase">
        🚨 ALERTA: {alert.assetName}
      </h2>
      
      <div className="space-y-4">
        <div className="bg-white/5 p-3 rounded-[6px] border border-white/5">
          <p className="leading-relaxed text-[#ccc] text-[0.9rem] italic">
            <span className="text-primary font-bold not-italic uppercase text-[9px] block mb-1">Cruce de Datos e Inteligencia</span>
            "{alert.dataCrossAnalysis}"
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
          <div className="space-y-2">
            <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Estrategia Sugerida</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[0.85rem] text-[#ccc]">
                <ArrowRight className="w-3 h-3 text-primary" />
                <span><strong>Acción:</strong> {alert.recommendedAction}</span>
              </div>
              <div className="flex items-center gap-2 text-[0.85rem] text-[#ccc]">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span><strong>Stop Loss:</strong> {alert.stopLoss}</span>
              </div>
              <div className="flex items-center gap-2 text-[0.85rem] text-[#ccc]">
                <Clock className="w-3 h-3 text-blue-400" />
                <span><strong>Plazo:</strong> {alert.timeframe}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Fuentes de Respaldo</p>
            <div className="flex flex-wrap gap-1.5">
              {alert.sources.map((s, i) => (
                <span key={i} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1 text-white/60 border border-white/5">
                  {s} <ExternalLink className="w-2 h-2" />
                </span>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase tracking-widest ${
                alert.reliability === 'ALTA' ? 'text-primary' : alert.reliability === 'MEDIA' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                Fiabilidad: {alert.reliability}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-white/40 uppercase font-black">Confianza</span>
                <span className="text-[0.85rem] font-black text-white">{alert.confidence}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
