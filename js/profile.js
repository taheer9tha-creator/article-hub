import {
    auth,
    db,
    doc,
    getDoc,
    collection,
    getDocs,
    onAuthStateChanged
} from "./firebase.js";

/* ==========================================
   Elements
========================================== */

const coverImage = document.getElementById("coverImage");
const profilePhoto = document.getElementById("profilePhoto");

const profileName = document.getElementById("profileName");
const verifiedBadge = document.getElementById("verifiedBadge");

const profileBio = document.getElementById("profileBio");
const profileLocation = document.getElementById("profileLocation");
const joinedDate = document.getElementById("joinedDate");

const websiteLink = document.getElementById("websiteLink");
const githubLink = document.getElementById("githubLink");
const linkedinLink = document.getElementById("linkedinLink");

const editProfileBtn = document.getElementById("editProfileBtn");
const followBtn = document.getElementById("followBtn");

const articleCount = document.getElementById("articleCount");
const viewCount = document.getElementById("viewCount");
const likeCount = document.getElementById("likeCount");

const authorArticles = document.getElementById("authorArticles");

/* ==========================================
   Get User ID
========================================== */

const params = new URLSearchParams(window.location.search);

let profileId = params.get("id");

/* ==========================================
   Authentication
========================================== */

onAuthStateChanged(auth, async (currentUser) => {

    if (!profileId) {

        if (!currentUser) {

            window.location.href = "login.html";

            return;

        }

        profileId = currentUser.uid;

    }

    if (currentUser && currentUser.uid === profileId) {

        editProfileBtn.style.display = "inline-flex";

        followBtn.style.display = "none";

    }

    else {

        editProfileBtn.style.display = "none";

        followBtn.style.display = "inline-flex";

    }

    loadProfile(profileId);
    
    await loadAuthorArticles();

});

/* ==========================================
   Load Profile
========================================== */

async function loadProfile(uid) {

    try {

        const userRef = doc(db, "users", uid);

        const snap = await getDoc(userRef);

        if (!snap.exists()) {

            document.body.innerHTML = "<h2>User not found.</h2>";

            return;

        }

        const user = snap.data();

        document.title =
            `${user.username} | ArticleHub`;

        profileName.textContent =
            user.username || "Unknown User";

        profileBio.textContent =
            user.bio || "No bio available.";

        profileLocation.textContent =
            "📍 " + (user.location || "Unknown");

        if (user.photo) {

            profilePhoto.src = user.photo;

        }

        if (user.cover) {

            coverImage.src = user.cover;

        }

        if (user.verified) {

            verifiedBadge.style.display = "inline-flex";

        }

        else {

            verifiedBadge.style.display = "none";

        }

        if (user.joinedAt) {

            joinedDate.textContent =
                "📅 Joined " +
                user.joinedAt
                    .toDate()
                    .toLocaleDateString();

        }

        setupSocialLink(
            websiteLink,
            user.website
        );

        setupSocialLink(
            githubLink,
            user.github
        );

        setupSocialLink(
            linkedinLink,
            user.linkedin
        );

    }

    catch (error) {

        console.error(error);

        alert("Failed to load profile.");

    }

}

/* ==========================================
   Social Links
========================================== */

function setupSocialLink(element, url) {

    if (url && url.trim() !== "") {

        element.href = url;

    }

    else {

        element.style.display = "none";

    }

}

/* ==========================================
   Load Author Articles
========================================== */



async function loadAuthorArticles() {

    try {

        const snapshot = await getDocs(collection(db, "articles"));

        let html = "";

        let totalArticles = 0;

        let totalViews = 0;

        let totalLikes = 0;

        snapshot.forEach((docSnap) => {

            const article = docSnap.data();

            if (article.authorId !== profileId) return;

            totalArticles++;

            totalViews += article.views || 0;

            totalLikes += article.likes || 0;

            const image =
                article.image && article.image.trim() !== ""
                ? article.image
                : "https://picsum.photos/600/400";

            const readingTime =
                article.readingTime || 1;

            html += `

            <div class="article-card">

                <img src="${image}" alt="${article.title}">

                <div class="article-content">

                    <span class="article-category">

                        ${article.category}

                    </span>

                    <h3>

                        ${article.title}

                    </h3>

                    <p>

                        ${article.description}

                    </p>

                    <div class="article-meta">

                        <span>

                            👁 ${article.views || 0}

                        </span>

                        <span>

                            ❤️ ${article.likes || 0}

                        </span>

                        <span>

                            ⏱ ${readingTime} min

                        </span>

                    </div>

                    <a
                    href="article.html?id=${docSnap.id}"
                    class="read-btn">

                        Read Article →

                    </a>

                </div>

            </div>

            `;

        });

        articleCount.textContent = totalArticles;

        viewCount.textContent = totalViews;

        likeCount.textContent = totalLikes;

        if (totalArticles === 0) {

            authorArticles.innerHTML = `

                <div class="loading">

                    No articles published yet.

                </div>

            `;

        }

        else {

            authorArticles.innerHTML = html;

        }

    }

    catch (error) {

        console.error(error);

        authorArticles.innerHTML = `

            <div class="loading">

                Failed to load articles.

            </div>

        `;

    }

}