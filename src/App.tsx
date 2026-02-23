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
    <div className="min-h-screen bg-bg text-white selection:bg-primary/30 font-sans flex flex-col items-center">
      {/* HEADER RESPONSIVO COMPATIBLE */}
      <header className="w-full max-w-[1000px] p-5 flex flex-col sm:flex-row justify-between items-center gap-5 border-b border-[#222] sticky top-0 bg-bg/80 backdrop-blur-md z-[100]">
        <div className="flex items-center gap-[15px]">
          <div className="logo-container">
            <a href="https://www.instagram.com/3d_mc_3d/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://raw.githubusercontent.com/MauroCasarin/MC-CENTINELA-FINANCIERO/refs/heads/main/MC%2048%20N.png" 
                alt="MC Logo" 
                className="h-[50px] w-auto cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_8px_var(--color-primary)]"
              />
            </a>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[1.1rem] font-black uppercase tracking-[1px]">Centinela Financiero</span>
              <span className="bg-[#ff3333] text-white text-[9px] px-[5px] py-[2px] rounded-[3px] font-bold animate-pulse-custom">LIVE</span>
            </div>
            <span className="text-[0.65rem] text-text-dim uppercase tracking-[1.5px] mt-[2px]">Protocolo de Inteligencia de Mercado</span>
          </div>
        </div>

        <div className="text-center sm:text-right font-mono">
          <div className="text-primary text-[0.75rem] flex items-center justify-center sm:justify-end gap-[6px]">
            <span className="h-[7px] w-[7px] bg-primary rounded-full inline-block shadow-[0_0_5px_var(--color-primary)]"></span> 
            SISTEMA ONLINE
          </div>
          <div className="text-[0.65rem] text-text-dim mt-1">
            {lastScan ? `Última actualización: ${lastScan}` : 'Sincronizando datos...'}
          </div>
          <button 
            onClick={handleScan}
            disabled={loading}
            className="mt-2 p-1 px-4 bg-primary/10 border border-primary/30 text-primary rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50 text-[10px] uppercase font-bold tracking-wider"
          >
            {loading ? 'Escaneando...' : 'Escanear Ahora'}
          </button>
        </div>
      </header>

      <main className="w-full max-w-[600px] p-5 space-y-6">
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
              className="p-12 border border-blue-500/20 bg-blue-500/5 rounded-xl text-center space-y-4"
            >
              <CheckCircle2 className="w-16 h-16 text-blue-400 mx-auto" />
              <h2 className="text-2xl font-black tracking-tighter uppercase text-blue-400">MERCADO EN CALMA</h2>
              <p className="text-white/60 max-w-md mx-auto text-sm">
                Se analizaron {status?.sourcesAnalyzedCount} fuentes en tiempo real. No se detectaron anomalías o disparadores de alta fiabilidad en este momento.
              </p>
              <div className="inline-block bg-[#1a1a1a] text-primary px-3 py-1.5 rounded-md font-mono text-[0.8rem]">
                Auditoría: {status?.sourcesAnalyzedCount} sitios analizados
              </div>
            </motion.div>
          ) : status?.alerts.length ? (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
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
              className="p-12 border border-[#222] bg-card-bg rounded-xl text-center space-y-4"
            >
              <ShieldAlert className="w-16 h-16 text-primary/40 mx-auto" />
              <h2 className="text-2xl font-black tracking-tighter uppercase text-primary">SISTEMA LISTO</h2>
              <p className="text-white/60 max-w-md mx-auto text-sm">
                El Centinela está operando. Inicie un escaneo para procesar el ecosistema digital y detectar oportunidades críticas.
              </p>
              <div className="inline-block bg-[#1a1a1a] text-primary px-3 py-1.5 rounded-md font-mono text-[0.8rem]">
                Auditoría: 0 sitios analizados
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-[0.7rem] text-[#444] mt-auto pb-8 text-center uppercase tracking-[2px]">
        &copy; 2026 Centinela Financiero - Grado Institucional - v2.0
      </footer>
    </div>
  );
}

const AlertCard: React.FC<{ alert: MarketAlert }> = ({ alert }) => {
  const isPositive = alert.verdict === 'ENTRAR';
  const isNegative = alert.verdict === 'SALIR';

  return (
    <div className="bg-card-bg border border-[#222] rounded-[15px] p-[25px] relative overflow-hidden border-l-4 border-l-primary group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {isPositive ? <TrendingUp size={80} /> : isNegative ? <TrendingDown size={80} /> : <Activity size={80} />}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className={`px-[15px] py-[5px] rounded-[5px] font-black uppercase text-[10px] tracking-widest ${
          isPositive ? 'bg-primary text-black' : isNegative ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
        }`}>
          VEREDICTO: {alert.verdict}
        </div>
        <div className="bg-[#1a1a1a] text-primary px-3 py-1 rounded-md font-mono text-[0.7rem] border border-primary/10">
          Auditoría: {alert.sourcesAnalyzedCount} fuentes
        </div>
      </div>
      
      <h2 className="m-0 mb-[15px] text-[1.6rem] font-black text-primary tracking-tight">
        🚨 ALERTA: {alert.assetName}
      </h2>
      
      <div className="space-y-5">
        <div className="bg-white/5 p-4 rounded-[8px] border border-white/5">
          <p className="leading-relaxed text-[#ccc] text-sm italic">
            <span className="text-primary font-bold not-italic uppercase text-[10px] block mb-1">Cruce de Datos e Inteligencia</span>
            "{alert.dataCrossAnalysis}"
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <div className="space-y-3">
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Estrategia Sugerida</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#ccc]">
                <ArrowRight className="w-3 h-3 text-primary" />
                <span><strong>Acción:</strong> {alert.recommendedAction}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#ccc]">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span><strong>Stop Loss:</strong> {alert.stopLoss}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#ccc]">
                <Clock className="w-3 h-3 text-blue-400" />
                <span><strong>Plazo:</strong> {alert.timeframe}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Fuentes de Respaldo</p>
            <div className="flex flex-wrap gap-2">
              {alert.sources.map((s, i) => (
                <span key={i} className="text-[9px] bg-white/10 px-2 py-1 rounded flex items-center gap-1 text-white/60 border border-white/5">
                  {s} <ExternalLink className="w-2 h-2" />
                </span>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                alert.reliability === 'ALTA' ? 'text-primary' : alert.reliability === 'MEDIA' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                Fiabilidad: {alert.reliability}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/40 uppercase font-black">Confianza</span>
                <span className="text-sm font-black text-white">{alert.confidence}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
