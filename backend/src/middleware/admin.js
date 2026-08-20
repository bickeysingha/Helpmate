const { db } = require("../config/firebase");


// =====================================================
// ADMIN AUTHORIZATION MIDDLEWARE
// =====================================================

async function requireAdmin(req, res, next) {

    try {

        // -------------------------------------------------
        // CHECK AUTHENTICATION
        // -------------------------------------------------

        if (!req.user || !req.user.uid) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        // -------------------------------------------------
        // GET USER FROM FIRESTORE
        // -------------------------------------------------

        const userDoc =
            await db
                .collection("users")
                .doc(req.user.uid)
                .get();


        if (!userDoc.exists) {

            return res.status(404).json({

                success: false,

                message:
                    "User profile not found."

            });

        }


        const user =
            userDoc.data();


        // -------------------------------------------------
        // CHECK ADMIN ROLE
        // -------------------------------------------------

        if (user.role !== "admin") {

            return res.status(403).json({

                success: false,

                message:
                    "Admin access required."

            });

        }


        // -------------------------------------------------
        // STORE ADMIN DATA
        // -------------------------------------------------

        req.admin =
            user;


        // Continue

        next();


    } catch (error) {

        console.error(
            "Admin authorization error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to verify admin access."

        });

    }

}


module.exports =
    requireAdmin;