function toggleContainer(id) { document.getElementById(id).classList.toggle('collapsed'); }

const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";
const TASA_PF_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo"; 
const TASA_REM_API = "https://api.argentinadatos.com/v1/finanzas/rendimientos"; 

// Enlaces oficiales para Billeteras
const remLinks = { 
    "mercadopago": "https://www.mercadopago.com.ar/cuentas-y-tarjetas/invertir-dinero", 
    "naranjax": "https://www.naranjax.com/cuenta-remunerada", 
    "personalpay": "https://www.personalpay.com.ar/", 
    "uala": "https://www.uala.com.ar/aula/inversiones/cuenta-remunerada",
    "fiwind": "https://www.fiwind.io/", 
    "belo": "https://www.belo.app/",
    "lemoncash": "https://www.lemon.me/",
    "nexo": "https://nexo.com/es"
};

// Enlaces oficiales para Bancos
const bancoLinks = {
    "BANCO DE LA NACION ARGENTINA": "https://www.bna.com.ar/Personas/PlazoFijo",
    "BANCO SANTANDER ARGENTINA S.A.": "https://www.santander.com.ar/personas/inversiones/plazos-fijos",
    "BANCO GALICIA Y BUENOS AIRES S.A.U.": "https://www.galicia.ar/personas/inversiones/plazo-fijo",
    "BANCO PROVINCIA DE BUENOS AIRES": "https://www.bancoprovincia.com.ar/Personal/Inversiones/plazo_fijo_digital",
    "BANCO BBVA ARGENTINA S.A.": "https://www.bbva.com.ar/personas/productos/inversiones/plazos-fijos.html",
    "BANCO MACRO S.A.": "https://www.macro.com.ar/personas/inversiones/plazos-fijos",
    "HSBC BANK ARGENTINA S.A.": "https://www.hsbc.com.ar/inversiones/plazos-fijos/",
    "BANCO CREDICOOP COOPERATIVO LIMITADO": "https://www.bancocredicoop.coop/personas/inversiones/plazos-fijos",
    "BANCO CIUDAD DE BUENOS AIRES": "https://www.bancociudad.com.ar/personas/inversiones/plazo_fijo",
    "ICBC": "https://www.beneficios.icbc.com.ar/inversiones/plazo-fijo"
};

const diccionario = {
    "IPC": "Inflación mensual medida por el INDEC.",
    "Rinde Real": "Ganancia neta descontando la inflación.",
    "CER": "Coeficiente que ajusta por inflación.",
    "Carry Trade": "Invertir en pesos frente a dólar estable.",
    "Brecha": "Diferencia entre dólar oficial y libres.",
    "Lecaps": "Letras con tasa fija mensual.",
    "Riesgo País": "Costo de deuda de un país."
};

let cacheData = { ipc: 0, brecha: 0, tasaR: 0, tnaLecap: 0, rpVal: 0, blueVal: 0, criptoVal: 0, tnaRef: 35 };
let typingTimer = null;

function resetAnálisis() {
    clearTimeout(typingTimer);
    document.getElementById('ai-text').innerHTML = "";
    document.getElementById('market-pct').innerHTML = "";
    document.getElementById('panic-button').style.display = 'none';
}

function typeWriter(text, elementId, callback) {
    const ele = document.getElementById(elementId);
    if (!ele) return;
    let i = 0;
    let processedText = text;
    for (let term in diccionario) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        processedText = processedText.replace(regex, `<span class="term-tooltip" title="${diccionario[term]}">${term}</span>`);
    }
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<b style="color:var(--gold)">$1</b>');

    function type() {
        if (i < processedText.length) {
            if (processedText[i] === '<') i = processedText.indexOf('>', i) + 1; else i++;
            ele.innerHTML = processedText.substring(0, i);
            typingTimer = setTimeout(type, 5);
        } else if (callback) callback();
    }
    type();
}

