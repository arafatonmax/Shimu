
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const usersRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);

// Server Port
const PORT = process.env.PORT || 5000;

// Basic Route
app.get("/", (req, res) => {
    res.send("Welcome to Shimu Hostel API!");
});

// Health Check Route
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Shimu Hostel Server is running!",
        status: "OK"
    });
});

// Start Server
app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log(" Shimu Hostel Backend");
    console.log("--------------------------------");
    console.log(` Server running at http://localhost:${PORT}`);
    console.log(" Status: ONLINE");
});
