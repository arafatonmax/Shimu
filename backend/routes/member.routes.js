
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const authenticateToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

// JSON file location
const usersFilePath = path.join(
    __dirname,
    "../data/users.json"
);


// GET logged-in member's own profile
router.get(
    "/profile",
    authenticateToken,
    requireRole("member"),
    async (req, res) => {

        try {

            const fileContent = await fs.readFile(
                usersFilePath,
                "utf8"
            );

            const jsonData = JSON.parse(fileContent);

            const user = jsonData.users.find(
                (item) =>
                    item.user_id === req.user.linked_user_id
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Resident profile not found"
                });
            }

            res.json({
                success: true,
                message: "Profile retrieved successfully",
                user
            });

        } catch (error) {

            console.error("Member profile error:", error);

            res.status(500).json({
                success: false,
                message: "Failed to retrieve profile"
            });
        }
    }
);


// GET resident information by user ID

router.get(
    "/profile",
    authenticateToken,
    requireRole("member"),
    async (req, res) => {
        try {
            const fileContent = await fs.readFile(
                usersFilePath,
                "utf8"
            );

            const jsonData = JSON.parse(fileContent);

            const user = jsonData.users.find(
                item =>
                    item.user_id === req.user.linked_user_id
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Resident profile not found"
                });
            }

            const membershipStatus =
                user.hostel_info.membership_status;

            if (
                membershipStatus !== "active" &&
                membershipStatus !== "ex_member"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Membership access denied"
                });
            }

            res.json({
                success: true,
                message: "Profile retrieved successfully",
                membership_status: membershipStatus,
                read_only: membershipStatus === "ex_member",
                user
            });

        } catch (error) {
            console.error(
                "Member profile error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to retrieve profile"
            });
        }
    }
);



module.exports = router;
