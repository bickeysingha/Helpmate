import { auth, db } from "../firebase/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


// =====================================================
// DOM ELEMENTS
// =====================================================

const logoutBtn =
    document.getElementById("logoutBtn");

const bookingContainer =
    document.getElementById("bookingContainer");

const userTableBody =
    document.getElementById("userTableBody");

const userSearch =
    document.getElementById("userSearch");

const clearUserSearch =
    document.getElementById("clearUserSearch");


// =====================================================
// EDIT MODAL
// =====================================================

const editModal =
    document.getElementById("editModal");

const editUserForm =
    document.getElementById("editUserForm");

const closeEditModal =
    document.getElementById("closeEditModal");

const cancelEdit =
    document.getElementById("cancelEdit");

const editAadhaar =
    document.getElementById("editAadhaar");

const editPan =
    document.getElementById("editPan");

const editAadhaarStatus =
    document.getElementById("editAadhaarStatus");

const editPanStatus =
    document.getElementById("editPanStatus");


// =====================================================
// VERIFICATION
// =====================================================

const verificationContainer =
    document.getElementById("verificationContainer");


let allUsers = [];


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }


    try {

        const userSnap = await getDoc(
            doc(db, "users", user.uid)
        );


        if (!userSnap.exists()) {

            alert("User profile not found.");

            await signOut(auth);

            window.location.href =
                "login.html";

            return;

        }


        const userData =
            userSnap.data();


        console.log(
            "ADMIN ROLE:",
            userData.role
        );


        console.log(
            "ADMIN USER DATA:",
            userData
        );


        // =================================================
        // ADMIN CHECK
        // =================================================

        if (userData.role !== "admin") {

            alert("Access denied.");

            window.location.href =
                "customer_dashboard.html";

            return;

        }


        // =================================================
        // LOAD DASHBOARD
        // =================================================

        await loadDashboard();


    } catch (error) {

        console.error(
            "Admin error:",
            error
        );

    }

});


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        const usersSnapshot =
            await getDocs(
                collection(db, "users")
            );


        const bookingsSnapshot =
            await getDocs(
                collection(db, "bookings")
            );


        let workers = 0;

        let customers = 0;


        // =================================================
        // STORE USERS
        // =================================================

        allUsers = [];


        usersSnapshot.forEach((item) => {

            const data =
                item.data();


            allUsers.push({

                id: item.id,

                ...data

            });


            if (data.role === "worker") {

                workers++;

            }


            if (data.role === "customer") {

                customers++;

            }

        });


        // =================================================
        // STATISTICS
        // =================================================

        document.getElementById(
            "totalUsers"
        ).innerHTML =
            usersSnapshot.size;


        document.getElementById(
            "totalWorkers"
        ).innerHTML =
            workers;


        document.getElementById(
            "totalCustomers"
        ).innerHTML =
            customers;


        document.getElementById(
            "totalBookings"
        ).innerHTML =
            bookingsSnapshot.size;


        // =================================================
        // RENDER USERS
        // =================================================

        renderUsers(allUsers);


        // =================================================
        // RECENT BOOKINGS
        // =================================================

        bookingContainer.innerHTML = "";


        if (bookingsSnapshot.empty) {

            bookingContainer.innerHTML =
                "<p>No bookings yet.</p>";

        } else {

            bookingsSnapshot.forEach((booking) => {

                const data =
                    booking.data();


                bookingContainer.innerHTML += `

                    <div class="booking-card">

                        <p>
                            <strong>Customer:</strong>
                            ${data.customerName || "-"}
                        </p>

                        <p>
                            <strong>Worker:</strong>
                            ${data.workerName || "-"}
                        </p>

                        <p>
                            <strong>Category:</strong>
                            ${data.category || "-"}
                        </p>

                        <p>
                            <strong>Date:</strong>
                            ${data.workDate || "-"}
                        </p>

                        <p>
                            <strong>Time:</strong>
                            ${data.workTime || "-"}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${data.status || "-"}
                        </p>

                    </div>

                `;

            });

        }


        // =================================================
        // WORKER VERIFICATION
        // =================================================

        await loadWorkerVerification();


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


