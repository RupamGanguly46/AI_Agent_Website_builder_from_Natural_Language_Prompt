import User from '../models/User.js';

export const handleSyncUser = async (req, res, next) => {
    try {
        const { email, name } = req.body;
        const firebaseUid = req.user.uid; // guaranteed by verifyToken middleware

        if (!email || !name) {
            console.warn(`[UserController:handleSyncUser] Missing fields for firebaseUid ${firebaseUid}`);
            return res.status(400).json({ error: 'Missing required user fields: email and name' });
        }

        // Upsert: atomical find existing user or create a new profile
        const user = await User.findOneAndUpdate(
            { firebaseUid },
            { $set: { firebaseUid, email, name } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(`[UserController:handleSyncUser] ${req.method} ${req.originalUrl} failed:`, error.message);
        next(error);
    }
};
