// // Import Firebase modules
// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

// import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";



// // Your Firebase config
// const firebaseConfig = {
//     // Paste your config here
//     apiKey: "AIzaSyB-wgd4t3vIs9tKmxSBp4DEwpEENGuF5xQ",
//   authDomain: "helpmate-15a75.firebaseapp.com",
//   projectId: "helpmate-15a75",
//   storageBucket: "helpmate-15a75.firebasestorage.app",
//   messagingSenderId: "600515286858",
//   appId: "1:600515286858:web:fcab4568da12adf86f13b3"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Services
// const auth = getAuth(app);
// const db = getFirestore(app);

// // Export
// export { auth, db };

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {

     apiKey: "AIzaSyB-wgd4t3vIs9tKmxSBp4DEwpEENGuF5xQ",
   authDomain: "helpmate-15a75.firebaseapp.com",
   projectId: "helpmate-15a75",
   storageBucket: "helpmate-15a75.firebasestorage.app",
   messagingSenderId: "600515286858",
   appId: "1:600515286858:web:fcab4568da12adf86f13b3"
 };



// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase services
const auth = getAuth(app);

const db = getFirestore(app);


// Export
export {
    auth,
    db
};