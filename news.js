// news.js - Gestión de Noticias y Análisis de Sentimiento
function updateNews(resNews) {
    const badge = document.getElementById('news-badge');
    const grid = document.getElementById('master-grid');
    const sentiment = document.getElementById('sentiment-display');
    
    // Validar estructura de datos del Apps Script
    if (!resNews || !resNews.noticias) {
        console.error("Formato de noticias inválido");
        return;
    }

    // 1. Limpiar duplicados por título
    const unicas = resNews.noticias.filter((n, i, s) => 
        s.findIndex(x => x.titulo === n.titulo) === i
    );
    
    if(badge) badge.innerText = `${unicas.length} NOTAS`;

    // 2. Renderizar Noticias agrupadas por Fuente
    if(grid) {
        const agrupadas = unicas.reduce((acc, n) => { 
            if(!acc[n.fuente]) acc[n.fuente] = []; 
            acc[n.fuente].push(n); 
            return acc; 
        }, {});

        grid.innerHTML = Object.keys(agrupadas).map(fuente => `
            <div class="news-card">
                <div class="news-header">${fuente.toUpperCase()}</div>
                <div class="news-scroll-area">
                    ${agrupadas[fuente].map(n => `
                        <div class="news-item">
                            <a href="${n.link}" target="_blank">
                                <i class="fa-solid fa-chevron-right" style="font-size:0.6em; color:var(--blue)"></i> ${n.titulo}
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // 3. Análisis de Sentimiento Rápido
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