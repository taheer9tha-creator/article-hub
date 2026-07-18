import {
    auth,
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "./firebase.js";

const form = document.getElementById("articleForm");
const submitBtn = form.querySelector(".publish");

const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

/* =========================================
   Upload Image to Cloudinary
========================================= */

async function uploadImage(file) {

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "articlehub");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/tnjzxo69/image/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.error.message);

    }

    return data.secure_url;

}

/* =========================================
   Edit Mode
========================================= */

if (articleId) {

    submitBtn.textContent = "Update Article";

    loadArticle();

}

async function loadArticle() {

    try {

        const articleRef = doc(db, "articles", articleId);

        const articleSnap = await getDoc(articleRef);

        if (!articleSnap.exists()) {

            alert("Article not found.");

            window.location.replace("dashboard.html");

            return;

        }

        const article = articleSnap.data();

        document.getElementById("title").value = article.title || "";
        document.getElementById("slug").value = article.slug || "";
        document.getElementById("category").value = article.category || "";
        document.getElementById("tags").value = article.tags || "";
        document.getElementById("description").value = article.description || "";
        document.getElementById("content").value = article.content || "";
        document.getElementById("image").value = article.image || "";

    }

    catch (error) {

        console.error(error);

        alert("Failed to load article.");

    }

}

/* =========================================
   Publish / Update Article
========================================= */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {

        // -------------------------
        // Check Login
        // -------------------------

        const user = auth.currentUser;

        if (!user) {

            alert("Please login first.");

            window.location.href = "login.html";

            return;

        }

        // -------------------------
        // Get User Profile
        // -------------------------

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            throw new Error("User profile not found.");

        }

        const profile = userSnap.data();

        // -------------------------
        // Upload Image
        // -------------------------

        let imageUrl = document.getElementById("image").value.trim();

        const imageFile = document.getElementById("imageFile").files[0];

        if (imageFile) {

            submitBtn.textContent = "Uploading Image...";

            imageUrl = await uploadImage(imageFile);

        }

        // -------------------------
        // Calculate Reading Time
        // -------------------------

        const content = document.getElementById("content").value.trim();

        const wordCount = content.split(/\s+/).length;

        const readingTime = Math.max(1, Math.ceil(wordCount / 200));

        // -------------------------
        // Article Object
        // -------------------------

        const article = {

            title: document.getElementById("title").value.trim(),

            slug: document.getElementById("slug").value.trim(),

            category: document.getElementById("category").value,

            tags: document.getElementById("tags").value.trim(),

            image: imageUrl,

            description: document.getElementById("description").value.trim(),

            content,

            authorId: user.uid,

            authorName: profile.username,

            authorEmail: profile.email,

            authorPhoto: profile.photo || "",

            readingTime,

            views: 0,

            likes: 0,

            comments: 0,

            updatedAt: serverTimestamp()

        };

        // -------------------------
        // Update Article
        // -------------------------

        if (articleId) {

            delete article.views;
            delete article.likes;
            delete article.comments;

            await updateDoc(
                doc(db, "articles", articleId),
                article
            );

            alert("Article updated successfully!");

        }

        // -------------------------
        // New Article
        // -------------------------

        else {

            article.createdAt = serverTimestamp();

            await addDoc(
                collection(db, "articles"),
                article
            );

            alert("Article published successfully!");

        }

        window.location.href = "dashboard.html";

    }

    catch (error) {

        console.error(error);

        alert("Failed to save article.\n\n" + error.message);

        submitBtn.disabled = false;

        submitBtn.textContent = articleId
            ? "Update Article"
            : "🚀 Publish Article";

    }

});