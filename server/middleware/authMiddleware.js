const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token or invalid token format, authorization denied"});

    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "DEV_SECRET"
        );

        req.user = decoded;

        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid or has expired. "});
    }
}

module.exports = authMiddleware;
