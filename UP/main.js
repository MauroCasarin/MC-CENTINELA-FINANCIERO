// main.js - Orquestador con Animación de Escaneo
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const TASA_REF_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";

window.cacheData = { ipc: 0, brecha: 0, tasaR: 0, tnaLecap: 0, rpVal: 0, blueVal: 0, criptoVal: 0, tnaRef: 0 };

async function rescanearMercado() {
    await ejecutarDeepScanIA(true);
}

async function ejecutarDeepScanIA(forceClean = false) {
    const loader = document.getElementById('loader-overlay');
    const loaderSub = document.getElementById('loader-sub');
    const scanLine = document.getElementById('scan-line');
    
    // Iniciar efectos visuales
    if(loader) loader.style.display = 'flex';
    if(scanLine) scanLine.style.display = 'block';

    // ANIMACIÓN DE TEXTOS (Igual al index enviado)
    const mensajes = ["INICIALIZANDO TERMINAL...", "CONECTANDO NODOS...", "ESCANEO DE REDES...", "DESCRIPTANDO DATOS...", "SINCRONIZANDO MERCADO..."];
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
        const [resDolar, resRP, resTasa, resInf, resNews] = await Promise.all([
            safeFetch(DOLAR_URL), 
            safeFetch(RP_API),
            safeFetch(TASA_REF_API), 
            safeFetch(INFLACION_API), 
            safeFetch(NEWS_URL)
        ]);

        if(typeof updateMetrics === 'function') updateMetrics(resDolar, resRP, resInf);
        if(typeof updateMonitoring === 'function') updateMonitoring(resTasa);
        if(typeof updateNews === 'function') updateNews(resNews);
        
        // Actualizar IA después de los datos
        const activeBtn = document.querySelector('.profile-btn.active');
        const currentProfile = activeBtn ? activeBtn.getAttribute('data-type') : 'cons';
        if(typeof switchProfile === 'function') switchProfile(currentProfile);

    } catch (e) {
        console.error("Error en escaneo:", e);
    } finally {
        // Finalizar efectos
        clearInterval(loaderInterval);
        setTimeout(() => {
            if(loader) loader.style.display = 'none';
            if(scanLine) scanLine.style.display = 'none';
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => ejecutarDeepScanIA(false));