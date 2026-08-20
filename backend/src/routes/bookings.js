const express = require("express");

const {
    db
} = require("../config/firebase");

const authenticate =
    require("../middleware/auth");

const router =
    express.Router();


// =====================================================
// CREATE BOOKING
// POST /api/bookings
// =====================================================

router.post(
    "/",
    authenticate,
    async (req, res) => {

        try {

            // -------------------------------------------------
            // AUTHENTICATED CUSTOMER
            // -------------------------------------------------

            const customerId =
                req.user.uid;


            // -------------------------------------------------
            // REQUEST DATA
            // -------------------------------------------------

            const {
                workerId,
                workDate,
                workTime,
                workAddress,
                workDescription
            } = req.body;


            // -------------------------------------------------
            // BASIC VALIDATION
            // -------------------------------------------------

            if (
                !workerId ||
                !workDate ||
                !workTime ||
                !workAddress
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Worker, date, time and address are required."

                });

            }


            // -------------------------------------------------
            // GET CUSTOMER
            // -------------------------------------------------

            const customerDoc =
                await db
                    .collection("users")
                    .doc(customerId)
                    .get();


            if (!customerDoc.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer profile not found."

                });

            }


            const customer =
                customerDoc.data();


            // -------------------------------------------------
            // CHECK CUSTOMER ROLE
            // -------------------------------------------------

            if (
                customer.role !== "customer"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only customers can create bookings."

                });

            }


            // -------------------------------------------------
            // CHECK CUSTOMER ACCOUNT
            // -------------------------------------------------

            if (
                customer.accountStatus &&
                customer.accountStatus !== "active"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Customer account is not active."

                });

            }


            // -------------------------------------------------
            // GET WORKER
            // -------------------------------------------------

            const workerDoc =
                await db
                    .collection("users")
                    .doc(workerId)
                    .get();


            if (!workerDoc.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Worker not found."

                });

            }


            const worker =
                workerDoc.data();


            // -------------------------------------------------
            // CHECK WORKER ROLE
            // -------------------------------------------------

            if (
                worker.role !== "worker"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Selected user is not a worker."

                });

            }


            // -------------------------------------------------
            // CHECK WORKER STATUS
            // -------------------------------------------------

            if (
                worker.accountStatus !== "active"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Worker account is not active."

                });

            }


            // -------------------------------------------------
            // CHECK WORKER VERIFICATION
            // -------------------------------------------------

            if (
                worker.verificationStatus !== "verified"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Worker is not verified."

                });

            }

            // =====================================================
// CHECK FOR CONFLICTING BOOKING
// =====================================================

const existingBookings = await db
    .collection("bookings")
    .where("workerId", "==", workerId)
    .where("workDate", "==", workDate)
    .get();


const conflictingBooking =
    existingBookings.docs.find((doc) => {

        const booking = doc.data();

        return (
            booking.workTime === workTime &&
            (
                booking.status === "Pending" ||
                booking.status === "Accepted"
            )
        );

    });


if (conflictingBooking) {

    return res.status(409).json({

        success: false,

        message:
            "Worker is already booked for this date and time."

    });

}


            // -------------------------------------------------
            // CHECK WORKER AVAILABILITY
            // -------------------------------------------------

            if (
                worker.availability !== true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Worker is currently unavailable."

                });

            }


            // -------------------------------------------------
            // CREATE BOOKING
            // -------------------------------------------------

            const bookingRef =
                db
                    .collection("bookings")
                    .doc();


            const bookingData = {

                customerId:
                    customerId,

                customerName:
                    customer.name || "",


                workerId:
                    workerId,

                workerName:
                    worker.name || "",


                category:
                    worker.category || "",

                hourlyRate:
                    Number(
                        worker.hourlyRate || 0
                    ),


                workDate:
                    workDate,

                workTime:
                    workTime,

                workAddress:
                    workAddress,

                workDescription:
                    workDescription || "",


                status:
                    "Pending",


                createdAt:
                    new Date()

            };


            await bookingRef.set(
                bookingData
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Booking created successfully.",

                booking: {

                    id:
                        bookingRef.id,

                    ...bookingData

                }

            });


        } catch (error) {

            console.error(
                "Create booking error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to create booking."

            });

        }

    }
);

// =====================================================
// GET CUSTOMER BOOKINGS
// GET /api/bookings/customer
// =====================================================

