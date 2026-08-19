const username = localStorage.getItem("username");

const welcome = document.getElementById("welcomeMessage");

if(username){

welcome.innerHTML = `Welcome ${username} 👋`;

}import { auth, db } from "../firebase/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const welcomeMessage = document.getElementById("welcomeMessage");
const logoutBtn = document.getElementById("logoutBtn");


// Check if user is logged in
onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        const docRef = doc(db, "users", user.uid);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

            const data = docSnap.data();

            welcomeMessage.innerHTML = `Welcome ${data.name} 👋`;

            console.log(data);

        } else {

            alert("User data not found.");

        }

    } catch (error) {

        console.error(error);

    }

});

const cards = document.querySelectorAll(".card[data-category]");

cards.forEach(card => {

    card.addEventListener("click", () => {

        const category = card.dataset.category;

        window.location.href =
            `search-workers.html?category=${encodeURIComponent(category)}`;

    });

});

document.querySelector(".bookings-card").addEventListener("click", () => {

    window.location.href = "customer-bookings.html";

});

// Logout
logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        alert("Logged Out Successfully");

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

});
