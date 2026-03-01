// main.js - Orquestador Central
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
const MERVAL_API = "https://api.argentinadatos.com/v1/finanzas/indices/merval";
const TASAS_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo";

window.cacheData = { ipc: 0, brecha: 0, tnaRef: 35, merval: 0 };

async function sincronizarTerminal() {
    const loader = document.getElementById('loader-overlay');
    if(loader) loader.style.display = 'flex';

    try {
        const fetchJson = async (url) => {
            const proxyUrl = url.includes('google.com') ? `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` : url;
            const r = await fetch(proxyUrl);
            return r.ok ? await r.json() : null;
        };

        const [resDolar, resRP, resInf, resNews, resMerval, resTasas] = await Promise.all([
            fetchJson(DOLAR_URL), fetchJson(RP_API), fetchJson(INFLACION_API),
            fetchJson(NEWS_URL), fetchJson(MERVAL_API), fetchJson(TASAS_API)
        ]);

        // Procesar Merval
        if(resMerval && resMerval.length > 0) window.cacheData.merval = resMerval[resMerval.length - 1].valor;

        // Distribución de datos con seguridad
        if(typeof updateMetrics === 'function') updateMetrics(resDolar, resRP, resInf, window.cacheData.merval);
        if(typeof updateMonitoring === 'function') updateMonitoring(resTasas);
        if(typeof updateNews === 'function') updateNews(resNews);
        if(typeof initIntelligence === 'function') initIntelligence(); 

    } catch (e) {
        console.error("Error en sincronización:", e);
    } finally {
        if(loader) loader.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', sincronizarTerminal);