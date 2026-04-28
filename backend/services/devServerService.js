import { spawn, exec } from 'child_process';
import util from 'util';
import fs from 'fs-extra';
import path from 'path';
import net from 'net';
import http from 'http';
import { emitLog } from '../utils/logger.js';

const execPromise = util.promisify(exec);

// In-memory store of running dev servers
const servers = new Map();

/**
 * Check if a port is available
 */
const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
};

/**
 * Find an available port starting from a base
 */
const findAvailablePort = async (startPort) => {
    let port = startPort;
    while (!(await isPortAvailable(port))) {
        port++;
        if (port > startPort + 1000) throw new Error('No available ports found in range 3100-4100');
    }
    return port;
};

/**
 * Start a Vite dev server for a project
 */
export const startDevServer = async (projectId, projectPath) => {
    // If already running, return existing port
    if (servers.has(projectId)) {
        return { port: servers.get(projectId).port, alreadyRunning: true };
    }

    // Find a fresh available port to avoid "Port Busy" errors
    const port = await findAvailablePort(3100);

    try {
        const vitePath = path.join(projectPath, 'node_modules', 'vite');
        if (!(await fs.pathExists(vitePath))) {
            emitLog(projectId, 'dev-server', 'Running npm install...');
            // Run install - ensuring dev dependencies (like vite) are included
            await execPromise('npm install --include=dev', { cwd: projectPath });
            emitLog(projectId, 'dev-server', 'npm install completed.');
        }
    } catch (err) {
        emitLog(projectId, 'error', `npm install failed: ${err.message}`);
        throw new Error('Failed to install dependencies: ' + err.message);
    }

    // Start dev server with the assigned port and proper base path
    const basePath = `/projects/${projectId}/proxy/`;
    const child = spawn('npm', ['run', 'dev', '--', '--port', port.toString(), '--host', '--base', basePath], {
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
            resolve();
        }, 15000);
    });

    return { port, alreadyRunning: false };
};

/**
 * Proxy a request to a project's dev server
 */
export const proxyProjectRequest = (projectId, req, res) => {
    const server = servers.get(projectId);
    if (!server) {
        return res.status(404).send('Dev server not running for this project. Please start it first.');
    }

    const { port } = server;
    // Forward the exact original URL since Vite is now aware of the base path
    const targetPath = req.originalUrl;

    const options = {
        hostname: '127.0.0.1',
        port: port,
        path: targetPath,
        method: req.method,
        headers: { ...req.headers }
    };

    // Robust sanitization to make the request look truly local to Vite
    options.headers.host = `127.0.0.1:${port}`;
    delete options.headers.connection;
    delete options.headers.origin;
    delete options.headers.referer;
    delete options.headers['x-forwarded-for'];
    delete options.headers['x-forwarded-proto'];
    delete options.headers['x-forwarded-host'];

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error(`[Proxy Error] ${projectId} -> ${targetPath}: ${err.message}`);
        emitLog(projectId, 'error', `Proxy error: ${err.message}`);
        if (!res.headersSent) {
            res.status(502).send('Error connecting to dev server: ' + err.message);
        }
    });

    // Set a timeout for the proxy request
    proxyReq.setTimeout(10000, () => {
        proxyReq.destroy();
        if (!res.headersSent) {
            res.status(504).send('Dev server timeout');
        }
    });

    req.pipe(proxyReq, { end: true });
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
