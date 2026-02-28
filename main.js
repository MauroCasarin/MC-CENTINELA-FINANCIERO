// main.js - Orquestador con lógica Anti-Caché
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const TASA_REF_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";

window.cacheData = { ipc: 0, brecha: 0, tasaR: 0, tnaLecap: 0, rpVal: 0, blueVal: 0, criptoVal: 0, tnaRef: 0 };

// Función para el botón: fuerza recarga omitiendo temporales
async function rescanearMercado() {
    console.log("Reiniciando terminal y limpiando temporales...");
    const aiText = document.getElementById('ai-text');
    if(aiText) aiText.innerText = "SISTEMA: Purgando datos temporales y reconectando con APIs...";
    
    // Ejecutamos el escaneo pasando 'true' para forzar limpieza
    await ejecutarDeepScanIA(true);
}

async function ejecutarDeepScanIA(forceClean = false) {
    const loader = document.getElementById('loader-overlay');
    const scanLine = document.getElementById('scan-line');
    
    if(loader) loader.style.display = 'flex';
    if(scanLine) scanLine.style.display = 'block';

    // Función interna que gestiona el Anti-Caché
    const fetchData = async (url) => {
        try { 
            // Si forceClean es true, añadimos timestamp para evitar el caché del navegador
            const finalUrl = forceClean ? `${url}${url.includes('?') ? '&' : '?'}nocache=${Date.now()}` : url;
            const resp = await fetch(finalUrl, { cache: forceClean ? "reload" : "default" }); 
            return resp.ok ? await resp.json() : null; 
        } catch (e) { return null; }
    };

    try {
        const [resDolar, resRP, resTasa, resInf, resNews] = await Promise.all([
            fetchData(DOLAR_URL), 
            fetchData(RP_API),
            fetchData(TASA_REF_API), 
            fetchData(INFLACION_API), 
            fetchData(NEWS_URL)
        ]);

        // Actualizar Módulos
        if(typeof updateMetrics === 'function') updateMetrics(resDolar, resRP, resInf);
        if(typeof updateMonitoring === 'function') updateMonitoring(resTasa);
        if(typeof updateNews === 'function') updateNews(resNews);
        
        // Actualizar IA
        const activeBtn = document.querySelector('.profile-btn.active');
        const currentProfile = activeBtn ? activeBtn.getAttribute('data-type') : 'cons';
        if(typeof switchProfile === 'function') switchProfile(currentProfile);

    } catch (e) {
        console.error("Error crítico en el escaneo:", e);
    } finally {
        setTimeout(() => {
            if(loader) loader.style.display = 'none';
            if(scanLine) scanLine.style.display = 'none';
        }, 800);
    }
}

// Carga inicial al abrir la app
document.addEventListener('DOMContentLoaded', () => ejecutarDeepScanIA(false));