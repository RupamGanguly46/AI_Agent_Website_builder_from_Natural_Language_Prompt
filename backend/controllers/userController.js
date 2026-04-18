import User from '../models/User.js';

export const handleSyncUser = async (req, res, next) => {
    try {
        const { email, name } = req.body;
        const firebaseUid = req.user.uid; // guaranteed by verifyToken middleware

        if (!email || !name) {
            return res.status(400).json({ error: 'Missing required user fields: email and name' });
        }

        // Upsert: find existing user or create a new profile
        let user = await User.findOne({ firebaseUid });

        if (!user) {
            user = await User.create({ firebaseUid, email, name });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};
