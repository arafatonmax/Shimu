
function requireBlockAccess(blockId) {

    return (req, res, next) => {

        // Authentication check
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Admin has access to every block
        if (req.user.role === "admin") {
            return next();
        }

        // Only managers can access this middleware
        if (req.user.role !== "manager") {
            return res.status(403).json({
                success: false,
                message: "Manager access required"
            });
        }

        // Check assigned blocks
        const managedBlocks = req.user.managed_blocks;

        if (!Array.isArray(managedBlocks)) {
            return res.status(403).json({
                success: false,
                message: "Invalid block permissions"
            });
        }

        // Check requested block
        if (!managedBlocks.includes(blockId)) {
            return res.status(403).json({
                success: false,
                message: "You cannot manage this block"
            });
        }

        // Permission granted
        next();
    };
}

module.exports = requireBlockAccess;
