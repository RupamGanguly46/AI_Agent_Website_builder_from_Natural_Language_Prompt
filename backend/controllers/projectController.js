import { getProject, getAllProjects, createProject } from '../services/projectService.js';
import { getCommits, revertToCommit, commitChanges } from '../services/gitService.js';
import { uploadProjectToCloud } from '../services/storageService.js';
import mongoose from 'mongoose';
import { listFiles, readFileContent, writeFiles } from '../utils/fileUtils.js';
import { startDevServer, stopDevServer, getDevServerStatus } from '../services/devServerService.js';
import Commit from '../models/Commit.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { logEmitter, getLogBuffer, emitLog } from '../utils/logger.js';

/**
 * POST /projects/create
 */
export const handleCreateProject = async (req, res, next) => {
    try {
        const { name, framework } = req.body;
        const firebaseUid = req.user.uid; // set by verifyToken middleware

        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found in database. Please sync.' });
        }

        const result = await createProject(name, framework, user._id);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /projects
 */
export const handleGetProjects = async (req, res, next) => {
    try {
        const firebaseUid = req.user.uid; // set by verifyToken middleware

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found in database.' });
        }

        const projects = await getAllProjects(user._id);
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /projects/:id
 */
export const handleGetProject = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid project ID format.' });
        }
        
        const project = await getProject(req.params.id);
        res.json(project);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /projects/:id/commits
 */
export const handleGetCommits = async (req, res, next) => {
    try {
        const project = await getProject(req.params.id);
        const gitCommits = await getCommits(project.repoPath);

        // Enrich with stored prompts
        const dbCommits = await Commit.find({ projectId: project._id }).sort({ createdAt: -1 });
        const promptMap = {};
        dbCommits.forEach((c) => {
            promptMap[c.commitHash] = c.prompt;
        });

        const enriched = gitCommits.map((gc) => ({
            ...gc,
            prompt: promptMap[gc.commitHash] || gc.message,
        }));

        res.json(enriched);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /projects/:id/files
 */
export const handleGetFiles = async (req, res, next) => {
    try {
        const project = await getProject(req.params.id);
        const files = await listFiles(project.repoPath);
        res.json(files);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /projects/:id/files/*
 */
export const handleGetFileContent = async (req, res, next) => {
    try {
        const project = await getProject(req.params.id);
        const filePath = req.params[0]; // wildcard param
        const content = await readFileContent(project.repoPath, filePath);

        if (content === null) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.json({ path: filePath, content });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /projects/:id/files/*
 */
export const handleUpdateFileContent = async (req, res, next) => {
    try {
        const project = await getProject(req.params.id);
        const filePath = req.params[0]; // wildcard param
        const { content } = req.body;
        
        await writeFiles(project.repoPath, [{ path: filePath, content }]);
        
        // Log to SSE stream so Frontend instantly triggers a refresh via our auto-sync logic
        emitLog(project._id.toString(), 'info', `Committing manual edits to ${filePath}...`);


        // Generate the Git commit dynamically
        const commitHash = await commitChanges(project.repoPath, `Manual edit: ${filePath}`);

        // Persist to MongoDB for history UI rendering
        await Commit.create({
            projectId: project._id,
            commitHash,
            prompt: `Manual Code Edit`,
        });

        await Message.create({
            projectId: project._id,
            commitHash,
            role: 'assistant',
            content: `✏️ Manually edited \`${filePath}\` utilizing the onboard code editor. Changes committed instantly.`
        });

        // Backup this newly mutated local snapshot up to Firebase!
        await uploadProjectToCloud(project._id);

        res.json({ success: true, path: filePath, commitHash });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /projects/revert
 */
export const handleRevert = async (req, res, next) => {
    try {
        const { projectId, commitHash } = req.body;

        if (!projectId || !commitHash) {
            return res.status(400).json({ error: 'projectId and commitHash are required' });
        }

        const project = await getProject(projectId);
        await revertToCommit(project.repoPath, commitHash);

        // Fetch surviving Git commits after the hard reset
        const activeGitLog = await getCommits(project.repoPath);
        const survivingHashes = activeGitLog.map(c => c.commitHash);

        // Purge orphaned Mongo records that no longer exist in the Git tree
        await Commit.deleteMany({
            projectId: project._id,
            commitHash: { $nin: survivingHashes }
        });

        // Add an automatic system message representing the reversion in the conversation history!
        await Message.create({
            projectId: project._id,
            commitHash: commitHash,
            role: 'assistant',
            content: `🔄 Successfully reverted the project workspace to earlier checkpoint (\`${commitHash.substring(0, 6)}\`). All future generations will branch from this state.`
        });

        // Backup this newly reversed local snapshot codebase up to Firebase!
        await uploadProjectToCloud(project._id);

        // Load all historical messages to preserve conversation memory
        const messages = await Message.find({
            projectId: project._id
        }).sort({ createdAt: 1 });

        res.json({
            success: true,
            commitHash,
            messages,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /projects/:id/messages
 */
export const handleGetMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ projectId: req.params.id }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /projects/:id/start
 */
export const handleStartDevServer = async (req, res, next) => {
    try {
        const project = await getProject(req.params.id);
        const result = await startDevServer(req.params.id, project.repoPath);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /projects/:id/stop
 */
export const handleStopDevServer = async (req, res, next) => {
    try {
        const stopped = stopDevServer(req.params.id);
        res.json({ stopped });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /projects/:id/server-status
 */
export const handleServerStatus = async (req, res, next) => {
    try {
        const status = getDevServerStatus(req.params.id);
        res.json(status);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /projects/:id/logs
 * Server-Sent Events (SSE) endpoint for terminal logs
 */
export const handleGetLogs = (req, res) => {
    const { id: projectId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Establish connection immediately

    // Send buffered logs immediately
    const pastLogs = getLogBuffer(projectId);
    for (const log of pastLogs) {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
    }

    const listener = (log) => {
        if (log.projectId === projectId || log.projectId === 'system') {
            res.write(`data: ${JSON.stringify(log)}\n\n`);
        }
    };

    logEmitter.on('log', listener);

    req.on('close', () => {
        logEmitter.off('log', listener);
    });
};
