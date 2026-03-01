function initIntelligence() {
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.onclick = () => switchProfile(btn.getAttribute('data-type'));
    });
    switchProfile('cons'); // Perfil inicial
}

function switchProfile(type) {
    document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    const display = document.getElementById('ai-strategy-text');
    const { ipc, tnaRef, brecha, merval } = window.cacheData;

    let txt = "";
    if(type === 'cons') {
        txt = `Análisis: IPC en ${ipc}%. Sugerimos 70% en Cuentas Remuneradas y 30% Plazo Fijo (TNA ${tnaRef}%). Riesgo bajo.`;
    } else if(type === 'mod') {
        txt = `Análisis: Brecha en ${brecha}%. Sugerimos instrumentos que ajusten por CER o LECAPS para ganarle a la inflación.`;
    } else {
        txt = `Análisis: Merval en ${(merval/1000).toFixed(0)}K. Oportunidad en CEDEARS si la brecha sube. Alto riesgo.`;
    }
    display.innerHTML = `<i class="fa-solid fa-robot"></i> ${txt}`;
}