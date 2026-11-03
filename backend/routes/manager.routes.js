
const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const requireBlockAccess = require("../middleware/block.middleware");

const router = express.Router();

// Block A access test
router.get(
    "/block/A",
    authenticateToken,
    requireRole("admin", "manager"),
    requireBlockAccess("A"),
    (req, res) => {
        res.json({
            success: true,
            message: "Block A access granted",
            block: "A",
            account: req.user
        });
    }
);

// Block B access test
router.get(
    "/block/B",
    authenticateToken,
    requireRole("admin", "manager"),
    requireBlockAccess("B"),
    (req, res) => {
        res.json({
            success: true,
            message: "Block B access granted",
            block: "B",
            account: req.user
        });
    }
);

module.exports = router;
