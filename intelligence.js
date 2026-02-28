// Lógica de Inteligencia y Perfiles
const diccionario = {
    "IPC": "Inflación mensual medida por el INDEC.",
    "Brecha": "Diferencia entre dólar oficial y libres.",
    "Lecaps": "Letras con tasa fija mensual.",
    "Riesgo País": "Costo de deuda de un país."
};

let typingTimer = null;

function resetAnálisis() {
    clearTimeout(typingTimer);
    document.getElementById('ai-text').innerHTML = "";
    document.getElementById('market-pct').innerHTML = "";
}

function typeWriter(text, elementId, callback) {
    const ele = document.getElementById(elementId);
    if (!ele) return;
    let i = 0;
    let processedText = text;
    for (let term in diccionario) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        processedText = processedText.replace(regex, `<span class="term-tooltip" title="${diccionario[term]}">${term}</span>`);
    }
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<b style="color:var(--gold)">$1</b>');

    function type() {
        if (i < processedText.length) {
            if (processedText[i] === '<') i = processedText.indexOf('>', i) + 1; else i++;
            ele.innerHTML = processedText.substring(0, i);
            typingTimer = setTimeout(type, 5);
        } else if (callback) callback();
    }
    type();
}

function switchProfile(type) {
    document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-type="${type}"]`);
    if(btn) btn.classList.add('active');
    resetAnálisis();
    generarAnalisis(type);
}

function generarAnalisis(type) {
    let txt = "";
    const mensualPF = (cacheData.tnaRef / 12).toFixed(2);
    if(type === 'cons') {
        txt = `SISTEMA: Análisis Conservador. IPC: **${cacheData.ipc}%**. Plazos Fijos rinden **${mensualPF}%** mensual. \n\n**ESTRATEGIA:** Busque bancos con TNA estable. Liquidez en billeteras solo para lo diario.`;
    } else if(type === 'mod') {
        txt = `SISTEMA: Evaluación Moderada. Brecha: **${cacheData.brecha}%**. Riesgo País: **${cacheData.rpVal}**. \n\n**CONSEJO:** Dólar Cripto a $${Math.round(cacheData.criptoVal)} marca el pulso del mercado.`;
    } else {
        txt = `SISTEMA: Protocolo Agresivo. La **Lecap** es la opción ganadora si la brecha no salta. \n\n**OPERATIVA:** Carry trade activo.`;
    }
    
    typeWriter(txt, "ai-text", () => {
        document.getElementById('market-pct').innerText = "98%";
        document.getElementById('ia-badge').innerText = "98% CONF";
    });
}