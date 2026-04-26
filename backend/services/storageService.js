import fs from 'fs-extra';
import archiver from 'archiver';
import extract from 'extract-zip';
import path from 'path';
import os from 'os';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getProjectsDir } from './projectService.js';

// Initialized lazily inside functions to ensure process.env is populated by dotenv first
let _s3Client = null;
const getS3Client = () => {
    if (!_s3Client) {
        _s3Client = new S3Client({ 
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    return _s3Client;
};

const getBucket = () => process.env.AWS_S3_BUCKET_NAME;
const rehydrationInFlight = new Map();

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Zip a local directory, excluding node_modules */
const zipDirectory = (sourceDir, zipPath) =>
    new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);

        archive.glob('**/*', { cwd: sourceDir, ignore: ['node_modules/**'] });
        archive.glob('.git/**/*', { cwd: sourceDir });
        archive.glob('.gitignore', { cwd: sourceDir });

        archive.finalize();
    });

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Compress a project directory and upload it to AWS S3.
 * Called after every AI generation, file save, or revert.
 */
export const uploadProjectToCloud = async (projectId) => {
    const BUCKET = getBucket();
    const s3 = getS3Client();

    if (!BUCKET) {
        console.warn('[S3] AWS_S3_BUCKET_NAME not set — skipping cloud backup.');
        return;
    }

    const repoPath = path.join(getProjectsDir(), projectId.toString());
    // Use a unique temp path per invocation to prevent race conditions when
    // multiple uploads fire concurrently (e.g. project create + AI prompt)
    const zipPath  = path.join(os.tmpdir(), `nirmana-${projectId}-${Date.now()}.zip`);
    const s3Key    = `projects/${projectId}.zip`;

    if (!(await fs.pathExists(repoPath))) {
        console.warn(`[S3] Directory not found for project ${projectId} — skipping upload.`);
        return;
    }

    try {
        console.log(`[S3] Zipping project ${projectId}...`);
        await zipDirectory(repoPath, zipPath);

        const fileBuffer = await fs.readFile(zipPath);

        console.log(`[S3] Uploading ${s3Key} to bucket "${BUCKET}"...`);
        await s3.send(new PutObjectCommand({
            Bucket:      BUCKET,
            Key:         s3Key,
            Body:        fileBuffer,
            ContentType: 'application/zip',
        }));

        await fs.remove(zipPath);
        console.log(`[S3] Successfully uploaded project ${projectId}.`);
    } catch (err) {
        console.error(`[S3] Upload failed for project ${projectId}:`, err.message);
        if (await fs.pathExists(zipPath)) await fs.remove(zipPath);
    }
};

/**
 * Download and extract a project from S3 back onto the ephemeral disk.
 * Called by getProject() when the local directory is missing (Render restart).
 */
export const downloadProjectFromCloud = async (projectId) => {
    const key = projectId.toString();
    if (rehydrationInFlight.has(key)) {
        console.log(`[S3] Rehydration already in progress for project ${projectId}, waiting...`);
        return rehydrationInFlight.get(key);
    }

    const runRehydration = async () => {
    const BUCKET = getBucket();
    const s3 = getS3Client();

    if (!BUCKET) {
        console.warn('[S3] AWS_S3_BUCKET_NAME not set — cannot restore from cloud.');
        return false;
    }

    const repoPath = path.join(getProjectsDir(), projectId.toString());
    // Use a unique temp zip to avoid collisions across requests/processes
    const zipPath  = path.join(os.tmpdir(), `nirmana-restore-${projectId}-${Date.now()}.zip`);
    const s3Key    = `projects/${projectId}.zip`;

    console.log(`[S3] Checking if backup exists for project ${projectId}...`);

    try {
        // Check existence without downloading the whole file
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: s3Key }));
    } catch (err) {
        if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
            console.log(`[S3] No backup found for project ${projectId}.`);
            return false;
        }
        throw err;
    }

    console.log(`[S3] Downloading backup for project ${projectId}...`);
    try {
        await fs.ensureDir(getProjectsDir());

        const { Body } = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }));
        await pipeline(Body, createWriteStream(zipPath));

        // Wipe stale directory to avoid phantom file collisions
        if (await fs.pathExists(repoPath)) await fs.remove(repoPath);
        await fs.ensureDir(repoPath);

        await extract(zipPath, { dir: path.resolve(repoPath) });
        await fs.remove(zipPath);

        console.log(`[S3] Successfully rehydrated project ${projectId} from S3.`);
        return true;
    } catch (err) {
        console.error(`[S3] Download/extract failed for project ${projectId}:`, err.message);
        if (await fs.pathExists(zipPath)) await fs.remove(zipPath);
        return false;
    }
    };

    const task = runRehydration().finally(() => {
        rehydrationInFlight.delete(key);
    });
    rehydrationInFlight.set(key, task);
    return task;
};
