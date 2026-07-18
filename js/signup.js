import {

    auth,
    db,

    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signOut,

    doc,
    setDoc,
    serverTimestamp,

    collection,
    query,
    where,
    getDocs

} from "./firebase.js";

/* ==========================================================
   ARTICLEHUB
   SIGNUP PAGE
========================================================== */

/* ==========================================================
   ELEMENTS
========================================================== */

const form = document.getElementById("signupForm");

const usernameInput =
    document.getElementById("username");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const usernameStatus =
    document.getElementById("usernameStatus");

const passwordStatus =
    document.getElementById("passwordStatus");

const signupButton =
    document.getElementById("signupButton");

/* ==========================================================
   VARIABLES
========================================================== */

let usernameAvailable = false;

let passwordValid = false;

let usernameTimeout = null;

/* ==========================================================
   INITIAL STATE
========================================================== */

signupButton.disabled = true;

/* ==========================================================
   BUTTON LOADING
========================================================== */

function setLoading(text){

    signupButton.disabled = true;

    signupButton.innerHTML =

        `<span class="spinner"></span>${text}`;

}

/* ==========================================================
   BUTTON NORMAL
========================================================== */

function stopLoading(){

    signupButton.innerHTML =

        "Create Account";

    signupButton.disabled =

        !(usernameAvailable && passwordValid);

}


/* ==========================================================
   PASSWORD VALIDATION
========================================================== */

function validatePassword(password){

    if(password.length < 8){

        return "Password must contain at least 8 characters.";

    }

    if(!/[A-Za-z]/.test(password)){

        return "Password must contain at least one letter.";

    }

    if(!/[0-9]/.test(password)){

        return "Password must contain at least one number.";

    }

    return "";

}

/* ==========================================================
   LIVE PASSWORD CHECK
========================================================== */

passwordInput.addEventListener("input",()=>{

    const password =
        passwordInput.value;

    const message =
        validatePassword(password);

    if(message){

        passwordStatus.textContent =
            message;

        passwordStatus.className =
            "password-status";

        passwordValid = false;

    }

    else{

        passwordStatus.textContent =
            "✓ Strong password";

        passwordStatus.className =
            "password-status valid";

        passwordValid = true;

    }

    updateSignupButton();

});

/* ==========================================================
   USERNAME VALIDATION
========================================================== */

function validateUsername(username){

    username = username.trim().toLowerCase();

    if(username.length < 5){

        return "Username must be at least 5 characters.";

    }

    if(!/^[a-z0-9_]+$/.test(username)){

        return "Only letters, numbers and _ are allowed.";

    }

    return "";

}

/* ==========================================================
   CHECK USERNAME FROM FIRESTORE
========================================================== */

async function checkUsername(username){

    username = username.trim().toLowerCase();

    /* ---------- Local Validation ---------- */

    const validationMessage =

        validateUsername(username);

    if(validationMessage){

        usernameStatus.textContent =
            validationMessage;

        usernameStatus.style.color =
            "#ef4444";

        usernameAvailable = false;

        updateSignupButton();

        return;

    }

    /* ---------- Checking ---------- */

    usernameStatus.textContent =
        "Checking username...";

    usernameStatus.style.color =
        "#6b7280";

    signupButton.disabled = true;

    try{

        const usernameQuery = query(

            collection(db,"users"),

            where("username","==",username)

        );

        const snapshot =

            await getDocs(usernameQuery);

        console.log(
            "Searching username:",
            username
        );

        console.log(
            "Documents found:",
            snapshot.size
        );

        if(snapshot.empty){

            usernameStatus.textContent =
                "✓ Username available";

            usernameStatus.style.color =
                "#16a34a";

            usernameAvailable = true;

        }

        else{

            usernameStatus.textContent =
                "✗ Username already exists";

            usernameStatus.style.color =
                "#ef4444";

            usernameAvailable = false;

        }

    }

    catch(error){

        console.error(error);

        usernameStatus.textContent =
            "Unable to check username.";

        usernameStatus.style.color =
            "#ef4444";

        usernameAvailable = false;

    }

    updateSignupButton();

}

