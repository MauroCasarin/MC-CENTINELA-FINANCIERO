// Lógica de Noticias y Sentimiento
function updateNews(resNews) {
    if(resNews && resNews.noticias) {
        const unicas = resNews.noticias.slice(0,15);
        document.getElementById('news-badge').innerText = `${unicas.length} NOTAS`;
        document.getElementById('news-counter').innerText = `NEWS: ${unicas.length}`;
        
        let pos = 0, neg = 0;
        unicas.forEach(n => {
            const t = n.titulo.toLowerCase();
            if (['sube', 'gana', 'crece', 'alza', 'positivo'].some(p => t.includes(p))) pos++;
            else if (['cae', 'baja', 'pierde', 'crisis', 'negativo'].some(p => t.includes(p))) neg++;
        });
        document.getElementById('sentiment-display').innerText = `[ ESTADO: ${pos >= neg ? 'OPTIMISMO' : 'CAUTELA'} ] - Pulso: ${pos} alcistas / ${neg} bajistas.`;

        const agrup = unicas.reduce((acc, n) => { if(!acc[n.fuente]) acc[n.fuente] = []; acc[n.fuente].push(n); return acc; }, {});
        document.getElementById('master-grid').innerHTML = Object.keys(agrup).map(f => `
            <div class="news-card"><div class="news-header">${f}</div><div class="news-scroll-area">
            ${agrup[f].map(n => `<div class="news-item"><a href="${n.link}" target="_blank">${n.titulo}</a></div>`).join('')}
            </div></div>`).join('');
    }
}