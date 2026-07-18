import {
    auth,
    signInWithEmailAndPassword,
    signOut
} from "./firebase.js";

const form = document.getElementById("loginForm");

const error = document.getElementById("error");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    error.textContent = "";

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        /* ==========================================
           EMAIL VERIFICATION
        ========================================== */

        if (!user.emailVerified) {

            await signOut(auth);

            alert(
                "Please verify your email before logging in."
            );

            window.location.href =
                `verify-email.html?email=${encodeURIComponent(user.email)}`;

            return;

        }

        /* ==========================================
           LOGIN SUCCESS
        ========================================== */

        window.location.href = "dashboard.html";

    }

    catch (err) {

        console.error(err);

        error.textContent =
            "Invalid email or password.";

    }

});