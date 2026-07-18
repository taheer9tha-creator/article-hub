import {
    auth,
    onAuthStateChanged,
    db,
    collection,
    getDocs,
    signOut
} from "./firebase.js";

/* ==========================================
   Elements
========================================== */

const profileLink = document.getElementById("profileLink");

const dashboardProfile = document.getElementById("dashboardProfile");

const totalArticles = document.getElementById("totalArticles");

const publishedArticles = document.getElementById("publishedArticles");

const totalViews = document.getElementById("totalViews");

const totalLikes = document.getElementById("totalLikes");

const logoutBtn = document.getElementById("logoutBtn");

/* ==========================================
   Logout
========================================== */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        try {

            await signOut(auth);

            window.location.replace("login.html");

        }

        catch (error) {

            console.error(error);

            alert("Failed to logout.");

        }

    });

}

/* ==========================================
   Authentication
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");

        return;

    }

    /* Profile Links */

    if (profileLink) {

        profileLink.href = `profile.html?id=${user.uid}`;

    }

    if (dashboardProfile) {

        dashboardProfile.href = `profile.html?id=${user.uid}`;

    }

    loadDashboard(user);

});

/* ==========================================
   Load Dashboard
========================================== */

async function loadDashboard(user) {

    try {

        const snapshot = await getDocs(collection(db, "articles"));

        let articleCount = 0;

        let publishedCount = 0;

        let viewCount = 0;

        let likeCount = 0;

        snapshot.forEach((document) => {

            const article = document.data();

            if (article.authorId !== user.uid) return;

            articleCount++;

            publishedCount++;

            viewCount += article.views || 0;

            likeCount += article.likes || 0;

        });

        totalArticles.textContent = articleCount;

        publishedArticles.textContent = publishedCount;

        totalViews.textContent = viewCount;

        if (totalLikes) {

            totalLikes.textContent = likeCount;

        }

    }

    catch (error) {

        console.error(error);

        alert("Failed to load dashboard.");

    }

}