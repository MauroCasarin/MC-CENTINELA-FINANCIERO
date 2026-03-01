function updateMetrics(resDolar, resRP, resInf, merval) {
    if (resDolar) {
        const blue = resDolar.find(d => d.casa === "blue");
        const mep = resDolar.find(d => d.casa === "mep");
        const oficial = resDolar.find(d => d.casa === "oficial");
        
        if (blue) document.getElementById('dolar-blue-val').innerText = `$${blue.venta}`;
        if (mep) document.getElementById('dolar-mep-val').innerText = `$${mep.venta}`;
        
        if (blue && oficial) {
            window.cacheData.brecha = ((blue.venta / oficial.venta - 1) * 100).toFixed(1);
            document.getElementById('brecha-val').innerText = `${window.cacheData.brecha}%`;
        }
    }

    if (resRP) document.getElementById('riesgo-val').innerText = Math.floor(resRP.valor);
    
    if (resInf && resInf.length > 0) {
        window.cacheData.ipc = resInf[resInf.length - 1].valor;
        document.getElementById('ipc-val').innerText = `${window.cacheData.ipc}%`;
    }

    if (merval) document.getElementById('merval-val').innerText = `${(merval/1000).toFixed(0)}K pts`;
}