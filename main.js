// main.js - CENTINELA v15.9.0 - Sincronización Real
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9dqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
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
                // Petición directa sin proxy para evitar bloqueos de terceros
                const r = await fetch(url);
                if (!r.ok) return null;
                return await r.json();
            } catch (err) { 
                return null; 
            }
        };

        // Realizamos las peticiones en paralelo
        const [resDolar, resRP, resInf, resNews, resMerval, resTasas] = await Promise.all([
            fetchJson(DOLAR_URL), fetchJson(RP_API), fetchJson(INFLACION_API),
            fetchJson(NEWS_URL), fetchJson(MERVAL_API), fetchJson(TASAS_API)
        ]);

        // MERVAL: Tomar último valor del array (Evita el 404 de /ultimo)
        if(resMerval && Array.isArray(resMerval)) {
            window.cacheData.merval = resMerval[resMerval.length - 1].valor;
        }

        window.cacheData.datosBancos = resTasas || [];

        // Actualizar UI - Verificamos que existan las funciones antes de llamar
        if(typeof updateMetrics === 'function') updateMetrics(resDolar, resRP, resInf, window.cacheData.merval, window.cacheData.oro);
        if(typeof updateMonitoring === 'function') updateMonitoring(resTasas);
        if(typeof updateNews === 'function') updateNews(resNews || {noticias: []});
        
        if(typeof switchProfile === 'function') {
            const activeBtn = document.querySelector('.profile-btn.active');
            switchProfile(activeBtn ? activeBtn.getAttribute('data-type') : 'cons');
        }

    } catch (e) { 
        console.warn("Actualización parcial: Algunas fuentes no están disponibles."); 
    } finally { 
        if(loader) loader.style.display = 'none'; 
    }
}

function rescanearMercado() { ejecutarDeepScanIA(); }
document.addEventListener('DOMContentLoaded', () => ejecutarDeepScanIA());