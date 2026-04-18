import admin from '../config/firebaseAdmin.js';

/**
 * Middleware: verifyToken
 * Validates the Firebase ID token sent via the Authorization header.
 * Attaches the decoded token to req.user on success.
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // contains .uid, .email, .name, etc.
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};

export default verifyToken;
