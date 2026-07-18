import {
    db,
    doc,
    getDoc,
    getDocs,
    collection,
    updateDoc,
    increment,
    deleteDoc,
    setDoc,
    serverTimestamp
} from "./firebase.js";

import {
    auth,
    onAuthStateChanged
} from "./firebase.js";

/* ===========================================
   DOM Elements
=========================================== */

const articleImage = document.getElementById("articleImage");

const articleTitle = document.getElementById("articleTitle");

const articleDescription = document.getElementById("articleDescription");

const articleContent = document.getElementById("articleContent");

const articleAuthor = document.getElementById("articleAuthor");

const articleDate = document.getElementById("articleDate");

const articleViews = document.getElementById("articleViews");

const articleReadingTime = document.getElementById("articleReadingTime");

const authorAvatar = document.getElementById("authorAvatar");

const authorName = document.getElementById("authorName");

const authorBio = document.getElementById("authorBio");

const profileLink = document.getElementById("profileLink");

const sideViews = document.getElementById("sideViews");

const sideLikes = document.getElementById("sideLikes");

const sideReading = document.getElementById("sideReading");

const relatedArticles = document.getElementById("relatedArticles");

/* ===========================================
   Article ID
=========================================== */

const params = new URLSearchParams(window.location.search);

const articleId = params.get("id");

if (!articleId) {

    document.body.innerHTML = `
        <h2 style="text-align:center;margin-top:80px;">
            Article not found.
        </h2>
    `;

    throw new Error("Missing article ID.");

}

/* ===========================================
   Start
=========================================== */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        document.body.innerHTML = `
        <div class="login-required">

            <h1>🔒 Login Required</h1>

            <p>You must login to read this article.</p>

            <a href="login.html" class="login-page-btn">

                Login

            </a>

        </div>
        `;

        return;

    }

    currentUser = user;

    loadArticle();

});

/* ===========================================
   Load Article
=========================================== */

async function loadArticle() {

    try {

        const articleRef = doc(db, "articles", articleId);

        const snap = await getDoc(articleRef);

        if (!snap.exists()) {

            document.body.innerHTML = `
                <h2 style="text-align:center;margin-top:80px;">
                    Article not found.
                </h2>
            `;

            return;

        }

        /* -----------------------------
           Increase View Count
        ----------------------------- */

        await updateDoc(articleRef, {

            views: increment(1)

        });

        const updatedSnap = await getDoc(articleRef);

        const article = updatedSnap.data();

        displayArticle(article);

        loadAuthor(article.authorId);

        loadRelatedArticles(article.authorId, articleId);

        await loadLikeStatus();

    }

    catch (error) {

        console.error(error);

        document.body.innerHTML = `
            <h2 style="text-align:center;margin-top:80px;">
                Failed to load article.
            </h2>
        `;

    }

}

/* ===========================================
   Display Article
=========================================== */

function displayArticle(article) {

    document.title = article.title + " | ArticleHub";

    articleImage.src =

        article.image && article.image.trim() !== ""

            ? article.image

            : "https://picsum.photos/1200/700";

    articleTitle.textContent = article.title;

    articleDescription.textContent = article.description;

    articleContent.innerHTML = formatArticle(article.content);

    articleAuthor.href =
        `profile.html?id=${article.authorId}`;

    articleAuthor.textContent =
        "👤 " + article.authorName;

    if (article.createdAt) {

        articleDate.textContent =
            article.createdAt.toDate().toLocaleDateString();

    }

    const words =
        article.content.trim().split(/\s+/).length;

    const readingTime =
        Math.max(1, Math.ceil(words / 200));

    articleReadingTime.textContent =
        "⏱ " + readingTime + " min read";

    articleViews.textContent =
        "👁 " + (article.views || 0) + " Views";

    sideViews.textContent =
        article.views || 0;

    sideLikes.textContent =
        article.likes || 0;

    sideReading.textContent =
        readingTime + " min";

}

/* ===========================================
   Load Author Profile
=========================================== */

async function loadAuthor(authorId) {

    try {

        const userRef = doc(db, "users", authorId);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            authorAvatar.textContent = "?";

            authorName.textContent = "Unknown Author";

            authorBio.textContent = "No bio available.";

            profileLink.href = "#";

            return;

        }

        const user = userSnap.data();

        authorName.textContent =
            user.username || "Unknown Author";

        authorBio.textContent =
            user.bio && user.bio.trim() !== ""
                ? user.bio
                : "This author hasn't written a bio yet.";

        profileLink.href =
            `profile.html?id=${authorId}`;

        if (user.photo && user.photo.trim() !== "") {

            authorAvatar.innerHTML = `
                <img
                src="${user.photo}"
                alt="${user.username}"
                style="
                    width:100%;
                    height:100%;
                    border-radius:50%;
                    object-fit:cover;
                ">
            `;

        }

        else {

            authorAvatar.textContent =
                (user.username || "A")
                .charAt(0)
                .toUpperCase();

        }

    }

    catch (error) {

        console.error("Author:", error);

    }

}

