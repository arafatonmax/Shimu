
const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

// Accounts JSON file
const accountsFilePath = path.join(
    __dirname,
    "../data/accounts.json"
);

// POST Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }


        // Read accounts JSON
        const fileContent = await fs.readFile(
            accountsFilePath,
            "utf-8"
        );

        const jsonData = JSON.parse(fileContent);

        // Validate accounts structure
        if (!Array.isArray(jsonData.accounts)) {
            return res.status(500).json({
                success: false,
                message: "Invalid accounts data"
            });
        }

        const accounts = jsonData.accounts;

        // Find account
        const account = accounts.find(
            (item) => item.username === username
        );

        if (!account) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Check account status
        if (account.account_status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        // Verify password hash exists
        if (
            typeof account.password_hash !== "string" ||
            !account.password_hash
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
            password,
            account.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Verify JWT secret exists
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                account_id: account.account_id,
                linked_user_id: account.linked_user_id,
                role: account.role,
                managed_blocks: account.managed_blocks
            },
            jwtSecret,
            {
                expiresIn: "1h"
            }
        );


        // Login success
        res.json({
            success: true,
            message: "Login successful",
            token,
            account: {
                account_id: account.account_id,
                username: account.username,
                role: account.role,
                linked_user_id: account.linked_user_id,
                must_change_password: account.must_change_password
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


router.get("/me", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Authentication successful",
        account: req.user
    });
});

// test routes


router.get(
    "/admin-test",
    authenticateToken,
    requireRole("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Admin access granted",
            account: req.user
        });
    }
);

router.get(
    "/manager-test",
    authenticateToken,
    requireRole("manager"),
    (req, res) => {
        res.json({
            success: true,
            message: "Manager access granted",
            account: req.user
        });
    }
);

router.get(
    "/staff-test",
    authenticateToken,
    requireRole("admin", "manager"),
    (req, res) => {
        res.json({
            success: true,
            message: "Staff access granted",
            account: req.user
        });
    }
);

router.get(
    "/member-test",
    authenticateToken,
    requireRole("member"),
    (req, res) => {
        res.json({
            success: true,
            message: "Member access granted",
            account: req.user
        });
    }
);


module.exports = router;
