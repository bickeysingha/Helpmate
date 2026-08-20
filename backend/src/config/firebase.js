const {
    initializeApp,
    cert
} = require("firebase-admin/app");

const {
    getFirestore
} = require("firebase-admin/firestore");

const {
    getAuth
} = require("firebase-admin/auth");


// =====================================================
// FIREBASE ADMIN CONFIG
// =====================================================

const privateKey =
    process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(
            /\\n/g,
            "\n"
        )
        : undefined;


const serviceAccount = {

    projectId:
        process.env.FIREBASE_PROJECT_ID,

    clientEmail:
        process.env.FIREBASE_CLIENT_EMAIL,

    privateKey:
        privateKey

};


initializeApp({

    credential:
        cert(serviceAccount)

});


// =====================================================
// FIRESTORE
// =====================================================

const db =
    getFirestore();


// =====================================================
// FIREBASE AUTH
// =====================================================

const auth =
    getAuth();


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    db,
    auth

};