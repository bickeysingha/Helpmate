const {
    auth
} = require("../config/firebase");


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

async function authenticate(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        // -------------------------------------------------
        // CHECK AUTHORIZATION HEADER
        // -------------------------------------------------

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message:
                    "Authorization token is required."

            });

        }


        // Expected:
        // Authorization: Bearer <token>

        const parts =
            authHeader.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authorization format."

            });

        }


        const token =
            parts[1];


        // -------------------------------------------------
        // VERIFY FIREBASE TOKEN
        // -------------------------------------------------

        const decodedToken =
            await auth.verifyIdToken(token);


        // -------------------------------------------------
        // STORE USER INFORMATION
        // -------------------------------------------------

        req.user = decodedToken;


        // Continue to API route

        next();


    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );


        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired authentication token."

        });

    }

}


module.exports =
    authenticate;