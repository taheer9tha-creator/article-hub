import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    serverTimestamp,
    increment,
    query,
    where,
    orderBy,
    limit,
    arrayUnion,
    arrayRemove,

} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* =========================================
   Firebase Configuration
========================================= */

const firebaseConfig = {

    apiKey: "AIzaSyAXSm7pImAOZmf2aJMcEKteei9tybzZ8uI",
    authDomain: "article-webpage.firebaseapp.com",
    projectId: "article-webpage",
    storageBucket: "article-webpage.firebasestorage.app",
    messagingSenderId: "300644677319",
    appId: "1:300644677319:web:2bcee47b4b1ccd0d0170e2"

};

/* =========================================
   Initialize Firebase
========================================= */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* =========================================
   Exports
========================================= */

export{

    auth,
    db,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    serverTimestamp,
    increment,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    orderBy,
    limit,
    arrayUnion,
    arrayRemove,

};