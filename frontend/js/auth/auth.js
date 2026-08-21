import { auth, db } from "../firebase/firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


// =====================================================
// SIGNUP
// =====================================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const city =
            document.getElementById("city").value.trim();

        const role =
            document.getElementById("role").value;

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // Validate role
        if (role !== "customer" && role !== "worker") {

            alert("Please select Customer or Worker.");

            return;

        }


        // Validate password
        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;

        }


        if (password.length < 6) {

            alert("Password must contain at least 6 characters.");

            return;

        }


        try {

            // Create Firebase Authentication account
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user = userCredential.user;


            // Create Firestore profile
            await setDoc(
                doc(db, "users", user.uid),
                {

                    uid: user.uid,

                    name: name,

                    email: email,

                    phone: phone,

                    city: city,

                    role: role,


                    // Account control
                    accountStatus: "pending",

                    verificationStatus: "pending",


                    // Worker profile
                    profileCompleted: false,

                    category: "",

                    experience: "",

                    hourlyRate: "",

                    description: "",

                    availability: false,


                    // Statistics
                    rating: 0,

                    jobsCompleted: 0,


                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp()

                }
            );


            alert(
                "Account created successfully. Your account is waiting for admin approval."
            );


            window.location.href = "login.html";


        } catch (error) {

            console.error("Signup error:", error);

            alert(error.message);

        }

    });

}



// =====================================================
// LOGIN
// =====================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        try {
           

            // Firebase Authentication
            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;

            

            // Get Firestore profile
            const userSnap =
                await getDoc(
                    doc(db, "users", user.uid)
                );


            if (!userSnap.exists()) {

                alert(
                    "Your account profile could not be found."
                );

                return;

            }


            const userData =
                userSnap.data();


            // =================================================
            // ACCOUNT STATUS CHECK
            // =================================================

            if (userData.accountStatus === "suspended") {

                alert(
                    "Your account has been suspended. Please contact HelpMate support."
                );

                return;

            }


            if (userData.accountStatus === "rejected") {

                alert(
                    "Your account application has been rejected."
                );

                return;

            }


            if (userData.accountStatus === "pending") {

                alert(
                    "Your account is waiting for admin approval."
                );

                return;

            }


            // =================================================
            // ADMIN
            // =================================================

            if (userData.role === "admin") {

                window.location.href =
                    "admin-dashboard.html";

                return;

            }


            // =================================================
            // CUSTOMER
            // =================================================

            if (userData.role === "customer") {

                window.location.href =
                    "customer_dashboard.html";

                return;

            }


            // =================================================
            // WORKER
            // =================================================

            if (userData.role === "worker") {

                if (userData.verificationStatus !== "verified") {

                    alert(
                        "Your identity verification is still pending."
                    );

                    return;

                }


                if (!userData.profileCompleted) {

                    window.location.href =
                        "worker-profile.html";

                    return;

                }


                window.location.href =
                    "worker-dashboard.html";

                return;

            }


            // Unknown role
            alert("Invalid account role.");


        } catch (error) {

            console.error("Login error:", error);

            alert(error.message);

        }

    });

}