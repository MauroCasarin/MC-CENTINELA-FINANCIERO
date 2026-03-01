// monitoring.js - Sincronización Real de Tasas
function updateMonitoring(datos) {
    const pfCont = document.getElementById('pf-container');
    const remCont = document.getElementById('rem-container');
    const lecapCont = document.getElementById('lecap-container');

    if (!datos || !Array.isArray(datos)) return;

    // Procesamos y ordenamos (Lógica extraída de usePlazosFijos.ts)
    const items = datos.map(i => ({
        entidad: i.entidad.toUpperCase(),
        // Respaldo de TNA: busca clientes, luego no clientes, sino 0
        tna: (i.tnaClientes || i.tnaNoClientes || 0) * 100 
    })).sort((a, b) => b.tna - a.tna);

    // Bancos (Plazos Fijos)
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

    // Billeteras (Cuentas Remuneradas - IDs de Comparatasas)
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

    // Actualización de Lecap y TEA Límite
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