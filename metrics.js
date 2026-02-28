// Lógica de Dólares, Inflación y Riesgo País
async function updateMetrics(resDolar, resRP, resInf) {
    // Inflación
    if(resInf && resInf.length > 0) {
        cacheData.ipc = resInf[resInf.length - 1].valor || 0;
        const inflaElem = document.getElementById('inflacion-val');
        if(inflaElem) inflaElem.innerText = `${cacheData.ipc}%`;
    }

    // Riesgo País
    if(resRP) cacheData.rpVal = resRP.valor || 0;

    // Dólares
    if(resDolar) {
        const oficial = resDolar.find(d => d.casa === 'oficial')?.venta || 1;
        cacheData.blueVal = resDolar.find(d => d.casa === 'blue')?.venta || 1;
        cacheData.criptoVal = resDolar.find(d => d.casa === 'cripto')?.venta || 0;
        cacheData.brecha = (((cacheData.blueVal/oficial)-1)*100).toFixed(1);
        
        const dolarCont = document.getElementById('dolar-container');
        if(dolarCont) {
            dolarCont.innerHTML = resDolar.slice(0,4).map(d => 
                `<div class="data-card"><span>${d.nombre}</span><span>$${Math.round(d.venta)}</span></div>`
            ).join('');
        }
        
        // Se eliminó la referencia a 'mon-badge' para evitar el error de null
        
        const brechaVal = document.getElementById('brecha-val');
        if(brechaVal) brechaVal.innerText = `${cacheData.brecha}%`;

        const metricsBadge = document.getElementById('metrics-badge');
        if(metricsBadge) metricsBadge.innerText = `BRECHA ${cacheData.brecha}%`;
    }
}