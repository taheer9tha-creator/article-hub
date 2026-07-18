import {
    auth
} from "./firebase.js";

import {
    sendEmailVerification,
    reload
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* ==========================================
   ELEMENTS
========================================== */

const userEmail = document.getElementById("userEmail");

const resendButton = document.getElementById("resendButton");

const checkButton = document.getElementById("checkButton");

const timer = document.getElementById("timer");

const statusMessage = document.getElementById("statusMessage");

/* ==========================================
   SHOW EMAIL
========================================== */

const params = new URLSearchParams(window.location.search);

const email = params.get("email");

userEmail.textContent = email || "Unknown Email";

/* ==========================================
   COUNTDOWN
========================================== */

let seconds = 60;

resendButton.disabled = true;

const countdown = setInterval(() => {

    timer.textContent =
        `You can resend another email in ${seconds} seconds.`;

    seconds--;

    if (seconds < 0) {

        clearInterval(countdown);

        timer.textContent =
            "Didn't receive it? You can resend now.";

        resendButton.disabled = false;

    }

}, 1000);

/* ==========================================
   RESEND EMAIL
========================================== */

resendButton.addEventListener("click", async () => {

    try {

        const user = auth.currentUser;

        if (!user) {

            statusMessage.className = "status error";

            statusMessage.textContent =
                "Please login again.";

            return;

        }

        await sendEmailVerification(user);

        statusMessage.className = "status success";

        statusMessage.textContent =
            "Verification email sent successfully.";

        resendButton.disabled = true;

        seconds = 60;

        const timerLoop = setInterval(() => {

            timer.textContent =
                `You can resend another email in ${seconds} seconds.`;

            seconds--;

            if (seconds < 0) {

                clearInterval(timerLoop);

                timer.textContent =
                    "Didn't receive it? You can resend now.";

                resendButton.disabled = false;

            }

        },1000);

    }

    catch(error){

        console.error(error);

        statusMessage.className = "status error";

        statusMessage.textContent =
            error.message;

    }

});

/* ==========================================
   CHECK VERIFICATION
========================================== */

checkButton.addEventListener("click", async () => {

    try{

        const user = auth.currentUser;

        if(!user){

            statusMessage.className = "status error";

            statusMessage.textContent =
                "Please login again.";

            return;

        }

        await reload(user);

        if(user.emailVerified){

            statusMessage.className = "status success";

            statusMessage.textContent =
                "✅ Email verified successfully! Redirecting...";

            setTimeout(()=>{

                window.location.href = "login.html";

            },2000);

        }

        else{

            statusMessage.className = "status error";

            statusMessage.textContent =
                "Your email hasn't been verified yet.";

        }

    }

    catch(error){

        console.error(error);

        statusMessage.className = "status error";

        statusMessage.textContent =
            error.message;

    }

});