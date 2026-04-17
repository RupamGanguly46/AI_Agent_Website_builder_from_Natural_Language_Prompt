import { Router } from 'express';
import { handleSyncUser } from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

router.post('/sync', verifyToken, handleSyncUser);

export default router;
