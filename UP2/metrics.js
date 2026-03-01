// metrics.js - Procesamiento de Números (Incluye MERVAL y ORO)
function updateMetrics(resDolar, resRP, resInf, resMerval, resOro) {
    try {
        // 1. Inflación (IPC)
        if(resInf && Array.isArray(resInf)) {
            const ultimoIPC = resInf[resInf.length - 1].valor;
            window.cacheData.ipc = ultimoIPC;
            const el = document.getElementById('inflacion-val');
            if(el) el.innerText = `${ultimoIPC}%`;
        }

        // 2. Riesgo País
        if(resRP) {
            window.cacheData.rpVal = resRP.valor || 0;
        }

        // 3. MERVAL y ORO (Nuevos)
        if(resMerval) {
            const mervalVal = Math.round(resMerval.valor);
            window.cacheData.merval = mervalVal;
            const elM = document.getElementById('merval-val');
            if(elM) elM.innerText = `${mervalVal.toLocaleString()} USD`;
        }

        if(resOro) {
            const oroVal = resOro.price || resOro.value || 0;
            window.cacheData.oro = oroVal;
            const elO = document.getElementById('oro-val');
            if(elO) elO.innerText = `$${Math.round(oroVal).toLocaleString()}`;
        }

        // 4. Dólares y Brecha
        if(resDolar && Array.isArray(resDolar)) {
            const oficial = resDolar.find(d => d.casa === 'oficial')?.venta || 1;
            const blue = resDolar.find(d => d.casa === 'blue')?.venta || 0;
            
            window.cacheData.blueVal = blue;
            const brechaCalc = (((blue / oficial) - 1) * 100).toFixed(1);
            window.cacheData.brecha = brechaCalc;

            if(document.getElementById('brecha-val')) document.getElementById('brecha-val').innerText = `${brechaCalc}%`;

            const cont = document.getElementById('dolar-container');
            if(cont) {
                cont.innerHTML = resDolar.slice(0, 4).map(d => `
                    <div class="data-card">
                        <span>${d.nombre}</span>
                        <b class="${d.casa === 'blue' ? 'up' : ''}">$${Math.round(d.venta)}</b>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error("Error en metrics.js:", e);
    }
}