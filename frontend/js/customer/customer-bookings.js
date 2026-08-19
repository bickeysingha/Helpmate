import { auth, db } from "../firebase/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


const container = document.getElementById("bookingContainer");


onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    await loadBookings(user.uid);

});


async function loadBookings(customerId) {

    container.innerHTML = "Loading...";


    try {

        const q = query(
            collection(db, "bookings"),
            where("customerId", "==", customerId)
        );


        const snapshot = await getDocs(q);


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML = "<h2>No Bookings Found</h2>";

            return;

        }


        snapshot.forEach((booking) => {

            const data = booking.data();

            const status = data.status || "Pending";


            let action = "";


            // Show review button after job completion
            if (status === "Completed") {

                action = `
                    <button
                        class="review-btn"
                        data-id="${booking.id}">
                        ⭐ Review Worker
                    </button>
                `;

            }


            container.innerHTML += `

                <div class="booking-card">

                    <h2>${data.category}</h2>

                    <p>
                        <strong>Worker:</strong>
                        ${data.workerName}
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
                        <span class="${status.toLowerCase()}">
                            ${status}
                        </span>
                    </p>

                    ${action}

                </div>

            `;

        });


        // Review button events
        document.querySelectorAll(".review-btn").forEach(button => {

            button.addEventListener("click", () => {

                const bookingId = button.dataset.id;

                window.location.href =
                    `review.html?bookingId=${bookingId}`;

            });

        });


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load bookings.</p>";

    }

}