import fs from 'fs-extra';
import archiver from 'archiver';
import extract from 'extract-zip';
import path from 'path';
import admin from '../config/firebaseAdmin.js';
import { getProjectsDir } from './projectService.js';
import { emitLog } from '../utils/logger.js';

export const uploadProjectToCloud = async (projectId) => {
    const repoPath = path.join(getProjectsDir(), projectId.toString());
    const zipPath = `${repoPath}.zip`;

    console.log(`[Storage] Zipping project ${projectId} for Cloud Storage...`);

    // Verify local repo actually exists
    if (!(await fs.pathExists(repoPath))) {
        console.warn(`[Storage] Warning: Cannot zip ${projectId}, directory does not exist locally.`);
        return;
    }

    try {
        // Zip the directory natively to a temporary .zip file on disk
        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', resolve);
            archive.on('error', reject);

            archive.pipe(output);

            // Zip the whole folder EXCEPT node_modules to preserve bandwidth
            archive.glob('**/*', {
                cwd: repoPath,
                ignore: ['node_modules/**']
            });

            // Also explicitly zip hidden files like .git
            archive.glob('.git/**/*', { cwd: repoPath });
            archive.glob('.gitignore', { cwd: repoPath });

            archive.finalize();
        });

        // Upload the physical .zip to Firebase Storage Bucket
        const bucket = admin.storage().bucket();
        const destination = `projects/${projectId}.zip`;

        console.log(`[Storage] Uploading ${projectId}.zip to Firebase Cloud...`);
        await bucket.upload(zipPath, {
            destination: destination,
            metadata: { contentType: 'application/zip' }
        });

        // Clean up the local zip to save disk space
        await fs.remove(zipPath);
        console.log(`[Storage] Successfully uploaded ${projectId} to Cloud.`);

    } catch (error) {
        console.error(`[Storage] Failure uploading project ${projectId}:`, error);
        // Clean up corrupted incomplete zip if generated
        if (await fs.pathExists(zipPath)) await fs.remove(zipPath);
    }
};

export const downloadProjectFromCloud = async (projectId) => {
    const repoPath = path.join(getProjectsDir(), projectId.toString());
    const zipPath = `${repoPath}.zip`;
    const bucket = admin.storage().bucket();
    const sourceFilePath = `projects/${projectId}.zip`;

    console.log(`[Storage] Checking if Cloud backup for ${projectId} exists...`);
    const file = bucket.file(sourceFilePath);
    const [exists] = await file.exists();

    if (!exists) {
        console.log(`[Storage] No cloud backup found for ${projectId}. Assuming new or local-only project.`);
        return false;
    }

    console.log(`[Storage] Downloading backup ${projectId}.zip from Cloud...`);
    try {
        // Prepare target directories
        await fs.ensureDir(getProjectsDir());
        
        // Download zip
        await file.download({ destination: zipPath });

        console.log(`[Storage] Extracting backup into ${repoPath}...`);
        
        // We purge the destination first so we have a completely clean state to prevent phantom file collisions
        if (await fs.pathExists(repoPath)) {
            await fs.remove(repoPath);
        }
        await fs.ensureDir(repoPath);

        // Decompress the zip dynamically over the directory
        await extract(zipPath, { dir: path.resolve(repoPath) });

        // Cleanup downloaded zip archive
        await fs.remove(zipPath);
        
        console.log(`[Storage] Successfully rehydrated project ${projectId} from Cloud!`);
        return true;
    } catch (error) {
        console.error(`[Storage] Critical failure downloading project ${projectId}:`, error);
        if (await fs.pathExists(zipPath)) await fs.remove(zipPath);
        return false;
    }
};
