import { Router } from 'express';
import {
    handleCreateProject,
    handleGetProjects,
    handleGetProject,
    handleGetCommits,
    handleGetFiles,
    handleGetFileContent,
    handleRevert,
    handleGetMessages,
    handleStartDevServer,
    handleStopDevServer,
    handleServerStatus,
    handleGetLogs,
    handleUpdateFileContent,
} from '../controllers/projectController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

// Apply Firebase token verification to all project routes
router.use(verifyToken);

// Project CRUD
router.get('/create', (req, res) => res.status(405).json({ error: "Method Not Allowed. To create a project, send a POST request." }));
router.post('/create', handleCreateProject);
router.get('/', handleGetProjects);
router.get('/:id', handleGetProject);

// Git operations
router.get('/:id/commits', handleGetCommits);
router.post('/revert', handleRevert);

// File operations
router.get('/:id/files', handleGetFiles);
router.get('/:id/files/*', handleGetFileContent);
router.put('/:id/files/*', handleUpdateFileContent);

// Conversations
router.get('/:id/messages', handleGetMessages);

// Dev server management
router.post('/:id/start', handleStartDevServer);
router.post('/:id/stop', handleStopDevServer);
router.get('/:id/server-status', handleServerStatus);
router.get('/:id/logs', handleGetLogs);

export default router;
