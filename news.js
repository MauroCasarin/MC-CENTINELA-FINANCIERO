// Lógica de Noticias y Sentimiento
function updateNews(resNews) {
    if(!resNews) return;

    // Actualizar contador en el header
    const newsCounter = document.getElementById('news-counter');
    if(newsCounter) {
        newsCounter.innerText = `${resNews.length} NOTICIAS`;
    }

    const masterGrid = document.getElementById('master-grid');
    if(masterGrid) {
        masterGrid.innerHTML = "";
        
        // Agrupar por categorías básicas
        const categorias = ["ECONOMÍA", "MERCADOS", "POLÍTICA", "CRYPTO"];
        
        categorias.forEach(cat => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            
            const filteredNews = resNews.filter(n => n.categoria === cat || !n.categoria).slice(0, 5);
            
            newsCard.innerHTML = `
                <div class="news-header">${cat}</div>
                <div class="news-scroll-area">
                    ${filteredNews.map(n => `
                        <div class="news-item">
                            <a href="${n.url}" target="_blank">• ${n.titulo}</a>
                        </div>
                    `).join('')}
                </div>
            `;
            masterGrid.appendChild(newsCard);
        });
    }

    // Actualizar badge de noticias si existe
    const newsBadge = document.getElementById('news-badge');
    if(newsBadge) {
        newsBadge.innerText = `${resNews.length} NOTAS`;
    }

    // Sentimiento del mercado (Marquee)
    const sentimentDisp = document.getElementById('sentiment-display');
    if(sentimentDisp) {
        sentimentDisp.innerText = "PULSO: " + resNews.slice(0, 8).map(n => n.titulo.toUpperCase()).join("  ///  ");
    }
}