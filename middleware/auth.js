import jwt from 'jsonwebtoken'; // Make sure to import jwt if you're using it

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
    const { role } = req.user;
    if (role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Middleware to authenticate users
export const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, 'secretKey'); // Ensure 'secretKey' is securely managed
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
export default { isAdmin, authenticate };