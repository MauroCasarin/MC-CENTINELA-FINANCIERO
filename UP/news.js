// news.js - Gestión de Noticias - VERSIÓN COMPACTA
function updateNews(resNews) {
    const badge = document.getElementById('news-badge');
    const grid = document.getElementById('master-grid');
    const sentiment = document.getElementById('sentiment-display');
    
    if (!resNews || !resNews.noticias) {
        console.error("Formato de noticias inválido");
        return;
    }

    // 1. Limpiar duplicados por título
    const unicas = resNews.noticias.filter((n, i, s) => 
        s.findIndex(x => x.titulo === n.titulo) === i
    );
    
    if(badge) badge.innerText = `${unicas.length} NOTAS`;

    // 2. Renderizar Noticias en UN SOLO contenedor - ALTURA MÍNIMA (180px)
    if(grid) {
        grid.innerHTML = `
            <div class="news-card" style="grid-column: 1 / -1; margin-bottom: 10px;">
                <div class="news-header" style="padding: 5px 10px; font-size: 0.65rem;">DATOS EN TIEMPO REAL</div>
                <div class="news-scroll-area" style="max-height: 180px; overflow-y: auto; padding: 0 10px;">
                    ${unicas.map(n => `
                        <div class="news-item" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid rgba(0, 210, 255, 0.05);">
                            <a href="${n.link}" target="_blank" style="flex: 1; text-decoration: none; color: var(--txt); font-size: 0.85em; line-height: 1.2; padding-right: 10px;">
                                <i class="fa-solid fa-angle-right" style="color: var(--blue); margin-right: 5px; font-size: 0.8em;"></i>
                                ${n.titulo}
                            </a>
                            <span style="font-size: 0.6em; opacity: 0.5; color: var(--gold); white-space: nowrap; margin-top: 2px;">
                                ${n.fuente.toUpperCase()}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 3. Análisis de Sentimiento
    if(sentiment) {
        let pos = 0, neg = 0;
        const palabrasPos = ['sube', 'gana', 'crece', 'recupera', 'alza', 'positivo', 'superávit', 'mejor'];
        const palabrasNeg = ['cae', 'baja', 'pierde', 'riesgo', 'inflación', 'déficit', 'crisis', 'deuda'];
        
        unicas.forEach(n => {
            const t = n.titulo.toLowerCase();
            if (palabrasPos.some(p => t.includes(p))) pos++;
            if (palabrasNeg.some(p => t.includes(p))) neg++;
        });

        let estado = "NEUTRAL";
        if (pos > neg + 2) estado = "OPTIMISMO";
        if (neg > pos + 2) estado = "CAUTELA";

        sentiment.innerHTML = `<span style="color:var(--blue)">[ ${estado} ]</span> ${pos} alcistas / ${neg} bajistas`;
    }
}