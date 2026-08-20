const express = require("express");

const {
    db
} = require("../config/firebase");

const {
    collection,
    getDocs
} = require("firebase-admin/firestore");


const router =
    express.Router();


// =====================================================
// GET WORKERS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const category =
            req.query.category;


        const workersSnapshot =
            await db
                .collection("users")
                .get();


        const workers = [];


        workersSnapshot.forEach((doc) => {

            const user =
                doc.data();


            // =============================================
            // WORKER FILTER
            // =============================================

            if (
                user.role !== "worker"
            ) {
                return;
            }


            if (
                user.accountStatus !== "active"
            ) {
                return;
            }


            if (
                user.verificationStatus !== "verified"
            ) {
                return;
            }


            if (
                user.availability !== true
            ) {
                return;
            }


            // =============================================
            // CATEGORY FILTER
            // =============================================

            if (
                category &&
                user.category !== category
            ) {
                return;
            }


            // =============================================
            // RESPONSE
            // =============================================

            workers.push({

                id: doc.id,

                name:
                    user.name || "",

                email:
                    user.email || "",

                phone:
                    user.phone || "",

                city:
                    user.city || "",

                category:
                    user.category || "",

                experience:
                    user.experience || 0,

                hourlyRate:
                    user.hourlyRate || 0,

                rating:
                    user.rating || 0,

                jobsCompleted:
                    user.jobsCompleted || 0,

                description:
                    user.description || "",

                availability:
                    user.availability === true

            });

        });


        res.json({

            success: true,

            count:
                workers.length,

            workers:
                workers

        });


    } catch (error) {

        console.error(
            "Worker API error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to load workers."

        });

    }

});


module.exports =
    router;