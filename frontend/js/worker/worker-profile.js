import { auth, db } from "../firebase/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const form = document.getElementById("workerProfileForm");

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "../../login.html";

        return;

    }

    currentUser = user;

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const category = document.getElementById("category").value;

    const experience = Number(document.getElementById("experience").value);

    const hourlyRate = Number(document.getElementById("hourlyRate").value);

    const description = document.getElementById("description").value.trim();

    const availability = document.getElementById("availability").checked;

    try {

        await updateDoc(doc(db, "users", currentUser.uid), {

            category,

            experience,

            hourlyRate,

            description,

            availability,

            profileCompleted: true

        });

        alert("Profile Completed Successfully!");

        window.location.href = "worker-dashboard.html";

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});