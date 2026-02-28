// main.js - Orquestador con Escaneo de Mercado, ORO y MERVAL
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const TASA_REF_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
const MERVAL_API = "https://api.argentinadatos.com/v1/finanzas/indices/merval/ultimo";
const ORO_API = "https://api.gold-api.com/updates/current";

// Memoria global del sistema (Cache)
window.cacheData = { 
    ipc: 0, brecha: 0, tasaR: 0, tnaLeCap: 0, rpVal: 0, 
    blueVal: 0, criptoVal: 0, tnaRef: 0, merval: 0, oro: 0 
};

async function rescanearMercado() {
    await ejecutarDeepScanIA(true);
}

async function ejecutarDeepScanIA(forceClean = false) {
    const loader = document.getElementById('loader-overlay');
    const loaderSub = document.getElementById('loader-sub');
    const scanLine = document.getElementById('scan-line');
    
    if(loader) loader.style.display = 'flex';
    if(scanLine) scanLine.style.display = 'block';

    const mensajes = ["CONECTANDO NODOS...", "ESCANEO DE REDES...", "DESCRIPTANDO DATOS...", "EXTRAYENDO MERVAL...", "VALUANDO ORO...", "SINCRONIZANDO..."];
    let i = 0;
    const loaderInterval = setInterval(() => {
        if(loaderSub) loaderSub.innerText = mensajes[i % mensajes.length];
        i++;
    }, 400);

    const safeFetch = async (url) => {
        try { 
            const finalUrl = forceClean ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` : url;
            const resp = await fetch(finalUrl, { cache: forceClean ? "reload" : "default" }); 
            return resp.ok ? await resp.json() : null; 
        } catch (e) { return null; }
    };

    try {
        // Ejecución de todas las llamadas en paralelo para máxima velocidad
        const [resDolar, resRP, resTasa, resInf, resNews, resMerval, resOro] = await Promise.all([
            safeFetch(DOLAR_URL), 
            safeFetch(RP_API),
            safeFetch(TASA_REF_API), 
            safeFetch(INFLACION_API), 
            safeFetch(NEWS_URL),
            safeFetch(MERVAL_API),
            safeFetch(ORO_API)
        ]);

        // Guardar valores nuevos en cache
        if(resMerval) window.cacheData.merval = resMerval.valor;
        if(resOro) window.cacheData.oro = resOro.price;

        // Actualizar los módulos (se pasan los datos a metrics.js y otros)
        if(typeof updateMetrics === 'function') updateMetrics(resDolar, resRP, resInf, resMerval, resOro);
        if(typeof updateMonitoring === 'function') updateMonitoring(resTasa);
        if(typeof updateNews === 'function') updateNews(resNews);
        
        // Actualizar IA
        const activeBtn = document.querySelector('.profile-btn.active');
        const currentProfile = activeBtn ? activeBtn.getAttribute('data-type') : 'cons';
        if(typeof switchProfile === 'function') switchProfile(currentProfile);

    } catch (e) {
        console.error("Error en escaneo:", e);
    } finally {
        clearInterval(loaderInterval);
        setTimeout(() => {
            if(loader) loader.style.display = 'none';
            if(scanLine) scanLine.style.display = 'none';
        }, 800);
    }
}

document.addEventListener('DOMContentLoaded', () => ejecutarDeepScanIA(false));