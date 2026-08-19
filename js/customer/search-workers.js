import { db } from "../firebase/firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


const params = new URLSearchParams(window.location.search);

const category = params.get("category");


const pageTitle =
    document.getElementById("pageTitle");

const container =
    document.getElementById("workerContainer");


pageTitle.innerHTML = category || "Workers";


async function loadWorkers() {

    container.innerHTML = "Loading...";


    try {

        const q = query(

            collection(db, "users"),

            where("role", "==", "worker"),

            where("category", "==", category),

            where("accountStatus", "==", "active"),

            where("verificationStatus", "==", "verified"),

            where("availability", "==", true)

        );


        const querySnapshot =
            await getDocs(q);


        container.innerHTML = "";


        if (querySnapshot.empty) {

            container.innerHTML =
                "<h2>No approved workers available.</h2>";

            return;

        }


        querySnapshot.forEach((workerDoc) => {

            const data = workerDoc.data();


            container.innerHTML += `

                <div class="card">

                    <h3>
                        ${data.name || "Worker"}
                    </h3>

                    <p>
                        Category:
                        ${data.category || "-"}
                    </p>

                    <p>
                        Experience:
                        ${data.experience || 0} Years
                    </p>

                    <p>
                        Rate:
                        ₹${data.hourlyRate || 0}/Hr
                    </p>

                    <p>
                        City:
                        ${data.city || "-"}
                    </p>

                    <p>
                        ⭐ ${data.rating || 0}
                    </p>

                    <button
                        class="viewBtn"
                        data-id="${workerDoc.id}">
                        View Profile
                    </button>

                </div>

            `;

        });


        // View worker profile
        document
            .querySelectorAll(".viewBtn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const workerId =
                        button.dataset.id;


                    window.location.href =
                        `worker-details.html?id=${workerId}`;

                });

            });


    } catch (error) {

        console.error(
            "Worker search error:",
            error
        );


        container.innerHTML = `
            <h2>Unable to load workers.</h2>
            <p>Please try again later.</p>
        `;

    }

}


loadWorkers();