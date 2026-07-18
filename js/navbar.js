import {
    auth,
    onAuthStateChanged,
    signOut
} from "./firebase.js";

const authSection = document.getElementById("authSection");

onAuthStateChanged(auth, (user) => {

    if (!authSection) return;

    // --------------------
    // User NOT Logged In
    // --------------------

    if (!user) {

    authSection.innerHTML = `

        <div class="guest-actions">

            <a href="login.html" class="login-btn">

                Login

            </a>

            <a href="signup.html" class="signup-btn">

                Sign Up

            </a>

        </div>

    `;

    return;

}

    // --------------------
    // User Logged In
    // --------------------

    const username = user.displayName || user.email.split("@")[0];

    const firstLetter = username.charAt(0).toUpperCase();

    authSection.innerHTML = `

        <a href="dashboard.html" class="dashboard-btn">

            Dashboard

        </a>

        <div class="profile-menu">

            <button id="profileBtn" class="profile-btn">

                <div class="profile-avatar">

                    ${firstLetter}

                </div>

                <span>

                    ${username}

                </span>

                ▼

            </button>

            <div class="dropdown" id="dropdown">

                <a href="profile.html">

                    👤 My Profile

                </a>

                <a href="my-articles.html">

                    📝 My Articles

                </a>

                <a href="#" id="logoutBtn">

                    🚪 Logout

                </a>

            </div>

        </div>

    `;

    // Toggle dropdown

    const profileBtn = document.getElementById("profileBtn");

    const dropdown = document.getElementById("dropdown");

    profileBtn.addEventListener("click", () => {

        dropdown.classList.toggle("show");

    });

    // Logout

    document
        .getElementById("logoutBtn")
        .addEventListener("click", async (e) => {

            e.preventDefault();

            await signOut(auth);

            window.location.href = "index.html";

        });

    // Close dropdown when clicking outside

    window.addEventListener("click", (e) => {

        if (!e.target.closest(".profile-menu")) {

            dropdown.classList.remove("show");

        }

    });

});