// monitoring.js - Gestión de Tasas y Enlaces
function updateMonitoring(resTasa) {
    const remLinks = { "COCOS": "https://www.cocos.capital/", "FIWIND": "https://www.fiwind.io/", "UALÁ": "https://www.uala.com.ar/", "BRUBANK": "https://www.brubank.com/" };
    const pfLinks = { "REBA": "https://www.reba.com.ar/", "BICA": "https://www.bancobica.com.ar/", "MACRO": "https://www.macro.com.ar/", "NACIÓN": "https://www.bna.com.ar/" };

    try {
        if (!resTasa) return;

        const tnaRef = resTasa[resTasa.length - 1].valor || 35;
        window.cacheData.tnaRef = tnaRef;
        window.cacheData.tnaLecap = (tnaRef + 3.5).toFixed(1);
        window.cacheData.tasaR = (2.83 - window.cacheData.ipc).toFixed(2);

        const trVal = document.getElementById('tasa-real-val');
        if(trVal) trVal.innerText = `${window.cacheData.tasaR}%`;

        // 1. Cuentas Remuneradas
        const rems = [
            {f: "COCOS", t: (tnaRef * 0.98).toFixed(1) + "%"}, 
            {f: "FIWIND", t: (tnaRef * 0.95).toFixed(1) + "%"}, 
            {f: "UALÁ", t: (tnaRef * 0.82).toFixed(1) + "%"},
            {f: "BRUBANK", t: (tnaRef * 0.78).toFixed(1) + "%"}
        ];
        const remCont = document.getElementById('rem-container');
        if(remCont) {
            remCont.innerHTML = rems.map(r => `
                <a href="${remLinks[r.f]}" target="_blank" class="data-card">
                    <span>${r.f}</span><span class="up">${r.t}</span>
                </a>`).join('');
        }

        // 2. Plazos Fijos
        const pfs = [
            {e: "REBA", t: (tnaRef * 1.06).toFixed(1) + "%"}, 
            {e: "BICA", t: (tnaRef * 1.04).toFixed(1) + "%"}, 
            {e: "MACRO", t: (tnaRef * 0.96).toFixed(1) + "%"},
            {e: "NACIÓN", t: (tnaRef * 0.94).toFixed(1) + "%"}
        ];
        const pfCont = document.getElementById('pf-container');
        if(pfCont) {
            pfCont.innerHTML = pfs.map(p => `
                <a href="${pfLinks[p.e]}" target="_blank" class="data-card">
                    <span>${p.e}</span><span class="up">${p.t}</span>
                </a>`).join('');
        }

        // 3. Lecaps y Otros
        const lecapCont = document.getElementById('lecap-container');
        if (lecapCont) {
            lecapCont.innerHTML = `
                <div class="data-card"><span>Lecap (TNA)</span><span class="up">${window.cacheData.tnaLecap}%</span></div>
                <div class="data-card"><span>Riesgo País</span><span class="down">${window.cacheData.rpVal}</span></div>
                <div class="data-card"><span>Dólar Cripto</span><span class="up">$${Math.round(window.cacheData.criptoVal)}</span></div>
            `;
        }
    } catch (e) {
        console.error("Error en monitoring.js:", e);
    }
}