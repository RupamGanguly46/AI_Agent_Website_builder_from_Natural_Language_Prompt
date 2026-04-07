import { spawn, exec } from 'child_process';
import util from 'util';
import fs from 'fs-extra';
import path from 'path';
import { emitLog } from '../utils/logger.js';

const execPromise = util.promisify(exec);

// In-memory store of running dev servers
const servers = new Map();
let nextPort = 3100;

/**
 * Start a Vite dev server for a project
 */
export const startDevServer = async (projectId, projectPath) => {
    // If already running, return existing port
    if (servers.has(projectId)) {
        return { port: servers.get(projectId).port, alreadyRunning: true };
    }

    const port = nextPort++;

    try {
        const vitePath = path.join(projectPath, 'node_modules', 'vite');
        if (!(await fs.pathExists(vitePath))) {
            emitLog(projectId, 'dev-server', 'Running npm install...');
            // Run install
            await execPromise('npm install', { cwd: projectPath });
            emitLog(projectId, 'dev-server', 'npm install completed.');
        } else {
            console.log(`[DevServer ${projectId}] node_modules already exists, skipping npm install.`);
        }
    } catch (err) {
        emitLog(projectId, 'error', `npm install failed: ${err.message}`);
        throw new Error('Failed to install dependencies: ' + err.message);
    }

    // Start dev server with the assigned port
    const child = spawn('npm', ['run', 'dev', '--', '--port', port.toString(), '--host'], {
        cwd: projectPath,
        shell: true,
        stdio: 'pipe',
        env: { ...process.env, PORT: port.toString() },
    });

    let started = false;

    child.stdout.on('data', (data) => {
        const output = data.toString();
        emitLog(projectId, 'dev-server', output.trim());
        if (output.includes('Local:') || output.includes('ready in')) {
            started = true;
        }
    });

    child.stderr.on('data', (data) => {
        emitLog(projectId, 'dev-server', data.toString().trim());
    });

    child.on('close', (code) => {
        emitLog(projectId, 'dev-server', `Process exited with code ${code}`);
        servers.delete(projectId);
    });

    servers.set(projectId, { process: child, port });

    // Wait for server to start (max 15 seconds)
    await new Promise((resolve) => {
        const interval = setInterval(() => {
            if (started) {
                clearInterval(interval);
                resolve();
            }
        }, 500);

        setTimeout(() => {
            clearInterval(interval);
            resolve(); // Resolve anyway after timeout
        }, 15000);
    });

    return { port, alreadyRunning: false };
};

/**
 * Stop a running dev server
 */
export const stopDevServer = (projectId) => {
    const server = servers.get(projectId);
    if (server) {
        server.process.kill('SIGTERM');
        servers.delete(projectId);
        return true;
    }
    return false;
};

/**
 * Get status of a dev server
 */
export const getDevServerStatus = (projectId) => {
    const server = servers.get(projectId);
    if (server) {
        return { running: true, port: server.port };
    }
    return { running: false, port: null };
};
