import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import Project from '../models/Project.js';
import Commit from '../models/Commit.js';
import { initRepo } from './gitService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');

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
    return project;
};

/**
 * Get the projects directory root
 */
export const getProjectsDir = () => PROJECTS_DIR;
