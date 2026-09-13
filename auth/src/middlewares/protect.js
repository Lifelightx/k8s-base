const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
    let token = req.cookies && req.cookies.token; // Try getting from cookie first

    // Fallback to Authorization header for testing or other clients
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRETE);
        // Attach user (without password) to request
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = protect;
