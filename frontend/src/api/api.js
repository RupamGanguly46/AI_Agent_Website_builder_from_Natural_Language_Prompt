import axios from 'axios';
import { auth } from '../firebase/firebaseConfig';

// Set this to your Azure App Service URL once deployed e.g., 'https://ai-builder-api-123.azurewebsites.net'
// If you configure Vite environment variables in Azure Static Web Apps, VITE_API_BASE_URL will take precedence.
const AZURE_CLOUD_BUILD_URL = import.meta.env.PROD ? 'https://nirmana-server.azurewebsites.net' : 'http://127.0.0.1:5001';
const API_BASE = import.meta.env.VITE_API_BASE_URL || AZURE_CLOUD_BUILD_URL;
export const SERVER_URL = API_BASE;

const api = axios.create({
    baseURL: API_BASE,
    timeout: 300000, // 5 minute timeout for long LangGraph processes
    headers: { 'Content-Type': 'application/json' },
});

// Attach a fresh Firebase ID token to every request as a Bearer token
api.interceptors.request.use(async (config) => {
    if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        config.headers['Authorization'] = `Bearer ${idToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ─── Projects ────────────────────────────────────────

export const createProject = (name, framework = 'react') =>
    api.post('/projects/create', { name, framework });

export const getProjects = () =>
    api.get('/projects');

export const getProject = (id) =>
    api.get(`/projects/${id}`);

// ─── Git ─────────────────────────────────────────────

export const getCommits = (projectId) =>
    api.get(`/projects/${projectId}/commits`);

export const revertToCommit = (projectId, commitHash) =>
    api.post('/projects/revert', { projectId, commitHash });

// ─── Files ───────────────────────────────────────────

export const getFiles = (projectId) =>
    api.get(`/projects/${projectId}/files`);

export const getFileContent = (projectId, filePath) =>
    api.get(`/projects/${projectId}/files/${filePath}`);

export const updateFileContent = (projectId, filePath, content) =>
    api.put(`/projects/${projectId}/files/${filePath}`, { content });

// ─── Messages ────────────────────────────────────────

export const getMessages = (projectId) =>
    api.get(`/projects/${projectId}/messages`);

// ─── AI ──────────────────────────────────────────────

export const sendPrompt = (projectId, prompt) =>
    api.post('/ai/prompt', { projectId, prompt });

// ─── Dev Server ──────────────────────────────────────

export const startDevServer = (projectId) =>
    api.post(`/projects/${projectId}/start`);

export const stopDevServer = (projectId) =>
    api.post(`/projects/${projectId}/stop`);

export const getServerStatus = (projectId) =>
    api.get(`/projects/${projectId}/server-status`);

export default api;
