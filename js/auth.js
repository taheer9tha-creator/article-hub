import {
    auth,
    signOut,
    onAuthStateChanged,
    db,
    collection,
    getDocs
} from "./firebase.js";

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

    }

});