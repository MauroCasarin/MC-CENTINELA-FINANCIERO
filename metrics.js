// metrics.js - Procesamiento de Números
function updateMetrics(resDolar, resRP, resInf) {
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

        // 3. Dólares y Brecha
        if(resDolar && Array.isArray(resDolar)) {
            const oficial = resDolar.find(d => d.casa === 'oficial')?.venta || 1;
            const blue = resDolar.find(d => d.casa === 'blue')?.venta || 0;
            const cripto = resDolar.find(d => d.casa === 'cripto')?.venta || 0;
            
            window.cacheData.blueVal = blue;
            window.cacheData.criptoVal = cripto;
            
            const brechaCalc = (((blue / oficial) - 1) * 100).toFixed(1);
            window.cacheData.brecha = brechaCalc;

            // Actualizar UI
            if(document.getElementById('brecha-val')) document.getElementById('brecha-val').innerText = `${brechaCalc}%`;
            if(document.getElementById('metrics-badge')) document.getElementById('metrics-badge').innerText = `BRECHA ${brechaCalc}%`;
            if(document.getElementById('mon-badge')) document.getElementById('mon-badge').innerText = `$${Math.round(blue)}`;

            // Grid de Dólares
            const cont = document.getElementById('dolar-container');
            if(cont) {
                cont.innerHTML = resDolar.slice(0, 4).map(d => `
                    <div class="data-card">
                        <span>${d.nombre}</span>
                        <span>$${Math.round(d.venta)}</span>
                    </div>
                `).join('');
            }
        }
    } catch (e) { 
        console.error("Error en metrics.js:", e); 
    }
}