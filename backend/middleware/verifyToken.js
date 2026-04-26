import admin from '../config/firebaseAdmin.js';

/**
 * Middleware: verifyToken
 * Validates the Firebase ID token sent via the Authorization header.
 * Attaches the decoded token to req.user on success.
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    let idToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        idToken = authHeader.split('Bearer ')[1];
    } else if (req.query.token) {
        idToken = req.query.token;
    }

    if (!idToken) {
        console.warn(`[Auth] Missing bearer token for ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

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
