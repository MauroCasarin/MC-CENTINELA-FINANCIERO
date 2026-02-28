// monitoring.js - Gestión de Tasas y Enlaces (Compatible con Diseño Horizontal)
function updateMonitoring(resTasa) {
    const remLinks = { "COCOS": "https://www.cocos.capital/", "FIWIND": "https://www.fiwind.io/", "UALÁ": "https://www.uala.com.ar/", "BRUBANK": "https://www.brubank.com/" };
    const pfLinks = { "REBA": "https://www.reba.com.ar/", "BICA": "https://www.bancobica.com.ar/", "MACRO": "https://www.macro.com.ar/", "NACIÓN": "https://www.bna.com.ar/" };

    try {
        if (!resTasa) return;

        const tnaRef = resTasa[resTasa.length - 1].valor || 35;
        window.cacheData.tnaRef = tnaRef;
        window.cacheData.tnaLecap = (tnaRef + 3.5).toFixed(1);
        
        // 1. Cuentas Remuneradas (INSTRUMENTOS EN PESOS)
        const rems = [
            {f: "COCOS", t: (tnaRef * 0.98).toFixed(1) + "%"},
            {f: "FIWIND", t: (tnaRef * 0.95).toFixed(1) + "%"},
            {f: "UALÁ", t: (tnaRef * 0.88).toFixed(1) + "%"},
            {f: "BRUBANK", t: (tnaRef * 0.85).toFixed(1) + "%"}
        ];
        
        const remCont = document.getElementById('rem-container');
        if(remCont) {
            remCont.innerHTML = rems.map(r => `
                <a href="${remLinks[r.f]}" target="_blank" class="data-card">
                    <span>${r.f}</span>
                    <span class="up">${r.t}</span>
                </a>`).join('');
        }

        // 2. Plazos Fijos (INSTRUMENTOS EN PESOS)
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
                    <span>${p.e}</span>
                    <span class="up">${p.t}</span>
                </a>`).join('');
        }

        // 3. Lecaps (OPORTUNIDADES Y RIESGO)
        const lecapCont = document.getElementById('lecap-container');
        if (lecapCont) {
            lecapCont.innerHTML = `
                <div class="data-card" style="width: 100%; justify-content: space-between; display: flex;">
                    <span>LECAP (ESTIMADA)</span>
                    <b class="up">${window.cacheData.tnaLecap}% TNA</b>
                </div>
                <div class="data-card" style="width: 100%; justify-content: space-between; display: flex; border-top: 1px solid var(--border);">
                    <span>TEA LÍMITE</span>
                    <b style="color: var(--gold)">${(parseFloat(window.cacheData.tnaLecap) * 1.1).toFixed(1)}%</b>
                </div>
            `;
        }

    } catch (e) {
        console.error("Error en monitoring.js:", e);
    }
}