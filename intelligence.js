// intelligence.js - Lógica de Perfiles e IA
const diccionarioIA = {
    "IPC": "Inflación mensual medida por el INDEC.",
    "Brecha": "Diferencia entre dólar oficial y libres.",
    "Lecaps": "Letras con tasa fija mensual.",
    "Riesgo País": "Costo de deuda de un país."
};

let typingTimer = null;

// Función para el efecto de escritura con soporte para HTML y Diccionario
function typeWriterIA(text, elementId) {
    const ele = document.getElementById(elementId);
    if(!ele) return;
    
    let i = 0;
    let processedText = text;
    
    // 1. Aplicar términos del diccionario con tooltips
    for (let term in diccionarioIA) {
        const regex = new RegExp(`\\\\b${term}\\\\b`, 'gi');
        processedText = processedText.replace(regex, `<span class=\"term-tooltip\" title=\"${diccionarioIA[term]}\">${term}</span>`);
    }
    
    // 2. Convertir negritas de Markdown a HTML
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<b style="color:var(--gold)">$1</b>');

    ele.innerHTML = "";
    clearTimeout(typingTimer);

    function type() {
        if (i < processedText.length) {
            // Saltar etiquetas HTML para que no se vean mientras se escribe
            if (processedText[i] === '<') {
                i = processedText.indexOf('>', i) + 1;
            } else {
                i++;
            }
            ele.innerHTML = processedText.substring(0, i);
            typingTimer = setTimeout(type, 5);
        }
    }
    type();
}

async function switchProfile(type) {
    // 1. Cambiar estado visual de botones
    document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-type="${type}"]`);
    if(btn) btn.classList.add('active');

    // 2. Obtener datos actuales de la memoria global (cacheData de main.js/metrics.js)
    const data = window.cacheData || { ipc: 0, brecha: 0, tnaLecap: 0, tnaRef: 0, rpVal: 0 };
    
    // Cálculos de inteligencia extraídos del index
    const mensualLecap = (data.tnaLecap / 12).toFixed(2);
    const mensualPF = (data.tnaRef / 12).toFixed(2);
    
    let txt = "";

    if(type === 'cons') {
        txt = `SISTEMA: Perfil **Conservador**. Con un **IPC del ${data.ipc}%**, los Plazos Fijos rinden **${mensualPF}%**. \n\n**DIAGNÓSTICO:** ${mensualPF < data.ipc ? 'SUS PESOS PIERDEN PODER COMPRA.' : 'Mantiene valor relativo.'} \n\n**CONSEJO:** Priorice liquidez inmediata o activos con ajuste **CER** para cobertura directa.`;
    } else if(type === 'mod') {
        txt = `SISTEMA: Perfil **Moderado**. **Brecha** detectada: **${data.brecha}%**. \n\n**ESTRATEGIA:** Sugerido 40% en **Lecaps** (${mensualLecap}% mensual) y 60% en activos dolarizados (MEP/Cripto) para capturar tasa sin descuidar capital.`;
    } else {
        txt = `SISTEMA: Protocolo **Agresivo**. La **Lecap** ofrece un spread real de **${(mensualLecap - data.ipc).toFixed(2)}%** sobre inflación. \n\n**OPERATIVA:** Máximo Carry Trade mientras la **Brecha** se mantenga estable. Alerta de salida si el Riesgo País supera los 1500 puntos.`;
    }

    // 3. Ejecutar el efecto de escritura
    typeWriterIA(txt, 'ai-text');
}