const express = require("express");

const {
    db,
    auth
} = require("../config/firebase");

const authenticate =
    require("../middleware/auth");

const requireAdmin =
    require("../middleware/admin");


const router =
    express.Router();


// =====================================================
// ALL ADMIN ROUTES
// =====================================================
//
// Every request to /api/admin/... must:
// 1. Be authenticated
// 2. Belong to an admin
//
// =====================================================

router.use(authenticate);
router.use(requireAdmin);


// =====================================================
// GET ALL USERS
//
// GET /api/admin/users
// =====================================================

router.get(
    "/users",
    async (req, res) => {

        try {

            const snapshot =
                await db
                    .collection("users")
                    .get();


            const users = [];


            snapshot.forEach((doc) => {

                const user =
                    doc.data();


                // Remove sensitive information

                const {
                    aadhaarNumber,
                    panNumber,
                    password,
                    ...safeUser
                } = user;


                users.push({

                    id:
                        doc.id,

                    ...safeUser

                });

            });


            res.json({

                success: true,

                count:
                    users.length,

                users:
                    users

            });


        } catch (error) {

            console.error(
                "Get users error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load users."

            });

        }

    }
);


// =====================================================
// APPROVE USER
//
// PATCH /api/admin/users/:id/approve
// =====================================================

router.patch(
    "/users/:id/approve",
    async (req, res) => {

        try {

            const userId =
                req.params.id;


            const userRef =
                db
                    .collection("users")
                    .doc(userId);


            const userSnap =
                await userRef.get();


            if (!userSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            await userRef.update({

                accountStatus:
                    "active",

                updatedAt:
                    new Date()

            });


            res.json({

                success: true,

                message:
                    "User approved successfully."

            });


        } catch (error) {

            console.error(
                "Approve user error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to approve user."

            });

        }

    }
);


// =====================================================
// REJECT USER
//
// PATCH /api/admin/users/:id/reject
// =====================================================

router.patch(
    "/users/:id/reject",
    async (req, res) => {

        try {

            const userId =
                req.params.id;


            const userRef =
                db
                    .collection("users")
                    .doc(userId);


            const userSnap =
                await userRef.get();


            if (!userSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            await userRef.update({

                accountStatus:
                    "rejected",

                updatedAt:
                    new Date()

            });


            res.json({

                success: true,

                message:
                    "User rejected successfully."

            });


        } catch (error) {

            console.error(
                "Reject user error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to reject user."

            });

        }

    }
);


// =====================================================
// SUSPEND USER
//
// PATCH /api/admin/users/:id/suspend
// =====================================================

router.patch(
    "/users/:id/suspend",
    async (req, res) => {

        try {

            const userId =
                req.params.id;


            const userRef =
                db
                    .collection("users")
                    .doc(userId);


            const userSnap =
                await userRef.get();


            if (!userSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            const user =
                userSnap.data();


            // Don't allow admin to suspend themselves

            if (
                user.uid === req.user.uid
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "You cannot suspend your own admin account."

                });

            }


            await userRef.update({

                accountStatus:
                    "suspended",

                updatedAt:
                    new Date()

            });


            res.json({

                success: true,

                message:
                    "User suspended successfully."

            });


        } catch (error) {

            console.error(
                "Suspend user error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to suspend user."

            });

        }

    }
);


// =====================================================
// REACTIVATE USER
//
// PATCH /api/admin/users/:id/reactivate
// =====================================================

router.patch(
    "/users/:id/reactivate",
    async (req, res) => {

        try {

            const userId =
                req.params.id;


            const userRef =
                db
                    .collection("users")
                    .doc(userId);


            const userSnap =
                await userRef.get();


            if (!userSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            await userRef.update({

                accountStatus:
                    "active",

                updatedAt:
                    new Date()

            });


            res.json({

                success: true,

                message:
                    "User reactivated successfully."

            });


        } catch (error) {

            console.error(
                "Reactivate user error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to reactivate user."

            });

        }

    }
);


// =====================================================
// VERIFY / REJECT WORKER
//
// PATCH /api/admin/workers/:id/verify
// =====================================================

router.patch(
    "/workers/:id/verify",
    async (req, res) => {

        try {

            const workerId =
                req.params.id;


            const workerRef =
                db
                    .collection("users")
                    .doc(workerId);


            const workerSnap =
                await workerRef.get();


            if (!workerSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Worker not found."

                });

            }


            const worker =
                workerSnap.data();


            // Make sure this is actually a worker

            if (
                worker.role !== "worker"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Selected user is not a worker."

                });

            }


            const {
                verificationStatus
            } = req.body;


            const allowedStatuses = [

                "pending",

                "verified",

                "rejected"

            ];


            if (
                !allowedStatuses.includes(
                    verificationStatus
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid verification status."

                });

            }


            await workerRef.update({

                verificationStatus:
                    verificationStatus,

                updatedAt:
                    new Date()

            });


            res.json({

                success: true,

                message:
                    `Worker verification status changed to ${verificationStatus}.`

            });


        } catch (error) {

            console.error(
                "Worker verification error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update worker verification."

            });

        }

    }
);


// =====================================================
// DELETE USER
//
// DELETE /api/admin/users/:id
// =====================================================

router.delete(
    "/users/:id",
    async (req, res) => {

        try {

            const userId =
                req.params.id;


            const userRef =
                db
                    .collection("users")
                    .doc(userId);


            const userSnap =
                await userRef.get();


            if (!userSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            const user =
                userSnap.data();


            // Don't allow admin to delete themselves

            if (
                user.uid === req.user.uid
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "You cannot delete your own admin account."

                });

            }


            // Delete Firestore profile

            await userRef.delete();


            // Delete Firebase Authentication account

            if (user.uid) {

                try {

                    await auth.deleteUser(
                        user.uid
                    );

                } catch (authError) {

                    console.error(
                        "Firebase Auth deletion error:",
                        authError
                    );

                    // Firestore profile is already deleted.
                    // Return success for the profile deletion,
                    // but tell the admin about the Auth issue.

                    return res.status(500).json({

                        success: false,

                        message:
                            "Firestore profile deleted, but Firebase Authentication account could not be deleted."

                    });

                }

            }


            res.json({

                success: true,

                message:
                    "User deleted successfully."

            });


        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete user."

            });

        }

    }
);


module.exports =
    router;