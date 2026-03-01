// main.js - Sincronización Real con ArgentinaDatos y Google Script
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
// Eliminamos /ultimo para evitar el 404
const MERVAL_API = "https://api.argentinadatos.com/v1/finanzas/indices/merval";
const TASAS_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo";

window.cacheData = { 
    ipc: 0, brecha: 0, tnaRef: 35, tnaLecap: 38.5, merval: 0, oro: 2750, datosBancos: [] 
};

async function ejecutarDeepScanIA() {
    const loader = document.getElementById('loader-overlay');
    if(loader) loader.style.display = 'flex';

    try {
        const fetchJson = async (url) => {
            try {
                const r = await fetch(url);
                return r.ok ? await r.json() : null;
            } catch (err) {
                // Fallback para noticias (CORS Bypass)
                if (url.includes('google.com')) {
                    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                    const res = await fetch(proxyUrl);
                    return res.ok ? await res.json() : null;
                }
                return null;
            }
        };

        const [resDolar, resRP, resInf, resNews, resMerval, resTasas] = await Promise.all([
            fetchJson(DOLAR_URL), fetchJson(RP_API), fetchJson(INFLACION_API),
            fetchJson(NEWS_URL), fetchJson(MERVAL_API), fetchJson(TASAS_API)
        ]);

        // Procesar Merval: Tomamos el último valor del array histórico
        if(resMerval && Array.isArray(resMerval)) {
            window.cacheData.merval = resMerval[resMerval.length - 1].valor;
        }

        window.cacheData.datosBancos = resTasas || [];

        // Actualizar componentes
        if(typeof updateMetrics === 'function') updateMetrics(resDolar, resRP, resInf, window.cacheData.merval, window.cacheData.oro);
        if(typeof updateMonitoring === 'function') updateMonitoring(resTasas);
        if(typeof updateNews === 'function') updateNews(resNews);
        
        const activeBtn = document.querySelector('.profile-btn.active');
        if(typeof switchProfile === 'function') switchProfile(activeBtn ? activeBtn.getAttribute('data-type') : 'cons');

    } catch (e) { 
        console.warn("Actualización parcial: Algunos datos pueden no estar disponibles."); 
    } finally { 
        if(loader) loader.style.display = 'none'; 
    }
}

function rescanearMercado() { ejecutarDeepScanIA(); }
document.addEventListener('DOMContentLoaded', () => ejecutarDeepScanIA());