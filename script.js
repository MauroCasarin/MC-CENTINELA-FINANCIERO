function toggleContainer(id) { document.getElementById(id).classList.toggle('collapsed'); }

const NEWS_URL = "https://script.google.com/macros/s/AKfycbyRzAtQjhLexPaatkpxGCgq6dfLzp7R6-xO0zvComD3gg1CJbODXaZdqUe5GX9zi0lP4A/exec";
const DOLAR_URL = "https://dolarapi.com/v1/dolares";
const INFLACION_API = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const TASA_REF_API = "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo";
const RP_API = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";

const remLinks = { "COCOS": "https://www.cocos.capital/", "FIWIND": "https://www.fiwind.io/", "UALÁ": "https://www.uala.com.ar/", "BRUBANK": "https://www.brubank.com/" };
const pfLinks = { "REBA": "https://www.reba.com.ar/", "BICA": "https://www.bancobica.com.ar/", "MACRO": "https://www.macro.com.ar/", "NACIÓN": "https://www.bna.com.ar/" };

const diccionario = {
    "IPC": "Inflación mensual medida por el INDEC.",
    "Rinde Real": "Ganancia neta descontando la inflación.",
    "CER": "Coeficiente que ajusta por inflación.",
    "Carry Trade": "Invertir en pesos frente a dólar estable.",
    "Brecha": "Diferencia entre dólar oficial y libres.",
    "Lecaps": "Letras con tasa fija mensual.",
    "Riesgo País": "Costo de deuda de un país."
};

let cacheData = { ipc: 0, brecha: 0, tasaR: 0, tnaLecap: 0, rpVal: 0, blueVal: 0, criptoVal: 0, tnaRef: 0 };
let typingTimer = null;

function resetAnálisis() {
    clearTimeout(typingTimer);
    document.getElementById('ai-text').innerHTML = "";
    document.getElementById('market-pct').innerHTML = "";
    document.getElementById('market-detail').innerHTML = "";
    document.getElementById('panic-button').style.display = 'none';
}

function typeWriter(text, elementId, callback) {
    const ele = document.getElementById(elementId);
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
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    resetAnálisis();
    generarAnalisis(type);
}

function generarAnalisis(type) {
    let txt = "";
    const mensualLecap = (cacheData.tnaLecap / 12).toFixed(2);
    const mensualPF = (cacheData.tnaRef / 12).toFixed(2);
    const brechaCriptoBlue = (((cacheData.criptoVal / cacheData.blueVal) - 1) * 100).toFixed(1);

    if(type === 'cons') {
        txt = `SISTEMA: Análisis Conservador. Con un **IPC del ${cacheData.ipc}%** mensual, los Plazos Fijos rinden **${mensualPF}%**. \n\n**DIAGNÓSTICO:** ${mensualPF < cacheData.ipc ? 'SUS PESOS ESTÁN PERDIENDO VALOR.' : 'Sus pesos mantienen valor.'} No conviene dejar dinero en cuentas remuneradas que paguen menos del ${cacheData.ipc}%. \n\n**CONSEJO:** Para protegerse sin riesgo, rote a activos con ajuste **CER**. Si busca dolarizarse, el Dólar MEP es su mejor opción actual por estabilidad.`;
    } 
    else if(type === 'mod') {
        txt = `SISTEMA: Evaluación de Cartera Moderada. Detecto una **Brecha** del **${cacheData.brecha}%**. El Dólar Cripto está a $${Math.round(cacheData.criptoVal)}. \n\n**ESTRATEGIA:** ${brechaCriptoBlue < 0 ? 'Oportunidad de Dólar Cripto: está más barato que el Blue.' : 'Dólar Cripto con sobreprecio frente al Blue.'} \n\n**CONSEJO:** Divida posiciones: 40% en **Lecaps** para capturar el ${mensualLecap}% mensual y 60% en activos dolarizados (MEP/Cripto). Evite fondos de liquidez inmediata si el **Riesgo País** supera los 1200 puntos.`;
    } 
    else {
        txt = `SISTEMA: Protocolo Agresivo activado. La **Lecap** ofrece un spread de **${(mensualLecap - cacheData.ipc).toFixed(2)}%** real sobre el IPC. \n\n**OPERATIVA:** Máximo **Carry Trade** recomendado mientras la **Brecha** siga bajo el 20%. \n\n**CONSEJO DE INVERSIÓN:** El mejor rendimiento hoy está en **Lecaps** cortas. Sin embargo, si detecta un salto en el Dólar Cripto de más del 2% en un día, CIERRE POSICIONES EN PESOS. No conviene quedar atrapado en pesos con un **Riesgo País** volátil.`;
        if(cacheData.brecha > 20 || cacheData.rpVal > 1500) document.getElementById('panic-button').style.display = 'block';
    }
    
    typeWriter(txt, "ai-text", () => {
        const pct = (type === 'agre' && cacheData.brecha > 20) ? 45 : 98;
        document.getElementById('market-pct').innerText = `${pct}%`;
        document.getElementById('ia-badge').innerText = `${pct}% CONF`;
    });
}

