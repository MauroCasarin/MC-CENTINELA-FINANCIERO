// Lógica de Dólares, Inflación y Riesgo País
async function updateMetrics(resDolar, resRP, resInf) {
    // Inflación
    if(resInf && resInf.length > 0) {
        cacheData.ipc = resInf[resInf.length - 1].valor || 0;
        document.getElementById('inflacion-val').innerText = `${cacheData.ipc}%`;
    }

    // Riesgo País
    if(resRP) cacheData.rpVal = resRP.valor || 0;

    // Dólares
    if(resDolar) {
        const oficial = resDolar.find(d => d.casa === 'oficial')?.venta || 1;
        cacheData.blueVal = resDolar.find(d => d.casa === 'blue')?.venta || 1;
        cacheData.criptoVal = resDolar.find(d => d.casa === 'cripto')?.venta || 0;
        cacheData.brecha = (((cacheData.blueVal/oficial)-1)*100).toFixed(1);
        
        document.getElementById('dolar-container').innerHTML = resDolar.slice(0,4).map(d => 
            `<div class="data-card"><span>${d.nombre}</span><span>$${Math.round(d.venta)}</span></div>`
        ).join('');
        
        // CAMBIO: Se comenta la siguiente línea porque el ID 'mon-badge' ya no existe en el index.html
        // document.getElementById('mon-badge').innerText = `$${Math.round(cacheData.blueVal)}`;
        
        document.getElementById('brecha-val').innerText = `${cacheData.brecha}%`;
        document.getElementById('metrics-badge').innerText = `BRECHA ${cacheData.brecha}%`;
    }
}