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
  Zap
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
      {/* HEADER SUPERIOR DETALLADO */}
      <header className="w-full max-w-[1200px] p-5 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-[#222] box-border sticky top-0 bg-bg/80 backdrop-blur-md z-[100]">
        <div className="flex items-center">
          <a href="https://www.instagram.com/3d_mc_3d/" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://raw.githubusercontent.com/MauroCasarin/MC-CENTINELA-FINANCIERO/refs/heads/main/MC%2048%20N.png" 
              alt="MC Logo" 
              className="h-[50px] cursor-pointer transition-all duration-300 hover:brightness-125"
            />
          </a>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-[10px]">
            <span className="text-[1.2rem] font-extrabold tracking-[1px] uppercase">Centinela Financiero</span>
            <span className="bg-[#ff0000] text-white text-[10px] px-[6px] py-[2px] rounded-[4px] font-bold animate-pulse-custom">LIVE</span>
          </div>
          <span className="text-[0.75rem] text-text-dim uppercase tracking-[2px] mt-[2px]">Protocolo de Inteligencia de Mercado</span>
        </div>

        <div className="text-left sm:text-right font-mono">
          <div className="text-primary text-[0.8rem] flex items-center sm:justify-end gap-[5px]">
            <span className="h-2 w-2 bg-primary rounded-full inline-block"></span> Estado del Sistema: Online
          </div>
          <div className="text-[0.7rem] text-text-dim mt-1">
            Última actualización: {lastScan || '--:--:--'}
          </div>
          <button 
            onClick={handleScan}
            disabled={loading}
            className="mt-2 p-1 px-3 bg-primary/10 border border-primary/30 text-primary rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50 text-[10px] uppercase font-bold"
          >
            {loading ? 'Escaneando...' : 'Escanear Ahora'}
          </button>
        </div>
      </header>

      <main className="w-[95%] max-w-[800px] mt-[30px] space-y-6">
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
              <div className="text-center">
                <p className="text-lg font-bold tracking-widest animate-pulse uppercase">Ejecutando Protocolo de Investigación de Alto Volumen</p>
                <p className="text-xs text-white/40 uppercase">Rastreando portales, blogs, exchanges y boletines internacionales...</p>
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
              <h2 className="text-2xl font-bold tracking-tighter uppercase">MERCADO EN CALMA</h2>
              <p className="text-white/60 max-w-md mx-auto">
                MERCADO EN CALMA: {status?.sourcesAnalyzedCount} fuentes analizadas, sin oportunidades de alta fiabilidad detectadas.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {status?.alerts.map((alert, idx) => (
                <div key={idx}>
                  <AlertCard alert={alert} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-[0.8rem] text-[#666] mt-10 pb-5 text-center">
        &copy; 2026 Centinela Financiero - Grado Institucional
      </footer>
    </div>
  );
}

function AlertCard({ alert }: { alert: MarketAlert }) {
  const isPositive = alert.verdict === 'ENTRAR';
  const isNegative = alert.verdict === 'SALIR';

  return (
    <div className="alerta-card bg-card-bg border border-[#222] rounded-[12px] p-[25px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      
      <div className="inline-block bg-primary text-black px-[15px] py-[5px] rounded-[5px] font-bold mb-[15px] uppercase text-xs">
        VEREDICTO: {alert.verdict}
      </div>
      
      <h2 className="m-0 mb-[10px] text-[1.5rem] font-bold">🚨 ALERTA: {alert.assetName}</h2>
      
      <div className="bg-[#222] p-[10px] rounded-[8px] text-[0.9rem] text-primary mb-[15px]">
        <strong>AUDITORÍA:</strong> Se analizaron {alert.sourcesAnalyzedCount} sitios web y fuentes financieras en tiempo real.
      </div>

      <div className="space-y-4">
        <p className="leading-relaxed text-[#ccc] m-0">
          <strong>Cruce de Datos:</strong> {alert.dataCrossAnalysis}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase font-bold">Estrategia Sugerida</p>
            <p className="text-sm text-[#ccc]"><strong>Acción:</strong> {alert.recommendedAction}</p>
            <p className="text-sm text-[#ccc]"><strong>Stop Loss:</strong> {alert.stopLoss}</p>
            <p className="text-sm text-[#ccc]"><strong>Plazo:</strong> {alert.timeframe}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase font-bold">Fuentes de Respaldo</p>
            <div className="flex flex-wrap gap-2">
              {alert.sources.map((s, i) => (
                <span key={i} className="text-[9px] bg-white/10 px-2 py-0.5 rounded flex items-center gap-1 text-white/60">
                  {s} <ExternalLink className="w-2 h-2" />
                </span>
              ))}
            </div>
            <div className="mt-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${alert.reliability === 'ALTA' ? 'text-primary' : alert.reliability === 'MEDIA' ? 'text-yellow-400' : 'text-red-400'}`}>
                Fiabilidad: {alert.reliability} | Confianza: {alert.confidence}/10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
