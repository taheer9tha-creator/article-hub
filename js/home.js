import {
    db,
    collection,
    getDocs
} from "./firebase.js";

const articlesContainer = document.getElementById("articlesContainer");
const searchInput = document.getElementById("searchInput");

let allArticles = [];

/* =========================================
   Load Articles
========================================= */

async function loadArticles() {

    articlesContainer.innerHTML = `
        <h3 style="text-align:center;">
            Loading articles...
        </h3>
    `;

    try {

        const snapshot = await getDocs(collection(db, "articles"));

        allArticles = [];

        snapshot.forEach((doc) => {

            allArticles.push({

                id: doc.id,

                ...doc.data()

            });

        });

        // Show newest articles first

        allArticles.sort((a, b) => {

            if (!a.createdAt || !b.createdAt) return 0;

            return b.createdAt.seconds - a.createdAt.seconds;

        });

        displayArticles(allArticles);

    }

    catch (error) {

        console.error(error);

        articlesContainer.innerHTML = `

            <p style="text-align:center;color:red;">

                Failed to load articles.

            </p>

        `;

    }

}

/* =========================================
   Display Articles
========================================= */

function displayArticles(articles) {

    articlesContainer.innerHTML = "";

    if (articles.length === 0) {

        articlesContainer.innerHTML = `

            <p style="text-align:center;">

                No articles found.

            </p>

        `;

        return;

    }

    articles.forEach((article) => {

        const image = article.image && article.image.trim() !== ""

            ? article.image

            : "https://picsum.photos/600/350";

        const date = article.createdAt

            ? article.createdAt.toDate().toLocaleDateString()

            : "Recently";

        const readingTime = article.readingTime || 1;

        const views = article.views || 0;

        const likes = article.likes || 0;

        articlesContainer.innerHTML += `

            <div class="card">

                <img
                src="${image}"
                alt="${article.title}">

                <div class="category-badge">

                    ${article.category}

                </div>

                <div class="card-content">

                    <h3>

                        ${article.title}

                    </h3>

                    <p>

                        ${article.description}

                    </p>

                    <div class="card-meta">

                        <a
                        href="profile.html?id=${article.authorId}"
                        class="author-link">

                            👤 ${article.authorName}

                        </a>

                        <span>

                            📅 ${date}

                        </span>

                    </div>

                    <div class="card-stats">

                        <span>

                            ⏱ ${readingTime} min

                        </span>

                        <span>

                            👁 ${views}

                        </span>

                        <span>

                            ❤️ ${likes}

                        </span>

                    </div>

                    <a
                    href="article.html?id=${article.id}"
                    class="read-btn">

                        Read More →

                    </a>

                </div>

            </div>

        `;

    });

}

/* =========================================
   Search
========================================= */

searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase().trim();

    const filtered = allArticles.filter(article =>

        article.title.toLowerCase().includes(value) ||

        article.description.toLowerCase().includes(value) ||

        article.category.toLowerCase().includes(value) ||

        (article.authorName || "").toLowerCase().includes(value)

    );

    displayArticles(filtered);

});

/* =========================================
   Start
========================================= */

loadArticles();