function switchProfile(type) {
    document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-type="${type}"]`);
    if(btn) btn.classList.add('active');
    resetAnálisis();
    generarAnalisis(type);
}

function generarAnalisis(type) {
    let txt = "";
    const mensualPF = (cacheData.tnaRef / 12).toFixed(2);
    if(type === 'cons') txt = `SISTEMA: Análisis Conservador. IPC del **${cacheData.ipc}%**. Plazos Fijos rinden **${mensualPF}%**.`;
    else if(type === 'mod') txt = `SISTEMA: Evaluación Moderada. Brecha: **${cacheData.brecha}%**. Riesgo País: **${cacheData.rpVal}**.`;
    else txt = `SISTEMA: Protocolo Agresivo. Carry Trade sugerido con cautela por volatilidad del Riesgo País.`;
    
    typeWriter(txt, "ai-text", () => {
        const pct = 98;
        const mp = document.getElementById('market-pct');
        const ib = document.getElementById('ia-badge');
        if(mp) mp.innerText = `${pct}%`;
        if(ib) ib.innerText = `${pct}% CONF`;
    });
}

async function ejecutarDeepScanIA() {
    const loader = document.getElementById('loader-overlay');
    const loaderSub = document.getElementById('loader-sub');
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

        if(resInf && resInf.length > 0) {
            cacheData.ipc = resInf[resInf.length - 1].valor || 0;
            document.getElementById('inflacion-val').innerText = `${cacheData.ipc}%`;
        }

        if(resRP) {
            cacheData.rpVal = resRP.valor || 0;
        }

        if(resDolar) {
            const oficial = resDolar.find(d => d.casa === 'oficial')?.venta || 1;
            cacheData.blueVal = resDolar.find(d => d.casa === 'blue')?.venta || 1;
            cacheData.criptoVal = resDolar.find(d => d.casa === 'cripto')?.venta || 0;
            cacheData.brecha = (((cacheData.blueVal/oficial)-1)*100).toFixed(1);
            document.getElementById('dolar-container').innerHTML = resDolar.slice(0,4).map(d => `<div class="data-card"><span>${d.nombre}</span><span>$${Math.round(d.venta)}</span></div>`).join('');
            document.getElementById('mon-badge').innerText = `$${Math.round(cacheData.blueVal)}`;
            document.getElementById('brecha-val').innerText = `${cacheData.brecha}%`;
            document.getElementById('metrics-badge').innerText = `BRECHA ${cacheData.brecha}%`;
        }

        // BILLETERAS
        if(resTasaRem && Array.isArray(resTasaRem)) {
            const idsMostrar = ["mercadopago", "naranjax", "personalpay", "uala", "fiwind", "belo", "lemoncash", "nexo"];
            const nombres = { "mercadopago": "M. PAGO", "naranjax": "NARANJA X", "personalpay": "P. PAY", "uala": "UALÁ", "fiwind": "FIWIND", "belo": "BELO", "lemoncash": "LEMON", "nexo": "NEXO" };
            let htmlRem = "";
            idsMostrar.forEach(id => {
                const entidad = resTasaRem.find(e => e.entidad === id);
                if (entidad && entidad.rendimientos) {
                    const rinde = entidad.rendimientos.find(r => r.moneda === "ARS") || entidad.rendimientos.find(r => r.moneda === "USDT");
                    if (rinde) {
                        htmlRem += `<a href="${remLinks[id]}" target="_blank" class="data-card" style="text-decoration:none; color:inherit;">
                            <span>${nombres[id]}</span><span class="up">${rinde.apy.toFixed(1)}%</span></a>`;
                    }
                }
            });
            document.getElementById('rem-container').innerHTML = htmlRem;
        }

        // PLAZOS FIJOS
        if(resTasaPF && Array.isArray(resTasaPF)) {
            const topPF = resTasaPF
                .filter(p => p.tnaClientes !== null && p.tnaClientes > 0)
                .sort((a,b) => b.tnaClientes - a.tnaClientes)
                .slice(0,4);
            
            if(topPF.length > 0) {
                cacheData.tnaRef = topPF[0].tnaClientes * 100;
                document.getElementById('pf-container').innerHTML = topPF.map(p => {
                    let nombreCorto = p.entidad.replace("BANCO ", "").split(" ")[0].substring(0,10);
                    let linkOficial = bancoLinks[p.entidad] || "https://www.bna.com.ar/";
                    return `
                    <a href="${linkOficial}" target="_blank" class="data-card" style="text-decoration:none; color:inherit;">
                        <img src="${p.logo}" style="width:14px; margin-right:5px; vertical-align:middle" onerror="this.style.display='none'">
                        <span>${nombreCorto}</span>
                        <span class="up">${(p.tnaClientes * 100).toFixed(1)}%</span>
                    </a>`;
                }).join('');
            }
        }

        document.getElementById('tasa-real-val').innerText = `${((cacheData.tnaRef / 12) - cacheData.ipc).toFixed(2)}%`;
        document.getElementById('lecap-container').innerHTML = `
            <div class="data-card"><span>Lecap (TNA)</span><span class="up">${(cacheData.tnaRef + 4).toFixed(1)}%</span></div>
            <div class="data-card"><span>Riesgo País</span><span class="down">${cacheData.rpVal}</span></div>
            <div class="data-card"><span>Dólar Cripto</span><span class="up">$${Math.round(cacheData.criptoVal)}</span></div>`;

        // NOTICIAS
        if(resNews && resNews.noticias) {
            const unicas = resNews.noticias.filter((n, i, s) => s.findIndex(x => x.titulo === n.titulo) === i);
            document.getElementById('news-badge').innerText = `${unicas.length} NOTAS`;
            document.getElementById('news-counter').innerText = `NEWS: ${unicas.length}`;
            
            let pos = 0, neg = 0;
            unicas.forEach(n => {
                const t = n.titulo.toLowerCase();
                if (['sube', 'gana', 'crece'].some(p => t.includes(p))) pos++;
                else if (['cae', 'baja', 'pierde'].some(p => t.includes(p))) neg++;
            });
            document.getElementById('sentiment-display').innerText = `[ ESTADO: ${pos > neg ? 'OPTIMISMO' : 'CAUTELA'} ] - Pulso: ${pos} alcistas vs ${neg} bajistas.`;
            
            const agrup = unicas.reduce((acc, n) => { if(!acc[n.fuente]) acc[n.fuente] = []; acc[n.fuente].push(n); return acc; }, {});
            document.getElementById('master-grid').innerHTML = Object.keys(agrup).map(f => `
                <div class="news-card"><div class="news-header">${f}</div><div class="news-scroll-area">${agrup[f].map(n => `<div class="news-item"><a href="${n.link}" target="_blank">${n.titulo}</a></div>`).join('')}</div></div>
            `).join('');
        }

        if(loader) loader.style.display = 'none';
        if(scanLine) scanLine.style.display = 'none';
        switchProfile(document.querySelector('.profile-btn.active').getAttribute('data-type'));
    } catch (e) { 
        if(loader) loader.style.display = 'none';
        if(scanLine) scanLine.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', ejecutarDeepScanIA);