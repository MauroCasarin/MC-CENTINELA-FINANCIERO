// Orquestador Principal
const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
const TASA_PF_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo"; 
const TASA_REM_API = "https://api.argentinadatos.com/v1/finanzas/rendimientos"; 

let cacheData = { ipc: 0, brecha: 0, tnaRef: 35, rpVal: 0, blueVal: 0, criptoVal: 0 };

function toggleContainer(id) { document.getElementById(id).classList.toggle('collapsed'); }

async function ejecutarDeepScanIA() {
    const loader = document.getElementById('loader-overlay');
    const scanLine = document.getElementById('scan-line');
    if(loader) loader.style.display = 'flex';
    if(scanLine) scanLine.style.display = 'block';

    const safeFetch = async (url) => {
        try { const resp = await fetch(url); return await resp.json(); } catch (e) { return null; }
    };

    try {
        const [resDolar, resRP, resTasaPF, resTasaRem, resInf, resNews] = await Promise.all([
            safeFetch(DOLAR_URL), safeFetch(RP_API),
            safeFetch(TASA_PF_API), safeFetch(TASA_REM_API),
            safeFetch(INFLACION_API), safeFetch(NEWS_URL)
        ]);

        // Llamada a los módulos específicos
        await updateMetrics(resDolar, resRP, resInf);
        updateMonitoring(resTasaRem, resTasaPF);
        updateNews(resNews);

        if(loader) loader.style.display = 'none';
        if(scanLine) scanLine.style.display = 'none';
        
        switchProfile('mod'); // Inicia la IA con el perfil moderado

    } catch (e) { 
        console.error("Error en el escaneo:", e);
        if(loader) loader.style.display = 'none'; 
    }
}

document.addEventListener('DOMContentLoaded', ejecutarDeepScanIA);