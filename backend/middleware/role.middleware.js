
function requireRole(...allowedRoles) {
    return (req, res, next) => {

        // Check authentication
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check authorization
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Permission granted
        next();
    };
}

module.exports = requireRole;
