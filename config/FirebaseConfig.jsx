// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhUbPqPj-3ttDMRieEHAXhtFNewhDEp-o",
    authDomain: "cabpricecomp.firebaseapp.com",
    projectId: "cabpricecomp",
    storageBucket: "cabpricecomp.firebasestorage.app",
    messagingSenderId: "26396936624",
    appId: "1:26396936624:web:046f25222e2de2e837ee75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const db=getFirestore(app);