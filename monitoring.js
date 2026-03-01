function updateMonitoring(datos) {
    const pfCont = document.getElementById('pf-container');
    const remCont = document.getElementById('rem-container');
    if (!datos || !Array.isArray(datos)) return;

    const items = datos.map(i => ({
        entidad: i.entidad.toUpperCase(),
        tna: (i.tnaClientes || i.tnaNoClientes || 0) * 100 
    })).sort((a, b) => b.tna - a.tna);

    // Guardar referencia para inteligencia
    if(items.length > 0) window.cacheData.tnaRef = items[0].tna;

    const billeteras = [
        { id: "MERCADO PAGO", label: "M. PAGO" },
        { id: "NARANJA X", label: "NARANJA X" },
        { id: "UALA", label: "Ualá" }
    ];

    if(remCont) {
        remCont.innerHTML = billeteras.map(w => {
            const match = items.find(i => i.entidad.includes(w.id));
            return `<div class="data-card"><span>${w.label}</span><b class="up">${match ? match.tna.toFixed(1) : "0.0"}%</b></div>`;
        }).join('');
    }
}