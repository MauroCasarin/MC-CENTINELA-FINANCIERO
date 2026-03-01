// news.js - Versión con protección de errores
function updateNews(resNews) {
    const grid = document.getElementById('master-grid');
    if(!grid) return;

    // Si no hay noticias, mostrar aviso amigable
    if (!resNews || !resNews.noticias || !Array.isArray(resNews.noticias)) {
        grid.innerHTML = `<div class="news-card" style="grid-column: 1/-1; opacity: 0.5; text-align: center; padding: 20px;">
            <i class="fa-solid fa-triangle-exclamation"></i> Servidor de noticias temporalmente fuera de línea.
        </div>`;
        return;
    }

    const unicas = resNews.noticias.filter((n, i, s) => s.findIndex(x => x.titulo === n.titulo) === i);

    grid.innerHTML = `
        <div class="news-card" style="grid-column: 1 / -1; margin-bottom: 10px;">
            <div class="news-header" style="padding: 5px 10px; font-size: 0.65rem;">SISTEMA DE NOTICIAS CRÍTICAS</div>
            <div class="news-scroll-area" style="max-height: 180px; overflow-y: auto; padding: 0 10px;">
                ${unicas.map(n => `
                    <div class="news-item" style="display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px 0;">
                        <a href="${n.link}" target="_blank" style="flex: 1; text-decoration: none; color: var(--txt); font-size: 0.85em;">
                            <i class="fa-solid fa-caret-right" style="color: var(--blue); margin-right: 8px;"></i>${n.titulo}
                        </a>
                        <span style="font-size: 0.6em; color: var(--gold); margin-left: 10px;">${n.fuente.toUpperCase()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Análisis de sentimiento
    const sentiment = document.getElementById('sentiment-display');
    if(sentiment) {
        let pos = 0, neg = 0;
        unicas.forEach(n => {
            const t = n.titulo.toLowerCase();
            if (['sube', 'gana', 'alza', 'crece'].some(p => t.includes(p))) pos++;
            if (['cae', 'baja', 'pierde', 'crisis'].some(p => t.includes(p))) neg++;
        });
        let estado = pos > neg ? "OPTIMISTA" : (neg > pos ? "CAUTELA" : "NEUTRAL");
        sentiment.innerText = `[ MERCADO: ${estado} ]`;
    }
}