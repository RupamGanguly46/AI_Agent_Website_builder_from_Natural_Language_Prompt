import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import verifyToken from '../middleware/verifyToken.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const router = express.Router();

// Helper: Calculate SHA1 hash of a file
const sha1 = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha1');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
};

// Helper: Build file map for Netlify deploy
const buildFileMap = (dist) => {
    const files = {};
    const walkSync = (dir, filelist = []) => {
        const _files = fs.readdirSync(dir);
        for (const file of _files) {
            const filepath = path.join(dir, file);
            if (fs.statSync(filepath).isDirectory()) {
                filelist = walkSync(filepath, filelist);
            } else {
                filelist.push(filepath);
            }
        }
        return filelist;
    };

    const allFiles = walkSync(dist);
    for (const full of allFiles) {
        let rel = path.relative(dist, full).replace(/\\/g, '/');
        if (!rel.startsWith('/')) rel = '/' + rel;
        files[rel] = sha1(full);
    }
    return files;
};

// Ensure redirects file exists (for React Router)
const ensureRedirects = (dist) => {
    const redirectPath = path.join(dist, '_redirects');
    if (!fs.existsSync(redirectPath)) {
        fs.writeFileSync(redirectPath, '/*    /index.html   200\n');
    }
};

// Route: Get Auth URL
// Expects redirectUri from query so frontend can supply its dynamic origin
router.get('/auth', (req, res) => {
    const { redirectUri } = req.query;
    if (!redirectUri) return res.status(400).json({ error: 'redirectUri is required' });
    
    const authUrl = `https://app.netlify.com/authorize?client_id=${process.env.NETLIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.json({ url: authUrl });
});

// Route: Handle Callback
router.post('/callback', verifyToken, async (req, res) => {
    const { code, redirectUri } = req.body;
    if (!code || !redirectUri) return res.status(400).json({ error: 'code and redirectUri are required' });

    try {
        const response = await fetch('https://api.netlify.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: process.env.NETLIFY_CLIENT_ID,
                client_secret: process.env.NETLIFY_CLIENT_SECRET,
                code,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Netlify OAuth Error:', data);
            return res.status(400).json({ error: 'Failed to authenticate with Netlify' });
        }

        // Save token to user
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.netlifyToken = data.access_token;
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route: Deploy Project
router.post('/deploy/:projectId', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = user.netlifyToken;
        if (!token) return res.status(401).json({ error: 'Not authenticated with Netlify' });

        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.userId.toString() !== user._id.toString()) return res.status(403).json({ error: 'Unauthorized' });

        const repoPath = project.repoPath;
        if (!fs.existsSync(repoPath)) return res.status(404).json({ error: 'Project directory not found' });

        // 1. Build the project
        console.log(`Building project ${project.name} at ${repoPath}`);
        try {
            await execAsync('npm run build', { cwd: repoPath });
        } catch (buildErr) {
            console.error('Build error:', buildErr);
            return res.status(500).json({ error: 'Failed to build project', details: buildErr.message });
        }

        const distDir = path.join(repoPath, 'dist');
        if (!fs.existsSync(distDir)) {
            return res.status(500).json({ error: 'dist folder not found after build' });
        }

        ensureRedirects(distDir);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        let siteId = project.netlifySiteId;
        let siteUrl = project.netlifyUrl;

        // 2. Create site if it doesn't exist
        if (!siteId) {
            console.log('Creating new Netlify site...');
            try {
                const siteRes = await fetch('https://api.netlify.com/api/v1/sites', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({})
                });

                if (!siteRes.ok) {
                    const errData = await siteRes.text();
                    console.error('Netlify Create Site Error:', errData);
                    return res.status(siteRes.status).json({ error: 'Failed to create site', details: errData });
                }

                const siteData = await siteRes.json();
                console.log('Site created with ID:', siteData.id);
                siteId = siteData.id;
                siteUrl = siteData.ssl_url || siteData.url;

                project.netlifySiteId = siteId;
                project.netlifyUrl = siteUrl;
                await project.save();
            } catch (siteErr) {
                console.error('Fetch error during site creation:', siteErr);
                return res.status(500).json({ error: 'Network error during site creation', details: siteErr.message });
            }
        }

        // 3. Create Deploy
        console.log(`Creating deploy for site ${siteId}...`);
        const filesMap = buildFileMap(distDir);
        
        // Reverse map for lookup: hash -> /path/to/file.ext
        const hashMap = {};
        for(const [filePath, hash] of Object.entries(filesMap)) {
            hashMap[hash] = filePath;
        }

        const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ files: filesMap })
        });

        if (!deployRes.ok) {
            const errData = await deployRes.text();
            return res.status(deployRes.status).json({ error: 'Failed to create deploy', details: errData });
        }

        const deployData = await deployRes.json();
        const deployId = deployData.id;
        // Netlify returns an array of SHA1 hashes of files it needs
        const requiredHashes = deployData.required || [];

        // 4. Upload required files
        console.log(`Uploading ${requiredHashes.length} required files...`);
        for (const fileHash of requiredHashes) {
            const relativePathWithSlash = hashMap[fileHash];
            if (!relativePathWithSlash) {
                console.error(`Missing hash in local map: ${fileHash}`);
                continue;
            }
            
            // Remove leading slash to construct the local disk path
            const relativePath = relativePathWithSlash.substring(1);
            const fullPath = path.join(distDir, relativePath);
            const fileBuffer = fs.readFileSync(fullPath); // Read as buffer to bypass native fetch stream issues
            
            const uploadRes = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}/files${relativePathWithSlash}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/octet-stream'
                },
                body: fileBuffer
            });

            if (!uploadRes.ok) {
                console.error(`Failed to upload ${relativePathWithSlash}:`, await uploadRes.text());
            }
        }

        // 5. Success
        res.json({
            url: siteUrl,
            deployId,
            status: 'deployed'
        });

    } catch (error) {
        console.error('Deploy error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
