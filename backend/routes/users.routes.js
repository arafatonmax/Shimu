
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();

// JSON file location
const usersFilePath = path.join(
    __dirname,
    "../data/users.json"
);

// GET all public user information
router.get("/", async (req, res) => {
    try {
        // Read JSON file
        const fileContent = await fs.readFile(
            usersFilePath,
            "utf-8"
        );

        // Convert JSON text into JavaScript data
        const jsonData = JSON.parse(fileContent);
        const users = jsonData.users;

        // Check whether data is an array
        if (!Array.isArray(users)) {
            return res.status(500).json({
                success: false,
                message: "Invalid users data format. Error 1"
            });
        }

        // Return only publicly permitted information
        const publicUsers = users
            .filter(user =>
                user.hostel_info?.membership_status === "active"
            )
            .map(user => {
                const publicInfo = user.public_info || {};

                return {
                    user_id: user.user_id,
                    full_name: publicInfo.show_name
                        ? user.personal_info?.full_name
                        : undefined,
                    block: publicInfo.show_block
                        ? user.hostel_info?.block
                        : undefined,
                    room: publicInfo.show_room
                        ? user.hostel_info?.room
                        : undefined
                };
            });

        // Send response
        res.json({
            success: true,
            count: publicUsers.length,
            data: publicUsers
        });

    } catch (error) {
        console.error("Users API Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to read users data. Error 2"
        });
    }
});

// GET a single user by ID
router.get("/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        const fileContent = await fs.readFile(
            usersFilePath,
            "utf-8"
        );

        const jsonData = JSON.parse(fileContent);
        const users = jsonData.users;

        const user = users.find(
            item => item.user_id === userId
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (user.hostel_info.membership_status !== "active") {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            data: {
                user_id: user.user_id,
                full_name: user.personal_info.full_name,
                block: user.hostel_info.block,
                room: user.hostel_info.room
            }
        });

    } catch (error) {
        console.error("Single User API Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve user."
        });
    }
});

// POST - Add a new student
router.post("/", async (req, res) => {

    // curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{
    //   "user_id": "005",
    //   "full_name": "MD Akash",
    //   "phone": "01581415867",
    //   "block": "B",
    //   "room": "03",
    //   "monthly_rent": 600,
    //   "join_date": "2026-10-02"
    // }'


    try {
        const {
            user_id,
            full_name,
            phone,
            block,
            room,
            monthly_rent,
            join_date
        } = req.body;

        // Basic validation
        if (
            !user_id ||
            !full_name ||
            !block ||
            !room ||
            !join_date ||
            monthly_rent === undefined ||
            !Number.isFinite(monthly_rent) ||
            monthly_rent <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid student information."
            });
        }

        // Read existing JSON data
        const fileContent = await fs.readFile(
            usersFilePath,
            "utf-8"
        );

        const jsonData = JSON.parse(fileContent);

        if (!Array.isArray(jsonData.users)) {
            return res.status(500).json({
                success: false,
                message: "Invalid users data format."
            });
        }

        // Check duplicate ID
        const existingUser = jsonData.users.find(
            user => user.user_id === user_id
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User ID already exists."
            });
        }

        // Create new student
        const newUser = {
            user_id,
            personal_info: {
                full_name,
                phone: phone || null,
                emergency_contact: null,
                nid: null,
                date_of_birth: null
            },
            hostel_info: {
                block,
                room,
                monthly_rent,
                join_date,
                leave_date: null,
                membership_status: "active"
            },
            public_info: {
                show_name: true,
                show_phone: false,
                show_block: true,
                show_room: true
            }
        };

        // Add student to array
        jsonData.users.push(newUser);

        // Save updated JSON file
        await fs.writeFile(
            usersFilePath,
            JSON.stringify(jsonData, null, 2),
            "utf-8"
        );

        res.status(201).json({
            success: true,
            message: "Student added successfully.",
            data: {
                user_id: newUser.user_id,
                full_name: newUser.personal_info.full_name
            }
        });

    } catch (error) {
        console.error("Add Student API Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to add student."
        });
    }
});


 // PUT - Update an existing student's hostel information
router.put("/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        const {
            block,
            room,
            monthly_rent
        } = req.body;

        // Basic validation
        if (
            !["A", "B"].includes(block) ||
            typeof room !== "string" ||
            room.trim() === "" ||
            !Number.isFinite(monthly_rent) ||
            monthly_rent <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid hostel information."
            });
        }

        // Read existing JSON data
        const fileContent = await fs.readFile(
            usersFilePath,
            "utf-8"
        );

        const jsonData = JSON.parse(fileContent);
        const users = jsonData.users;

        // Check data format
        if (!Array.isArray(users)) {
            return res.status(500).json({
                success: false,
                message: "Invalid users data format."
            });
        }

        // Find student
        const user = users.find(
            item => item.user_id === userId
        );

        // Check student existence
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Update hostel information
        user.hostel_info.block = block;
        user.hostel_info.room = room.trim();
        user.hostel_info.monthly_rent = monthly_rent;

        // Save updated JSON
        await fs.writeFile(
            usersFilePath,
            JSON.stringify(jsonData, null, 2),
            "utf-8"
        );

        // Send response
        res.json({
            success: true,
            message: "Student information updated successfully.",
            data: {
                user_id: user.user_id,
                block: user.hostel_info.block,
                room: user.hostel_info.room,
                monthly_rent: user.hostel_info.monthly_rent
            }
        });

    } catch (error) {
        console.error("Update Student API Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update student information."
        });
    }
});


module.exports = router;
