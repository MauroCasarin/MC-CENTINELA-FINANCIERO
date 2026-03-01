// monitoring.js - Sincronización basada en Comparatasas.ar
function updateMonitoring(datos) {
    const pfCont = document.getElementById('pf-container');
    const remCont = document.getElementById('rem-container');
    const lecapCont = document.getElementById('lecap-container');

    if (!datos || !Array.isArray(datos)) return;

    // Procesar datos (TNA de clientes o no clientes, evitando NaN)
    const items = datos.map(i => ({
        entidad: i.entidad.toUpperCase(),
        tna: (i.tnaClientes || i.tnaNoClientes || 0) * 100 
    })).sort((a, b) => b.tna - a.tna);

    // 1. BANCOS SELECCIONADOS
    const bancosInteres = [
        { id: "NACION", label: "NACIÓN" },
        { id: "GALICIA", label: "GALICIA" },
        { id: "PROVINCIA", label: "PROVINCIA" }
    ];

    if(pfCont) {
        pfCont.innerHTML = bancosInteres.map(b => {
            const match = items.find(i => i.entidad.includes(b.id));
            return `<div class="data-card"><span>${b.label}</span><b class="up">${match ? match.tna.toFixed(1) : "0.0"}%</b></div>`;
        }).join('');
    }

    // 2. BILLETERAS REALES
    const billeterasInteres = [
        { id: "MERCADO PAGO", label: "M. PAGO" },
        { id: "NARANJA X", label: "NARANJA X" },
        { id: "UALA", label: "Ualá" }
    ];

    if(remCont) {
        remCont.innerHTML = billeterasInteres.map(w => {
            const match = items.find(i => i.entidad.includes(w.id));
            return `<div class="data-card"><span>${w.label}</span><b class="up">${match ? match.tna.toFixed(1) : "0.0"}%</b></div>`;
        }).join('');
    }

    // 3. ACTUALIZACIÓN DE REFERENCIAS
    const tnaMax = items.length > 0 ? items[0].tna : 35;
    window.cacheData.tnaRef = tnaMax;
    window.cacheData.tnaLecap = (tnaMax + 3.5).toFixed(1);

    if(lecapCont) {
        lecapCont.innerHTML = `
            <div class="data-card" style="width:100%; justify-content:space-between; display:flex; padding:10px 15px;">
                <span>LECAP (ESTIMADA)</span><b class="up">${window.cacheData.tnaLecap}% TNA</b>
            </div>`;
    }
}