/* ==========================================================
   LIVE USERNAME CHECK
========================================================== */

usernameInput.addEventListener("input",()=>{

    clearTimeout(usernameTimeout);

    usernameAvailable = false;

    updateSignupButton();

    const username =

        usernameInput.value.trim();

    if(username === ""){

        usernameStatus.textContent = "";

        return;

    }

    usernameTimeout = setTimeout(()=>{

        checkUsername(username);

    },500);

});

/* ==========================================================
   LIVE USERNAME FORMAT
========================================================== */

usernameInput.addEventListener("blur",()=>{

    usernameInput.value =

        usernameInput.value

        .trim()

        .toLowerCase();

});/* ==========================================================
   SIGNUP
========================================================== */

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const username =
        usernameInput.value.trim().toLowerCase();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    /* ==========================================
       VALIDATION
    ========================================== */

    if(!usernameAvailable){

        alert("Please choose another username.");

        return;

    }

    const passwordError =
        validatePassword(password);

    if(passwordError){

        alert(passwordError);

        return;

    }

    if(password !== confirmPassword){

        alert("Passwords do not match.");

        return;

    }

    /* ==========================================
       START LOADING
    ========================================== */

    setLoading("Creating Account...");

    try{

        /* ==========================================
           FINAL USERNAME CHECK
        ========================================== */

        const usernameQuery = query(

            collection(db,"users"),

            where("username","==",username)

        );

        const usernameSnapshot =
            await getDocs(usernameQuery);

        if(!usernameSnapshot.empty){

            stopLoading();

            usernameStatus.textContent =
                "✗ Username already exists";

            usernameStatus.style.color =
                "#ef4444";

            usernameAvailable = false;

            updateSignupButton();

            return;

        }

        /* ==========================================
           CREATE AUTH ACCOUNT
        ========================================== */

        setLoading("Creating Firebase Account...");

        const userCredential =
            await createUserWithEmailAndPassword(

                auth,
                email,
                password

            );

        const user =
            userCredential.user;

        /* ==========================================
           UPDATE DISPLAY NAME
        ========================================== */

        setLoading("Updating Profile...");

        await updateProfile(user,{

            displayName: username

        });

        /* ==========================================
           SAVE USER
        ========================================== */

        setLoading("Saving Profile...");

        await setDoc(

            doc(db,"users",user.uid),

            {

                uid: user.uid,

                username: username,

                email: email,

                photo: "",

                coverPhoto: "",

                bio: "",

                location: "",

                website: "",

                github: "",

                linkedin: "",

                role: "user",

                verified: false,

                followers: 0,

                following: 0,

                articleCount: 0,

                totalViews: 0,

                totalLikes: 0,

                joinedAt: serverTimestamp()

            }

        );

        /* ==========================================
           SEND VERIFICATION EMAIL
        ========================================== */

        setLoading("Sending Verification Email...");

        await sendEmailVerification(user);

        /* ==========================================
           SIGN OUT
        ========================================== */

        await signOut(auth);

        /* ==========================================
           SUCCESS
        ========================================== */

        window.location.href =
        `verify-email.html?email=${encodeURIComponent(email)}`;

    }

    catch(error){

        console.error(error);

        stopLoading();

        switch(error.code){

            case "auth/email-already-in-use":

                alert("Email already exists.");

                break;

            case "auth/invalid-email":

                alert("Invalid email address.");

                break;

            case "auth/weak-password":

                alert("Password is too weak.");

                break;

            case "auth/network-request-failed":

                alert("No internet connection.");

                break;

            default:

                alert(error.message);

        }

    }

});

/* ==========================================================
   BUTTON STATE
========================================================== */

function updateSignupButton(){

    signupButton.disabled =
        !(usernameAvailable && passwordValid);

}

