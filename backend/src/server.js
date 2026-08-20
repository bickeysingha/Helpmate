require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const workersRoutes =
    require("./routes/workers");

const bookingRoutes =
    require("./routes/bookings");

const adminRoutes =
    require("./routes/admin");

app.use(cors());
app.use(express.json());

require("./config/firebase");

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "HelpMate backend is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "HelpMate API",
        status: "healthy"
    });
});



app.use(
    "/api/workers",
    workersRoutes
);

app.use(
    "/api/bookings",
    bookingRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `HelpMate backend running on port ${PORT}`
    );
});