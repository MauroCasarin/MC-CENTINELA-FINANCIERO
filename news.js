function updateNews(resNews) {
    const grid = document.getElementById('master-grid');
    if(!grid || !resNews || !resNews.noticias) return;

    const unicas = resNews.noticias.slice(0, 8); // Tomar solo 8 para no saturar el móvil

    grid.innerHTML = `
        <div class="section-box" style="margin-top:15px">
            <div class="section-header">FLUJO DE NOTICIAS CRÍTICAS</div>
            <div style="max-height: 250px; overflow-y: auto;">
                ${unicas.map(n => `
                    <div class="data-card">
                        <a href="${n.link}" target="_blank" style="color:inherit; text-decoration:none; font-size:0.8rem;">
                            <i class="fa-solid fa-angle-right"></i> ${n.titulo}
                        </a>
                        <span style="color:var(--gold); font-size:0.6rem; margin-left:10px">${n.fuente}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}