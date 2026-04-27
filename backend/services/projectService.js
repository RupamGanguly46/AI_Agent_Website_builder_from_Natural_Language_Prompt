import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import Project from '../models/Project.js';
import Commit from '../models/Commit.js';
import { initRepo } from './gitService.js';
import { uploadProjectToCloud, downloadProjectFromCloud } from './storageService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');
// Azure Support: Mount external persistent volume if provided, fallback to local
const PROJECTS_DIR = process.env.AZURE_STORAGE_MOUNT_PATH || path.join(ROOT_DIR, 'projects');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const STORAGE_HEALTHCHECK_FILE = '.nirmana-storage-check.tmp';

export const verifyProjectsStorage = async () => {
    const configuredMount = process.env.AZURE_STORAGE_MOUNT_PATH;
    const usingAzureMount = Boolean(configuredMount);

    console.log(`[Storage] Projects dir resolved to: ${PROJECTS_DIR}`);
    if (usingAzureMount) {
        console.log(`[Storage] AZURE_STORAGE_MOUNT_PATH is set: ${configuredMount}`);
    } else {
        console.warn('[Storage] AZURE_STORAGE_MOUNT_PATH is not set. Using local ephemeral disk.');
    }

    try {
        await fs.ensureDir(PROJECTS_DIR);

        const probeFilePath = path.join(PROJECTS_DIR, STORAGE_HEALTHCHECK_FILE);
        await fs.writeFile(probeFilePath, `healthcheck:${Date.now()}`);
        await fs.remove(probeFilePath);

        console.log(`[Storage] Writable check passed for projects dir: ${PROJECTS_DIR}`);
        return true;
    } catch (error) {
        console.error(`[Storage] Writable check failed for projects dir "${PROJECTS_DIR}":`, error.message);
        return false;
    }
};

/**
 * Create a new project from a template
 */
export const createProject = async (name, framework = 'react', userId) => {
    const templatePath = path.join(TEMPLATES_DIR, `${framework}-template`);

    // Verify template exists
    if (!(await fs.pathExists(templatePath))) {
        throw new Error(`Template not found: ${framework}-template`);
    }

    // Create project directory and copy template
    const project = new Project({ name, framework, repoPath: '', userId });
    const projectId = project._id.toString();
    const repoPath = path.join(PROJECTS_DIR, projectId);

    await fs.ensureDir(repoPath);
    await fs.copy(templatePath, repoPath);

    // Initialize git repo
    const initialHash = await initRepo(repoPath);

    // Update project with repoPath and save
    project.repoPath = repoPath;
    await project.save();

    // Store initial commit record
    await Commit.create({
        projectId: project._id,
        commitHash: initialHash,
        prompt: 'Initial template setup',
    });

    // Seed the blank blueprint up to S3 in the background
    uploadProjectToCloud(project._id).catch((err) => {
        console.error(`[S3] Initial backup failed for project ${project._id}:`, err.message);
    });

    return {
        projectId: project._id,
        repoPath,
        commitHash: initialHash,
    };
};

/**
 * Get all projects for a specific user
 */
export const getAllProjects = async (userId) => {
    return Project.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Get a single project by ID
 */
export const getProject = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    // NATIVE EPHEMERAL DISK CHECK
    // If Render goes to sleep, MongoDB survives but the generated codebase folder vanishes!
    if (!(await fs.pathExists(project.repoPath))) {
        console.warn(`[Sync] Project ${projectId} missing from ephemeral disk. Initiating cloud rehydration...`);
        const restored = await downloadProjectFromCloud(projectId);
        if (!restored) {
            throw new Error('Critical failure: Repository lost and could not be restored from S3 cloud backup.');
        }
    }

    return project;
};

/**
 * Get the projects directory root
 */
export const getProjectsDir = () => PROJECTS_DIR;
