// main.js - Orquestador Principal
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
const TASA_PF_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo"; 
const TASA_REM_API = "https://api.argentinadatos.com/v1/finanzas/rendimientos"; 

let cacheData = { ipc: 0, brecha: 0, tnaRef: 35, rpVal: 0, blueVal: 0, criptoVal: 0 };

function toggleContainer(id) { 
    const el = document.getElementById(id);
    if(el) el.classList.toggle('collapsed'); 
}

async function rescanearMercado() {
    const btn = document.querySelector('.update-btn');
    if(btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ESCANEANDO...';
    
    // Limpieza de interfaz
    ['dolar-container', 'pf-container', 'rem-container', 'master-grid', 'lecap-container'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = "";
    });

    await ejecutarDeepScanIA();
    if(btn) btn.innerHTML = '<i class="fa-solid fa-rotate"></i> REESCANEAR MERCADO';
}

async function ejecutarDeepScanIA() {
    const loader = document.getElementById('loader-overlay');
    const scanLine = document.getElementById('scan-line');
    
    if(loader) loader.style.display = 'flex';
    if(scanLine) scanLine.style.display = 'block';

    const safeFetch = async (url) => {
        try { 
            const resp = await fetch(url); 
            return resp.ok ? await resp.json() : null; 
        } catch (e) { return null; }
    };

    try {
        const [resDolar, resRP, resTasaPF, resTasaRem, resInf, resNews] = await Promise.all([
            safeFetch(DOLAR_URL), safeFetch(RP_API),
            safeFetch(TASA_PF_API), safeFetch(TASA_REM_API),
            safeFetch(INFLACION_API), safeFetch(NEWS_URL)
        ]);

        if(typeof updateMetrics === 'function') await updateMetrics(resDolar, resRP, resInf);
        if(typeof updateMonitoring === 'function') updateMonitoring(resTasaRem, resTasaPF);
        if(typeof updateNews === 'function') updateNews(resNews);
        if(typeof switchProfile === 'function') switchProfile('mod'); 

    } catch (e) { 
        console.error("Fallo crítico en escaneo:", e);
    } finally {
        if(loader) loader.style.display = 'none';
        if(scanLine) scanLine.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', ejecutarDeepScanIA);