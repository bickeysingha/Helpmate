import { auth, db } from "../firebase/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


const params = new URLSearchParams(window.location.search);

const workerId = params.get("workerId");

const bookingForm = document.getElementById("bookingForm");

let currentUser = null;
let workerData = null;


// Check customer login
onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    if (!workerId) {

        alert("Worker ID is missing.");

        return;

    }


    try {

        // Get worker
        const workerSnap =
            await getDoc(doc(db, "users", workerId));


        if (!workerSnap.exists()) {

            alert("Worker not found.");

            return;

        }


        workerData = workerSnap.data();


        // Display worker information
        document.getElementById("workerName").value =
            workerData.name;

        document.getElementById("category").value =
            workerData.category;

        document.getElementById("rate").value =
            "₹" + workerData.hourlyRate + "/Hr";


    } catch (error) {

        console.error("Worker loading error:", error);

        alert(error.message);

    }

});


// Booking submission
bookingForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    if (!currentUser) {

        alert("Please login first.");

        return;

    }


    if (!workerData) {

        alert("Worker information is not loaded.");

        return;

    }


    try {

        // Get customer information
        const customerSnap =
            await getDoc(
                doc(db, "users", currentUser.uid)
            );


        if (!customerSnap.exists()) {

            alert("Customer profile not found.");

            return;

        }


        const customerData = customerSnap.data();


        // Create booking
        const bookingRef = await addDoc(
            collection(db, "bookings"),
            {

                customerId: currentUser.uid,

                customerName: customerData.name,

                workerId: workerId,

                workerName: workerData.name,

                category: workerData.category,

                hourlyRate: Number(workerData.hourlyRate),

                workDate:
                    document.getElementById("workDate").value,

                workTime:
                    document.getElementById("workTime").value,

                workDescription:
                    document.getElementById("workDescription").value.trim(),

                workAddress:
                    document.getElementById("workAddress").value.trim(),

                status: "Pending",

                createdAt: serverTimestamp()

            }
        );


        console.log("Booking created:", bookingRef.id);

        alert("Booking Request Sent Successfully!");

        window.location.href = "customer-bookings.html";


    } catch (error) {

        console.error("Booking creation error:", error);

        alert("Booking failed: " + error.message);

    }

});