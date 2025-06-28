const newsFeed = document.getElementById('news-feed');

const articles = [
    {
        title: "North Carolina Senator Breaks Ranks",
        summary: "Senator Thom Tillis breaks ranks with the republican party over Medicaid cuts.",
        image: "xnews/images/thom_tills.jpg",
        url: "xnews/1.html",
        date: "2025-06-28"
    },
    {
        title: "Tech Giants Compete in AI Innovation Race",
        summary: "Leading tech companies push boundaries of AI technology with new product releases and groundbreaking research.",
        image: "https://source.unsplash.com/featured/?technology",
        url: "https://example.com/ai-innovation",
        date: "2025-06-26"
    },
    {
        title: "Global Sports Events Draw Massive Crowds",
        summary: "The international sports scene heats up as fans flock to the stadiums and arenas worldwide to support their favorite teams.",
        image: "https://source.unsplash.com/featured/?sports",
        url: "https://example.com/sports-events",
        date: "2025-06-27"
    },
    {
        title: "World Leaders Meet for Climate Summit",
        summary: "Nations gather to discuss urgent climate action plans and sustainable development goals for the coming decade.",
        image: "https://source.unsplash.com/featured/?climate",
        url: "https://example.com/climate-summit",
        date: "2025-06-28"
    }
];

function createArticleCard(article) {
    const card = document.createElement('a');
    card.className = 'article-card';
    card.href = article.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const img = document.createElement('img');
    img.className = 'article-image';
    img.src = article.image;
    img.alt = article.title;

    const content = document.createElement('div');
    content.className = 'article-content';

    const title = document.createElement('h2');
    title.className = 'article-title';
    title.textContent = article.title;

    const summary = document.createElement('p');
    summary.className = 'article-summary';
    summary.textContent = article.summary;

    const date = document.createElement('div');
    date.className = 'article-date';
    date.textContent = new Date(article.date).toLocaleDateString();

    content.appendChild(title);
    content.appendChild(summary);
    content.appendChild(date);

    card.appendChild(img);
    card.appendChild(content);

    return card;
}

function renderArticles() {
    articles.forEach(article => {
        const card = createArticleCard(article);
        newsFeed.appendChild(card);
    });
}

// Render on page load
renderArticles();
