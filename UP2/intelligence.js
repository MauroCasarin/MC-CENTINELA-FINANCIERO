// intelligence.js - Sistema de Recomendación Inteligente CENTINELA
function switchProfile(type) {
    // 1. Gestionar estados visuales de los botones
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('data-type') === type) btn.classList.add('active');
    });

    const display = document.getElementById('ai-strategy-text');
    if(!display) return;

    // 2. Obtener datos actuales del mercado desde el cache global
    const ipc = window.cacheData.ipc || 0;
    const tna = window.cacheData.tnaRef || 35;
    const brecha = window.cacheData.brecha || 0;

    let strategy = "";
    let color = "var(--blue)";

    // 3. Lógica de recomendación según Perfil y Datos Reales
    switch(type) {
        case 'cons':
            strategy = `Priorizar liquidez inmediata. Con una inflación del ${ipc}%, se recomienda: 
                        • 60% en Cuentas Remuneradas (nombres detectados: M. Pago/Naranja X) para disponibilidad 24/7. 
                        • 40% en Plazo Fijo Tradicional aprovechando la TNA del ${tna}%. 
                        Objetivo: Mantener poder de compra con riesgo nulo.`;
            color = "var(--up)";
            break;

        case 'mod':
            strategy = `Búsqueda de retorno real positivo. 
                        • 50% en LECAPS estimadas al ${window.cacheData.tnaLecap}% (superan al Plazo Fijo). 
                        • 30% en Fondos MM. 
                        • 20% en Dólar MEP si la brecha es menor al 20% (Actual: ${brecha}%). 
                        Estrategia equilibrada frente a la volatilidad.`;
            color = "var(--gold)";
            break;

        case 'agr':
            strategy = `Maximización de capital en escenario de brecha del ${brecha}%. 
                        • Cobertura en activos dolarizados o CEDEARS. 
                        • Exposición a Merval (actualmente en ${window.cacheData.merval} pts) buscando rebote técnico. 
                        • Solo 10% en pesos para gastos operativos. 
                        Alerta: El riesgo de volatilidad es alto, monitorear noticias en tiempo real.`;
            color = "#ff4444";
            break;
    }

    // 4. Inyectar el texto con efecto de "escritura" de terminal
    display.style.color = color;
    display.innerHTML = `<i class="fa-solid fa-microchip"></i> ANÁLISIS FINAL: <br><br>${strategy}`;
}

// Inicialización por defecto
document.addEventListener('DOMContentLoaded', () => {
    // Escuchar clicks en los botones de perfil
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchProfile(btn.getAttribute('data-type'));
        });
    });
});