router.get(
    "/customer",
    authenticate,
    async (req, res) => {

        try {

            const customerId = req.user.uid;

            const snapshot = await db
                .collection("bookings")
                .where("customerId", "==", customerId)
                .get();

            const bookings = [];

            snapshot.forEach((doc) => {

                bookings.push({
                    id: doc.id,
                    ...doc.data()
                });

            });

            res.json({
                success: true,
                count: bookings.length,
                bookings
            });

        } catch (error) {

            console.error(
                "Customer bookings error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Unable to load customer bookings."
            });

        }

    }
);


// =====================================================
// GET WORKER BOOKINGS
// GET /api/bookings/worker
// =====================================================

router.get(
    "/worker",
    authenticate,
    async (req, res) => {

        try {

            const workerId = req.user.uid;

            const snapshot = await db
                .collection("bookings")
                .where("workerId", "==", workerId)
                .get();

            const bookings = [];

            snapshot.forEach((doc) => {

                bookings.push({
                    id: doc.id,
                    ...doc.data()
                });

            });

            res.json({
                success: true,
                count: bookings.length,
                bookings
            });

        } catch (error) {

            console.error(
                "Worker bookings error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Unable to load worker bookings."
            });

        }

    }
);

// =====================================================
// UPDATE BOOKING STATUS
// PATCH /api/bookings/:bookingId
// =====================================================

router.patch(
    "/:bookingId",
    authenticate,
    async (req, res) => {

        try {

            const bookingId =
                req.params.bookingId;

            const requestedStatus =
                req.body.status;


            const allowedStatuses = [
                "Accepted",
                "Rejected",
                "Completed",
                "Cancelled"
            ];


            if (
                !allowedStatuses.includes(
                    requestedStatus
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking status."

                });

            }


            // =============================================
            // GET BOOKING
            // =============================================

            const bookingRef =
                db
                    .collection("bookings")
                    .doc(bookingId);

            const bookingSnap =
                await bookingRef.get();


            if (!bookingSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found."

                });

            }


            const booking =
                bookingSnap.data();


            const currentUserId =
                req.user.uid;


            // =============================================
            // CHECK WHO IS MAKING REQUEST
            // =============================================

            const userSnap =
                await db
                    .collection("users")
                    .doc(currentUserId)
                    .get();


            if (!userSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User profile not found."

                });

            }


            const user =
                userSnap.data();


            // =============================================
            // WORKER ACTIONS
            // =============================================

            if (
                currentUserId ===
                booking.workerId
            ) {

                if (
                    requestedStatus !== "Accepted" &&
                    requestedStatus !== "Rejected" &&
                    requestedStatus !== "Completed"
                ) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "Worker cannot perform this action."

                    });

                }


                // Worker can complete only accepted bookings

                if (
                    requestedStatus === "Completed" &&
                    booking.status !== "Accepted"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Only accepted bookings can be completed."

                    });

                }


                // Worker can accept/reject only pending bookings

                if (
                    (
                        requestedStatus === "Accepted" ||
                        requestedStatus === "Rejected"
                    )
                    &&
                    booking.status !== "Pending"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Only pending bookings can be accepted or rejected."

                    });

                }

            }


            // =============================================
            // CUSTOMER ACTIONS
            // =============================================

            else if (
                currentUserId ===
                booking.customerId
            ) {

                if (
                    requestedStatus !== "Cancelled"
                ) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "Customer can only cancel a booking."

                    });

                }


                if (
                    booking.status !== "Pending"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Only pending bookings can be cancelled."

                    });

                }

            }


            // =============================================
            // ADMIN
            // =============================================

            else if (
                user.role === "admin"
            ) {

                // Admin can update booking status.

            }


            // =============================================
            // UNAUTHORIZED USER
            // =============================================

            else {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not allowed to modify this booking."

                });

            }


            // =============================================
            // UPDATE BOOKING
            // =============================================

            const updateData = {

                status:
                    requestedStatus,

                updatedAt:
                    new Date()

            };


            if (
                requestedStatus === "Completed"
            ) {

                updateData.completedAt =
                    new Date();

                updateData.workerEarning =
                    Number(
                        booking.hourlyRate || 0
                    );

            }


            await bookingRef.update(
                updateData
            );


            res.json({

                success: true,

                message:
                    `Booking ${requestedStatus.toLowerCase()} successfully.`,

                bookingId:
                    bookingId,

                status:
                    requestedStatus

            });


        } catch (error) {

            console.error(
                "Booking status error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update booking."

            });

        }

    }
);

module.exports =
    router;