// main.js - CENTINELA v15.9.0 - Edición GitHub Pages
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9dqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
// Se elimina '/ultimo' para evitar el 404; bajamos el historial completo
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
                if (!r.ok) return null;
                return await r.json();
            } catch (err) { return null; }
        };

        const [resDolar, resRP, resInf, resNews, resMerval, resTasas] = await Promise.all([
            fetchJson(DOLAR_URL), fetchJson(RP_API), fetchJson(INFLACION_API),
            fetchJson(NEWS_URL), fetchJson(MERVAL_API), fetchJson(TASAS_API)
        ]);

        // FIX MERVAL: Tomar el último valor del array histórico
        if(resMerval && Array.isArray(resMerval) && resMerval.length > 0) {
            window.cacheData.merval = resMerval[resMerval.length - 1].valor;
        }

        window.cacheData.datosBancos = resTasas || [];

        // Actualizar módulos verificando existencia de funciones
        if(typeof updateMetrics === 'function') updateMetrics(resDolar, resRP, resInf, window.cacheData.merval, window.cacheData.oro);
        if(typeof updateMonitoring === 'function') updateMonitoring(resTasas);
        if(typeof updateNews === 'function') updateNews(resNews || {noticias: []});
        
        const activeBtn = document.querySelector('.profile-btn.active');
        if(typeof switchProfile === 'function') switchProfile(activeBtn ? activeBtn.getAttribute('data-type') : 'cons');

    } catch (e) { 
        console.warn("Error en sincronización parcial de datos."); 
    } finally { 
        if(loader) loader.style.display = 'none'; 
    }
}

function rescanearMercado() { ejecutarDeepScanIA(); }
document.addEventListener('DOMContentLoaded', () => ejecutarDeepScanIA());