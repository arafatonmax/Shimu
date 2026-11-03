
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    try {
        // Read Authorization header
        const authHeader = req.headers.authorization;

        // Check Bearer token
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required"
            });
        }

        // Check JWT secret
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);

        // Attach account information
        req.user = {
            account_id: decoded.account_id,
            linked_user_id: decoded.linked_user_id,
            role: decoded.role,
            managed_blocks: decoded.managed_blocks
        };

        // Continue to next middleware or route
        next();

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication error"
        });
    }
}

module.exports = authenticateToken;