// =====================================================
// RENDER USERS
// =====================================================

function renderUsers(users) {

    userTableBody.innerHTML = "";


    if (users.length === 0) {

        userTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;"
                >

                    No users found.

                </td>

            </tr>

        `;

        return;

    }


    users.forEach((user) => {

        userTableBody.innerHTML += `

            <tr>

                <td>
                    ${user.name || "-"}
                </td>

                <td>
                    ${user.email || "-"}
                </td>

                <td>
                    ${user.phone || "-"}
                </td>

                <td>
                    ${user.city || "-"}
                </td>

                <td>
                    ${user.role || "-"}
                </td>

                <td>
                    ${user.accountStatus || "pending"}
                </td>

                <td>
                    ${user.verificationStatus || "pending"}
                </td>

                <td>

                    <div class="user-actions">

                        <!-- VIEW -->

                        <button
                            class="view-user"
                            data-id="${user.id}">
                            View
                        </button>


                        <!-- APPROVE / REJECT -->

                        ${
                            user.accountStatus === "pending"
                            ?
                            `
                            <button
                                class="approve-user"
                                data-id="${user.id}">
                                Approve
                            </button>

                            <button
                                class="reject-user"
                                data-id="${user.id}">
                                Reject
                            </button>
                            `
                            :
                            ""
                        }


                        <!-- VERIFY WORKER -->

                        ${
                            user.role === "worker"
                            &&
                            user.verificationStatus === "pending"
                            ?
                            `
                            <button
                                class="verify-user"
                                data-id="${user.id}">
                                Verify
                            </button>
                            `
                            :
                            ""
                        }


                        <!-- SUSPEND -->

                        ${
                            user.accountStatus === "active"
                            ?
                            `
                            <button
                                class="suspend-user"
                                data-id="${user.id}">
                                Suspend
                            </button>
                            `
                            :
                            ""
                        }


                        <!-- REACTIVATE -->

                        ${
                            user.accountStatus === "suspended"
                            ?
                            `
                            <button
                                class="reactivate-user"
                                data-id="${user.id}">
                                Reactivate
                            </button>
                            `
                            :
                            ""
                        }


                        <!-- EDIT -->

                        <button
                            class="edit-user"
                            data-id="${user.id}">
                            Edit
                        </button>


                        <!-- DELETE -->

                        <button
                            class="delete-user"
                            data-id="${user.id}">
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

        `;

    });

}


// =====================================================
// UPDATE USER STATUS
// =====================================================

async function updateUserStatus(
    userId,
    status,
    action = ""
) {

    try {

        await updateDoc(
            doc(db, "users", userId),
            {

                accountStatus:
                    status,

                updatedAt:
                    new Date()

            }
        );


        if (action === "approve") {

            alert(
                "User approved successfully."
            );

        }

        else if (action === "reject") {

            alert(
                "User rejected."
            );

        }

        else if (action === "suspend") {

            alert(
                "User suspended."
            );

        }

        else if (action === "reactivate") {

            alert(
                "User reactivated."
            );

        }


        await loadDashboard();


    } catch (error) {

        console.error(
            "User status update error:",
            error
        );


        alert(
            "Could not update user: " +
            error.message
        );

    }

}


async function deleteUser(userId) {

    const confirmDelete = confirm(
        "Are you sure you want to permanently delete this user?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        await deleteDoc(
            doc(db, "users", userId)
        );

        alert("User deleted successfully.");

        await loadDashboard();

    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );

        alert(
            "Could not delete user: " +
            error.message
        );

    }

}

// =====================================================
// VERIFY WORKER
// =====================================================

async function verifyWorker(userId) {

    try {

        await updateDoc(
            doc(db, "users", userId),
            {

                verificationStatus:
                    "verified",

                updatedAt:
                    new Date()

            }
        );


        alert(
            "Worker verified successfully."
        );


        await loadDashboard();


    } catch (error) {

        console.error(
            "Worker verification error:",
            error
        );


        alert(
            "Could not verify worker: " +
            error.message
        );

    }

}


// =====================================================
// REJECT WORKER VERIFICATION
// =====================================================

async function rejectWorkerVerification(userId) {

    try {

        await updateDoc(
            doc(db, "users", userId),
            {

                verificationStatus:
                    "rejected",

                updatedAt:
                    new Date()

            }
        );


        alert(
            "Worker verification rejected."
        );


        await loadDashboard();


    } catch (error) {

        console.error(
            "Worker rejection error:",
            error
        );


        alert(
            "Could not reject worker verification: " +
            error.message
        );

    }

}


// =====================================================
// VIEW USER
// =====================================================

function viewUser(userId) {

    const user =
        allUsers.find(
            user =>
                user.id === userId
        );


    if (!user) {

        alert(
            "User not found."
        );

        return;

    }


    alert(`

Name: ${user.name || "-"}

Email: ${user.email || "-"}

Phone: ${user.phone || "-"}

City: ${user.city || "-"}

Role: ${user.role || "-"}

Status: ${user.accountStatus || "-"}

Verification: ${user.verificationStatus || "-"}

Category: ${user.category || "-"}

Experience: ${user.experience || "-"}

Hourly Rate: ₹${user.hourlyRate || "-"}

Description: ${user.description || "-"}

    `);

}


// =====================================================
// OPEN EDIT MODAL
// =====================================================

function openEditUser(userId) {

    const user =
        allUsers.find(
            user =>
                user.id === userId
        );


    if (!user) {

        alert(
            "User not found."
        );

        return;

    }


    document.getElementById(
        "editUserId"
    ).value =
        user.id;


    document.getElementById(
        "editName"
    ).value =
        user.name || "";


    document.getElementById(
        "editEmail"
    ).value =
        user.email || "";


    document.getElementById(
        "editPhone"
    ).value =
        user.phone || "";


    document.getElementById(
        "editCity"
    ).value =
        user.city || "";


    document.getElementById(
        "editCategory"
    ).value =
        user.category || "";


    document.getElementById(
        "editExperience"
    ).value =
        user.experience || 0;


    document.getElementById(
        "editHourlyRate"
    ).value =
        user.hourlyRate || 0;


    document.getElementById(
        "editDescription"
    ).value =
        user.description || "";


    // AADHAAR

    editAadhaar.value =
        user.aadhaarNumber || "";


    // PAN

    editPan.value =
        user.panNumber || "";


    // AADHAAR VERIFICATION STATUS

    editAadhaarStatus.value =
        user.aadhaarVerificationStatus ||
        "pending";


    // PAN VERIFICATION STATUS

    editPanStatus.value =
        user.panVerificationStatus ||
        "not_provided";


    editModal.style.display =
        "flex";

}


// =====================================================
// SAVE EDITED USER
// =====================================================

if (editUserForm) {

    editUserForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const userId =
                document.getElementById(
                    "editUserId"
                ).value;


            try {

                await updateDoc(
                    doc(
                        db,
                        "users",
                        userId
                    ),
                    {

                        name:
                            document.getElementById(
                                "editName"
                            ).value.trim(),


                        email:
                            document.getElementById(
                                "editEmail"
                            ).value.trim(),


                        phone:
                            document.getElementById(
                                "editPhone"
                            ).value.trim(),


                        city:
                            document.getElementById(
                                "editCity"
                            ).value.trim(),


                        category:
                            document.getElementById(
                                "editCategory"
                            ).value.trim(),


                        experience:
                            Number(
                                document.getElementById(
                                    "editExperience"
                                ).value
                            ),


                        hourlyRate:
                            Number(
                                document.getElementById(
                                    "editHourlyRate"
                                ).value
                            ),


                        description:
                            document.getElementById(
                                "editDescription"
                            ).value.trim(),


                        // AADHAAR

                        aadhaarNumber:
                            editAadhaar.value.trim(),


                        // PAN

                        panNumber:
                            editPan.value
                                .trim()
                                .toUpperCase(),


                        // AADHAAR STATUS

                        aadhaarVerificationStatus:
                            editAadhaarStatus.value,


                        // PAN STATUS

                        panVerificationStatus:
                            editPanStatus.value,


                        updatedAt:
                            new Date()

                    }
                );


                alert(
                    "User updated successfully."
                );


                editModal.style.display =
                    "none";


                await loadDashboard();


            } catch (error) {

                console.error(
                    "Edit user error:",
                    error
                );


                alert(
                    "Could not update user: " +
                    error.message
                );

            }

        }
    );

}


// =====================================================
// CLOSE EDIT MODAL
// =====================================================

if (closeEditModal) {

    closeEditModal.addEventListener(
        "click",
        () => {

            editModal.style.display =
                "none";

        }
    );

}


if (cancelEdit) {

    cancelEdit.addEventListener(
        "click",
        () => {

            editModal.style.display =
                "none";

        }
    );

}


// =====================================================
// USER ACTIONS
// =====================================================

document.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target;


        // =================================================
        // VIEW
        // =================================================

        if (
            button.classList.contains(
                "view-user"
            )
        ) {

            viewUser(
                button.dataset.id
            );

        }


        // =================================================
        // EDIT
        // =================================================

        if (
            button.classList.contains(
                "edit-user"
            )
        ) {

            openEditUser(
                button.dataset.id
            );

        }


        // =================================================
        // APPROVE
        // =================================================

        if (
            button.classList.contains(
                "approve-user"
            )
        ) {

            await updateUserStatus(
                button.dataset.id,
                "active",
                "approve"
            );

        }


        // =================================================
        // REJECT
        // =================================================

        if (
            button.classList.contains(
                "reject-user"
            )
        ) {

            await updateUserStatus(
                button.dataset.id,
                "rejected",
                "reject"
            );

        }


        // =================================================
        // VERIFY WORKER FROM USERS TABLE
        // =================================================

        if (
            button.classList.contains(
                "verify-user"
            )
        ) {

            await verifyWorker(
                button.dataset.id
            );

        }


        // =================================================
        // SUSPEND
        // =================================================

        if (
            button.classList.contains(
                "suspend-user"
            )
        ) {

            const confirmSuspend =
                confirm(
                    "Are you sure you want to suspend this user?"
                );


            if (confirmSuspend) {

                await updateUserStatus(
                    button.dataset.id,
                    "suspended",
                    "suspend"
                );

            }

        }


        // =================================================
        // REACTIVATE
        // =================================================

        if (
            button.classList.contains(
                "reactivate-user"
            )
        ) {

            await updateUserStatus(
                button.dataset.id,
                "active",
                "reactivate"
            );

        }


        // =================================================
        // VERIFY WORKER DOCUMENTS
        // =================================================

        if (
            button.classList.contains(
                "verify-worker"
            )
        ) {

            const userId =
                button.dataset.id;


            const confirmVerify =
                confirm(
                    "Have you manually verified the worker's Aadhaar/PAN details?"
                );


            if (!confirmVerify) {

                return;

            }


            await verifyWorker(
                userId
            );

        }


        // =================================================
        // REJECT WORKER DOCUMENTS
        // =================================================

        if (
            button.classList.contains(
                "reject-worker"
            )
        ) {

            const userId =
                button.dataset.id;


            const confirmReject =
                confirm(
                    "Are you sure you want to reject this worker's verification?"
                );


            if (!confirmReject) {

                return;

            }


            await rejectWorkerVerification(
                userId
            );

        }

        // delete user

        if (
            button.classList.contains(
            "delete-user"
            )
        ) {

            await deleteUser(
                button.dataset.id
            );

        }

    }
);


// =====================================================
// SEARCH USERS
// =====================================================

if (userSearch) {

    userSearch.addEventListener(
        "input",
        () => {

            const search =
                userSearch.value
                    .trim()
                    .toLowerCase();


            const filteredUsers =
                allUsers.filter(
                    (user) => {

                        const name =
                            String(
                                user.name || ""
                            )
                            .toLowerCase();


                        const email =
                            String(
                                user.email || ""
                            )
                            .toLowerCase();


                        const phone =
                            String(
                                user.phone || ""
                            )
                            .toLowerCase();


                        return (

                            name.includes(
                                search
                            )

                            ||

                            email.includes(
                                search
                            )

                            ||

                            phone.includes(
                                search
                            )

                        );

                    }
                );


            renderUsers(
                filteredUsers
            );

        }
    );

}


// =====================================================
// LOAD WORKER VERIFICATION
// =====================================================

async function loadWorkerVerification() {

    verificationContainer.innerHTML =
        "Loading...";


    try {

        const usersSnapshot =
            await getDocs(
                collection(db, "users")
            );


        verificationContainer.innerHTML =
            "";


        let pendingWorkers = 0;


        usersSnapshot.forEach((item) => {

            const user =
                item.data();


            // Only workers that are not verified

            if (
                user.role !== "worker" ||
                user.verificationStatus !== "pending"
            ) {

                return;

            }


            pendingWorkers++;


            // =============================================
            // MASK AADHAAR
            // =============================================

            const aadhaar =
                String(
                    user.aadhaarNumber || ""
                ).replace(
                    /\s/g,
                    ""
                );


            const maskedAadhaar =
                aadhaar.length === 12
                    ? "XXXX XXXX " +
                      aadhaar.slice(-4)
                    : "Not provided";


            // =============================================
            // PAN
            // =============================================

            const pan =
                user.panNumber ||
                "Not provided";


            // =============================================
            // CARD
            // =============================================

            verificationContainer.innerHTML += `

                <div class="verification-card">

                    <h3>
                        ${user.name || "-"}
                    </h3>


                    <p>
                        <strong>Email:</strong>
                        ${user.email || "-"}
                    </p>


                    <p>
                        <strong>Phone:</strong>
                        ${user.phone || "-"}
                    </p>


                    <p>
                        <strong>Category:</strong>
                        ${user.category || "-"}
                    </p>


                    <p>
                        <strong>Aadhaar:</strong>
                        ${maskedAadhaar}
                    </p>


                    <p>
                        <strong>Aadhaar Status:</strong>
                        ${
                            user.aadhaarVerificationStatus ||
                            "Pending"
                        }
                    </p>


                    <p>
                        <strong>PAN:</strong>
                        ${pan}
                    </p>


                    <p>
                        <strong>PAN Status:</strong>
                        ${
                            user.panVerificationStatus ||
                            "Not Provided"
                        }
                    </p>


                    <p>
                        <strong>Account Status:</strong>
                        ${user.accountStatus || "-"}
                    </p>


                    <p>
                        <strong>Overall Verification:</strong>
                        ${
                            user.verificationStatus ||
                            "Pending"
                        }
                    </p>


                    <div class="verification-actions">

                        <button
                            class="verify-worker"
                            data-id="${item.id}">
                            Verify Worker
                        </button>


                        <button
                            class="reject-worker"
                            data-id="${item.id}">
                            Reject Verification
                        </button>

                    </div>

                </div>

            `;

        });


        // =================================================
        // NO PENDING WORKERS
        // =================================================

        if (pendingWorkers === 0) {

            verificationContainer.innerHTML =

                "<p>No workers awaiting verification.</p>";

        }


    } catch (error) {

        console.error(
            "Worker verification error:",
            error
        );


        verificationContainer.innerHTML = `

            <p>
                Unable to load verification requests.
            </p>

        `;

    }

}


// =====================================================
// CLEAR SEARCH
// =====================================================

if (clearUserSearch) {

    clearUserSearch.addEventListener(
        "click",
        () => {

            userSearch.value = "";

            renderUsers(
                allUsers
            );

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            window.location.href =
                "login.html";

        }
    );

}