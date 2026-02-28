// Lógica de Billeteras, Plazos Fijos y Monitoreo
const remLinks = { 
    "mercadopago": "https://www.mercadopago.com.ar/cuentas-y-tarjetas/invertir-dinero", 
    "naranjax": "https://www.naranjax.com/cuenta-remunerada", 
    "personalpay": "https://www.personalpay.com.ar/", 
    "uala": "https://www.uala.com.ar/aula/inversiones/cuenta-remunerada",
    "fiwind": "https://www.fiwind.io/", "belo": "https://www.belo.app/",
    "lemoncash": "https://www.lemon.me/", "nexo": "https://nexo.com/es"
};

const bancoLinks = {
    "BANCO DE LA NACION ARGENTINA": "https://www.bna.com.ar/Personas/PlazoFijo",
    "BANCO SANTANDER ARGENTINA S.A.": "https://www.santander.com.ar/personas/inversiones/plazos-fijos",
    "BANCO GALICIA Y BUENOS AIRES S.A.U.": "https://www.galicia.ar/personas/inversiones/plazo-fijo",
    "BANCO PROVINCIA DE BUENOS AIRES": "https://www.bancoprovincia.com.ar/Personal/Inversiones/plazo_fijo_digital",
    "BANCO BBVA ARGENTINA S.A.": "https://www.bbva.com.ar/personas/productos/inversiones/plazos-fijos.html",
    "BANCO MACRO S.A.": "https://www.macro.com.ar/personas/inversiones/plazos-fijos",
    "HSBC BANK ARGENTINA S.A.": "https://www.hsbc.com.ar/inversiones/plazos-fijos/",
    "BANCO CREDICOOP COOPERATIVO LIMITADO": "https://www.bancocredicoop.coop/personas/inversiones/plazos-fijos"
};

function updateMonitoring(resTasaRem, resTasaPF) {
    // Billeteras
    if(resTasaRem && Array.isArray(resTasaRem)) {
        const ids = ["mercadopago", "naranjax", "personalpay", "uala", "fiwind", "belo", "lemoncash", "nexo"];
        let htmlRem = "";
        ids.forEach(id => {
            const entidad = resTasaRem.find(e => e.entidad === id);
            if (entidad && entidad.rendimientos) {
                const rinde = entidad.rendimientos.find(r => r.moneda === "ARS") || entidad.rendimientos.find(r => r.moneda === "USDT");
                if (rinde) {
                    htmlRem += `<a href="${remLinks[id]}" target="_blank" class="data-card" style="text-decoration:none; color:inherit;">
                        <span>${id.toUpperCase()}</span><span class="up">${rinde.apy.toFixed(1)}%</span></a>`;
                }
            }
        });
        document.getElementById('rem-container').innerHTML = htmlRem;
    }

    // Plazos Fijos
    if(resTasaPF && Array.isArray(resTasaPF)) {
        const top = resTasaPF.filter(p => p.tnaClientes > 0).sort((a,b) => b.tnaClientes - a.tnaClientes).slice(0,4);
        if(top.length > 0) {
            cacheData.tnaRef = top[0].tnaClientes * 100;
            document.getElementById('pf-container').innerHTML = top.map(p => {
                const link = bancoLinks[p.entidad] || "https://www.bna.com.ar/";
                return `<a href="${link}" target="_blank" class="data-card" style="text-decoration:none; color:inherit;">
                    <img src="${p.logo}" style="width:14px; margin-right:5px; vertical-align:middle" onerror="this.style.display='none'">
                    <span>${p.entidad.substring(0,10)}</span><span class="up">${(p.tnaClientes * 100).toFixed(1)}%</span></a>`;
            }).join('');
        }
    }

    // Bloque Monitoreo
    const lecapTna = (cacheData.tnaRef + 4.2).toFixed(1);
    document.getElementById('lecap-container').innerHTML = `
        <div class="data-card"><span>Lecap (TNA Est.)</span><span class="up">${lecapTna}%</span></div>
        <div class="data-card"><span>Riesgo País</span><span class="down">${cacheData.rpVal}</span></div>
        <div class="data-card"><span>Dólar Cripto</span><span class="up">$${Math.round(cacheData.criptoVal)}</span></div>
    `;
    document.getElementById('tasa-real-val').innerText = `${((cacheData.tnaRef / 12) - cacheData.ipc).toFixed(2)}%`;
}