/* ===========================================
   Related Articles
=========================================== */

async function loadRelatedArticles(authorId, currentId) {

    try {

        const snapshot =
            await getDocs(collection(db, "articles"));

        relatedArticles.innerHTML = "";

        let count = 0;

        snapshot.forEach((docSnap) => {

            if (count >= 3) return;

            if (docSnap.id === currentId) return;

            const article = docSnap.data();

            if (article.authorId !== authorId) return;

            count++;

            const image =
                article.image && article.image.trim() !== ""
                    ? article.image
                    : "https://picsum.photos/600/350";

            const card = `

            <div class="related-card">

                <img
                src="${image}"
                alt="${article.title}">

                <div class="related-body">

                    <span class="related-category">

                        ${article.category}

                    </span>

                    <h3>

                        ${article.title}

                    </h3>

                    <p>

                        ${article.description}

                    </p>

                    <a href="article.html?id=${docSnap.id}">

                        Read Article →

                    </a>

                </div>

            </div>

            `;

            relatedArticles.innerHTML += card;

        });

        if (count === 0) {

            relatedArticles.innerHTML = `

                <p style="
                    text-align:center;
                    width:100%;
                    color:#777;
                    font-size:18px;
                ">

                    No more articles from this author.

                </p>

            `;

        }

    }

    catch (error) {

        console.error("Related Articles:", error);

    }

}

/* ===========================================
   Action Buttons
=========================================== */

const likeBtn = document.getElementById("likeBtn");

const shareBtn = document.getElementById("shareBtn");

const copyBtn = document.getElementById("copyBtn");

let currentUser = null;
/* ===========================================
   LIKE SYSTEM
=========================================== */

let liked = false;


async function loadLikeStatus(){

    const likeDocumentId =
    `${articleId}_${currentUser.uid}`;

    try{

        const likeRef =
            doc(db,"articleLikes",likeDocumentId);

        const likeSnap =
            await getDoc(likeRef);

        liked = likeSnap.exists();

        if(liked){

            likeBtn.classList.add("liked");

            likeBtn.innerHTML =
                "❤️ Liked";

        }

        else{

            likeBtn.classList.remove("liked");

            likeBtn.innerHTML =
                "❤️ Like";

        }

    }

    catch(error){

        console.error(error);

    }

}

/* ---------- Toggle Like ---------- */

likeBtn.addEventListener("click",async()=>{

    likeBtn.disabled = true;
    const likeDocumentId =
    `${articleId}_${currentUser.uid}`;

    try{

        const articleRef =
            doc(db,"articles",articleId);

        if(liked){

            await deleteDoc(

                doc(db,"articleLikes",likeDocumentId)

            );

            await updateDoc(articleRef,{

                likes:increment(-1)

            });

            liked = false;

            likeBtn.classList.remove("liked");

            likeBtn.innerHTML =
                "❤️ Like";

        }

        else{

           await setDoc(

    doc(db,"articleLikes",likeDocumentId),

    {

        articleId,

        userId: currentUser.uid,

        createdAt: serverTimestamp()

    }

);

    await updateDoc(articleRef, {

    likes: increment(1)

});

            liked = true;

            likeBtn.classList.add("liked");

            likeBtn.innerHTML =
                "❤️ Liked";

        }

        const latest =
            await getDoc(articleRef);

        const likes =
            latest.data().likes || 0;

        sideLikes.textContent =
            likes;

        const likeCount =
            document.getElementById("likeCount");

        if(likeCount){

            likeCount.textContent =
                likes;

        }

    }

    catch(error){

        console.error(error);

    }

    likeBtn.disabled = false;

});

/* ===========================================
   Share Article
=========================================== */

shareBtn.addEventListener("click", async () => {

    try {

        if (navigator.share) {

            await navigator.share({

                title: document.title,

                text: articleTitle.textContent,

                url: window.location.href

            });

        }

        else {

            await navigator.clipboard.writeText(window.location.href);

            alert("Article link copied to clipboard.");

        }

    }

    catch (error) {

        console.error(error);

    }

});

/* ===========================================
   Copy Link
=========================================== */

copyBtn.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(window.location.href);

        const oldText = copyBtn.textContent;

        copyBtn.textContent = "✅ Copied!";

        setTimeout(() => {

            copyBtn.textContent = oldText;

        }, 2000);

    }

    catch (error) {

        console.error(error);

    }

});

/* ===========================================
   Format Article Content
=========================================== */

function formatArticle(text) {

    return text

        .split("\n")

        .filter(line => line.trim() !== "")

        .map(line => `<p>${line}</p>`)

        .join("");

}