import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Support Render/Vercel Environment Variables first
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error);
    }
}

// Fallback to local file for development
if (!serviceAccount) {
    serviceAccount = require(path.resolve(__dirname, '..', '..', 'NirmanaServiceAccountKey.json'));
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'nirmana-46.firebasestorage.app'
    });
}

export default admin;
