import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Support Render/Vercel/Azure Environment Variables first
let serviceAccount;
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER || !!process.env.WEBSITE_HOSTNAME;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
        console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error.message);
    }
}

// Optional: load credentials from a json file path for local development
if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
        const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        const keyPath = path.isAbsolute(envPath)
            ? envPath
            : path.resolve(__dirname, '..', '..', envPath);
        serviceAccount = require(keyPath);
    } catch (error) {
        console.error("❌ Failed to load FIREBASE_SERVICE_ACCOUNT_PATH:", error.message);
    }
}

// Fallback to local file for development ONLY
if (!serviceAccount && !isProduction) {
    try {
        const keyPath = path.resolve(__dirname, '..', '..', 'NirmanaServiceAccountKey.json');
        serviceAccount = require(keyPath);
    } catch (error) {
        console.warn("⚠️ Local service account key not found, and FIREBASE_SERVICE_ACCOUNT is missing.");
    }
}

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        console.error("❌ CRITICAL: No Firebase credentials found. Server will likely fail on auth tasks.");
    }
}

export default admin;
