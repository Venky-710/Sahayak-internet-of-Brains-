import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, 
         GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAo-6xL6EuJfaPCeRdhqpf7S7z6-XR3jVY",
    authDomain: "gold-is-old.firebaseapp.com",
    projectId: "gold-is-old",
    storageBucket: "gold-is-old.firebasestorage.app",
    messagingSenderId: "771256428259",
    appId: "1:771256428259:web:3242264c53daf8422687d6",
    measurementId: "G-07CMYTWKWL"
  };


  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const db = getFirestore(app);

export { auth, provider, db };