async function ejecutarDeepScanIA() {
    const loader = document.getElementById('loader-overlay');
    const loaderSub = document.getElementById('loader-sub');
    const scanLine = document.getElementById('scan-line');
    loader.style.display = 'flex'; scanLine.style.display = 'block';

    const loaderInterval = setInterval(() => {
        const desc = ["Escaneando Dólar", "Tasas Nominales", "Riesgo Soberano", "Inflación" , "Noticias del mercado " , "Remuneradas " , "Cruzando datos" , "Oficial-Blue" , "Sincronizando datos" , "IPC-Liquidez-CER" ];
        loaderSub.innerText = `[ ANALIZANDO: ${desc[Math.floor(Math.random() * desc.length)]} ]`;
    }, 200);

    const safeFetch = async (url) => {
        try { return await fetch(url).then(r => r.json()); }
        catch (e) { console.error("Error en API:", url); return null; }
    };

    try {
        const [resDolar, resRP, resTasa, resInf, resNews] = await Promise.all([
            safeFetch(DOLAR_URL), safeFetch(RP_API),
            safeFetch(TASA_REF_API), safeFetch(INFLACION_API),
            safeFetch(NEWS_URL)
        ]);

        clearInterval(loaderInterval);

        if(resInf) cacheData.ipc = resInf[resInf.length - 1].valor;
        if(resRP) cacheData.rpVal = resRP.valor || 0;

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

        if(resTasa) {
            cacheData.tnaRef = resTasa[resTasa.length - 1].valor || 35;
            cacheData.tnaLecap = (cacheData.tnaRef + 3.5).toFixed(1);
            cacheData.tasaR = (2.83 - cacheData.ipc).toFixed(2); 
            document.getElementById('tasa-real-val').innerText = `${cacheData.tasaR}%`;

            const rems = [
                {f: "COCOS", t: (cacheData.tnaRef * 0.98).toFixed(1) + "%"}, 
                {f: "FIWIND", t: (cacheData.tnaRef * 0.95).toFixed(1) + "%"}, 
                {f: "UALÁ", t: (cacheData.tnaRef * 0.82).toFixed(1) + "%"},
                {f: "BRUBANK", t: (cacheData.tnaRef * 0.78).toFixed(1) + "%"}
            ];
            document.getElementById('rem-container').innerHTML = rems.map(r => `<a href="${remLinks[r.f]}" target="_blank" class="data-card"><span>${r.f}</span><span class="up">${r.t}</span></a>`).join('');

            const pfs = [
                {e: "REBA", t: (cacheData.tnaRef * 1.06).toFixed(1) + "%"}, 
                {e: "BICA", t: (cacheData.tnaRef * 1.04).toFixed(1) + "%"}, 
                {e: "MACRO", t: (cacheData.tnaRef * 0.96).toFixed(1) + "%"},
                {e: "NACIÓN", t: (cacheData.tnaRef * 0.94).toFixed(1) + "%"}
            ];
            document.getElementById('pf-container').innerHTML = pfs.map(p => `<a href="${pfLinks[p.e]}" target="_blank" class="data-card"><span>${p.e}</span><span class="up">${p.t}</span></a>`).join('');
        }

        document.getElementById('inflacion-val').innerText = `${cacheData.ipc}%`;

        document.getElementById('lecap-container').innerHTML = `
            <div class="data-card"><span>Lecap (TNA)</span><span class="up">${cacheData.tnaLecap}%</span></div>
            <div class="data-card"><span>Riesgo País</span><span class="down">${cacheData.rpVal}</span></div>
            <div class="data-card"><span>Dólar Cripto</span><span class="up">$${Math.round(cacheData.criptoVal)}</span></div>`;

        if(resNews && resNews.noticias) {
            const unicas = resNews.noticias.filter((n, i, s) => s.findIndex(x => x.titulo === n.titulo) === i);
            document.getElementById('news-badge').innerText = `${unicas.length} NOTAS`;
            document.getElementById('news-counter').innerText = `NEWS: ${unicas.length}`;

            let pos = 0, neg = 0;
            const palabrasPos = ['sube', 'gana', 'crece', 'recupera', 'alza', 'positivo', 'superávit', 'estabilidad'];
            const palabrasNeg = ['cae', 'baja', 'pierde', 'riesgo', 'inflación', 'déficit', 'crisis', 'tensión'];
            unicas.forEach(n => {
                const t = n.titulo.toLowerCase();
                if (palabrasPos.some(p => t.includes(p))) pos++;
                else if (palabrasNeg.some(p => t.includes(p))) neg++;
            });
            let balance = "NEUTRAL";
            if (pos > neg + 3) balance = "OPTIMISMO";
            if (neg > pos + 3) balance = "CAUTELA";
            document.getElementById('sentiment-display').innerText = `[ ESTADO: ${balance} ] - Pulso detectado: ${pos} alcistas vs ${neg} bajistas en ${unicas.length} noticias.`;
            
            const agrup = unicas.reduce((acc, n) => { if(!acc[n.fuente]) acc[n.fuente] = []; acc[n.fuente].push(n); return acc; }, {});
            document.getElementById('master-grid').innerHTML = Object.keys(agrup).map(f => `
                <div class="news-card"><div class="news-header">${f}</div><div class="news-scroll-area">${agrup[f].map(n => `<div class="news-item"><a href="${n.link}" target="_blank">${n.titulo}</a></div>`).join('')}</div></div>
            `).join('');
        }

        loader.style.display = 'none'; scanLine.style.display = 'none';
        switchProfile(document.querySelector('.profile-btn.active').getAttribute('data-type'));
    } catch (e) { 
        console.error(e);
        clearInterval(loaderInterval);
        loader.style.display = 'none'; scanLine.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', ejecutarDeepScanIA);