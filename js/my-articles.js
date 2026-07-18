import {
    auth,
    onAuthStateChanged,
    db,
    collection,
    getDocs,
    deleteDoc,
    doc
} from "./firebase.js";

/* ==========================================
   Elements
========================================== */

const profileLink = document.getElementById("profileLink");

const tableBody = document.getElementById("myArticles");

const searchInput = document.getElementById("searchArticles");

const emptyState = document.getElementById("emptyState");

const totalArticles = document.getElementById("totalArticles");

const totalViews = document.getElementById("totalViews");

const totalLikes = document.getElementById("totalLikes");

/* ==========================================
   Variables
========================================== */

let currentUser = null;

let articles = [];

/* ==========================================
   Authentication
========================================== */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.replace("login.html");

        return;

    }

    currentUser = user;

    profileLink.href = `profile.html?id=${user.uid}`;

    loadArticles();

});

/* ==========================================
   Load Articles
========================================== */

async function loadArticles() {

    tableBody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading your articles...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "articles"));

        articles = [];

        let totalViewCount = 0;

        let totalLikeCount = 0;

        snapshot.forEach((document) => {

            const article = document.data();

            if (article.authorId !== currentUser.uid) return;

            articles.push({

                id: document.id,

                ...article

            });

            totalViewCount += article.views || 0;

            totalLikeCount += article.likes || 0;

        });

        totalArticles.textContent = articles.length;

        totalViews.textContent = totalViewCount;

        totalLikes.textContent = totalLikeCount;

        renderArticles(articles);

    }

    catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load articles.
                </td>
            </tr>
        `;

    }

}

/* ==========================================
   Render Articles
========================================== */

function renderArticles(list) {

    tableBody.innerHTML = "";

    if (list.length === 0) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    list.forEach((article) => {

        const image =

            article.image && article.image.trim() !== ""

                ? article.image

                : "https://picsum.photos/120/80";

        const date =

            article.createdAt

                ? article.createdAt.toDate().toLocaleDateString()

                : "-";

        tableBody.innerHTML += `

        <tr>

            <td>

                <img
                src="${image}"
                alt="${article.title}"
                width="90"
                height="60"
                style="object-fit:cover;border-radius:8px;">

            </td>

            <td>

                ${article.title}

            </td>

            <td>

                ${article.category}

            </td>

            <td>

                👁 ${article.views || 0}

            </td>

            <td>

                ❤️ ${article.likes || 0}

            </td>

            <td>

                ${date}

            </td>

            <td>

                <div class="actions">

                    <button
                    class="action-btn view-btn"
                    onclick="window.location.href='article.html?id=${article.id}'">

                        View

                    </button>

                    <button
                    class="action-btn edit-btn"
                    onclick="window.location.href='create.html?id=${article.id}'">

                        Edit

                    </button>

                    <button
                    class="action-btn delete-btn"
                    data-id="${article.id}">

                        Delete

                    </button>

                </div>

            </td>

        </tr>

        `;

    });

    initializeDeleteButtons();

}

/* ==========================================
   Delete Article
========================================== */

function initializeDeleteButtons() {

    document.querySelectorAll(".delete-btn").forEach((button) => {

        button.addEventListener("click", async () => {

            const confirmDelete = confirm(

                "Are you sure you want to delete this article?"

            );

            if (!confirmDelete) return;

            try {

                await deleteDoc(

                    doc(db, "articles", button.dataset.id)

                );

                loadArticles();

            }

            catch (error) {

                console.error(error);

                alert("Failed to delete article.");

            }

        });

    });

}

/* ==========================================
   Search
========================================== */

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value

        .trim()

        .toLowerCase();

    const filtered = articles.filter((article) => {

        return (

            article.title.toLowerCase().includes(keyword) ||

            article.category.toLowerCase().includes(keyword) ||

            article.description.toLowerCase().includes(keyword)

        );

    });

    renderArticles(filtered);

});