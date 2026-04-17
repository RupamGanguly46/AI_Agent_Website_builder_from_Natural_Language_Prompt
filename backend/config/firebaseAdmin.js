import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load service account key from project root
const serviceAccount = require(path.resolve(__dirname, '..', '..', 'NirmanaServiceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;
