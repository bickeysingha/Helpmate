import { auth, db } from "../firebase/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const logoutBtn = document.getElementById("logoutBtn");
const container = document.getElementById("requestContainer");

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("welcomeText").innerHTML =
        `Welcome ${data.name} 👋`;

    document.getElementById("name").innerHTML = data.name;
    document.getElementById("category").innerHTML = data.category;
    document.getElementById("experience").innerHTML =
        data.experience + " Years";
    document.getElementById("rate").innerHTML =
        "₹" + data.hourlyRate + "/Hr";
    document.getElementById("city").innerHTML = data.city;
    document.getElementById("rating").innerHTML =
        data.rating + " ⭐";
    document.getElementById("completedJobs").innerHTML =
        data.jobsCompleted;

    document.getElementById("availabilitySwitch").checked =
        data.availability;

    loadBookings(user.uid);
    loadEarnings(user.uid);

});


async function loadBookings(workerId) {

    container.innerHTML = "Loading...";

    const q = query(
        collection(db, "bookings"),
        where("workerId", "==", workerId)
    );

    const snapshot = await getDocs(q);

    container.innerHTML = "";

    if (snapshot.empty) {

        container.innerHTML = "<p>No bookings found.</p>";

        return;

    }

    snapshot.forEach((booking) => {

        const data = booking.data();

        let buttons = "";

        if (data.status === "Pending") {

            buttons = `
                <button class="accept"
                    data-id="${booking.id}">
                    Accept
                </button>

                <button class="reject"
                    data-id="${booking.id}">
                    Reject
                </button>
            `;

        }

        else if (data.status === "Accepted") {

            buttons = `
                <button
                        class="complete"
                        data-id="${booking.id}"
                        data-rate="${data.hourlyRate}">
                        Mark Job Completed
                </button>
            `;

        }

        container.innerHTML += `

            <div class="request-card">

                <p>
                    <strong>Customer:</strong>
                    ${data.customerName}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${data.category}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${data.workDate}
                </p>

                <p>
                    <strong>Time:</strong>
                    ${data.workTime}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${data.workAddress}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${data.workDescription}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${data.status}
                </p>

                <div class="buttons">

                    ${buttons}

                </div>

            </div>

        `;

    });

    attachEvents();

}


function attachEvents() {

    document.querySelectorAll(".accept").forEach(button => {

        button.addEventListener("click", async () => {

            await updateDoc(
                doc(db, "bookings", button.dataset.id),
                {
                    status: "Accepted"
                }
            );

            loadBookings(auth.currentUser.uid);

        });

    });


    document.querySelectorAll(".reject").forEach(button => {

        button.addEventListener("click", async () => {

            await updateDoc(
                doc(db, "bookings", button.dataset.id),
                {
                    status: "Rejected"
                }
            );

            loadBookings(auth.currentUser.uid);

        });

    });


    document.querySelectorAll(".complete").forEach(button => {

    button.addEventListener("click", async () => {

        const earning = Number(button.dataset.rate);

        await updateDoc(
            doc(db, "bookings", button.dataset.id),
            {
                status: "Completed",
                completedAt: new Date(),
                workerEarning: earning
            }
        );

        loadBookings(auth.currentUser.uid);

    });

});

}

async function loadEarnings(workerId) {

    const q = query(
        collection(db, "bookings"),
        where("workerId", "==", workerId),
        where("status", "==", "Completed")
    );

    const snapshot = await getDocs(q);

    let total = 0;

    snapshot.forEach((booking) => {

        const data = booking.data();

        total += Number(data.workerEarning || 0);

    });

    document.getElementById("earnings").innerHTML =
        "₹" + total;

}




logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});