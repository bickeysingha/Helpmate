import { auth, db } from "../firebase/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    doc,
    getDoc,
    addDoc,
    collection,
    updateDoc,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


const params = new URLSearchParams(window.location.search);

const bookingId = params.get("bookingId");

let bookingData = null;
let currentUser = null;


onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;


    if (!bookingId) {

        alert("Booking ID missing.");

        return;

    }


    const bookingSnap =
        await getDoc(doc(db, "bookings", bookingId));


    if (!bookingSnap.exists()) {

        alert("Booking not found.");

        return;

    }


    bookingData = bookingSnap.data();


    if (bookingData.status !== "Completed") {

        alert("This booking is not completed yet.");

        window.location.href = "customer-bookings.html";

        return;

    }


    document.getElementById("workerName").innerHTML =
        bookingData.workerName;


    // Check whether review already exists
    const reviewQuery = query(
        collection(db, "reviews"),
        where("bookingId", "==", bookingId),
        where("customerId", "==", currentUser.uid)
    );


    const reviewSnapshot = await getDocs(reviewQuery);


    if (!reviewSnapshot.empty) {

        alert("You have already reviewed this booking.");

        window.location.href = "customer-bookings.html";

    }

});


document
    .getElementById("reviewForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();


        if (!bookingData || !currentUser) {

            return;

        }


        const rating =
            Number(document.getElementById("rating").value);


        const review =
            document.getElementById("review").value.trim();


        if (!rating || !review) {

            alert("Please provide a rating and review.");

            return;

        }


        try {

            // Check again before creating review
            const checkQuery = query(
                collection(db, "reviews"),
                where("bookingId", "==", bookingId),
                where("customerId", "==", currentUser.uid)
            );


            const existingReviews =
                await getDocs(checkQuery);


            if (!existingReviews.empty) {

                alert("You have already reviewed this booking.");

                return;

            }


            // Create review
            await addDoc(
                collection(db, "reviews"),
                {

                    bookingId: bookingId,

                    customerId: currentUser.uid,

                    customerName: bookingData.customerName,

                    workerId: bookingData.workerId,

                    workerName: bookingData.workerName,

                    rating: rating,

                    review: review,

                    createdAt: new Date()

                }
            );


            // Get all reviews for worker
            const workerReviewsQuery = query(
                collection(db, "reviews"),
                where(
                    "workerId",
                    "==",
                    bookingData.workerId
                )
            );


            const workerReviews =
                await getDocs(workerReviewsQuery);


            let totalRating = 0;


            workerReviews.forEach((item) => {

                totalRating +=
                    Number(item.data().rating);

            });


            const averageRating =
                totalRating / workerReviews.size;


            // Update worker rating
            await updateDoc(
                doc(db, "users", bookingData.workerId),
                {

                    rating:
                        Number(averageRating.toFixed(1))

                }
            );


            alert("Review submitted successfully!");

            window.location.href =
                "customer-bookings.html";


        } catch (error) {

            console.error(error);

            alert("Failed to submit review: " + error.message);

        }

    });