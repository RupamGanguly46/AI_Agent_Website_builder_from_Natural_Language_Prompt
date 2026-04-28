import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { verifyProjectsStorage } from './services/projectService.js';

// Load env from root .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
    dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
    dotenv.config();
}

// ─── Environment Validation ────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
const REQUIRED_VARS = ['MONGO_URI', 'GEMINI_API_KEY'];
const missingVars = REQUIRED_VARS.filter(v => !process.env[v]);

if (missingVars.length > 0 && isProduction) {
    console.error('\n❌ STARTUP ERROR: Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease add these to your Render Dashboard Environment Variables.\n');
    process.exit(1);
}

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: true, // Allow all origins and reflect them back to the browser
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);
app.use('/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[HTTP ${req.method} ${req.originalUrl}] ${err.message}`);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const startServer = async () => {
  try {
    const storageReady = await verifyProjectsStorage();
    if (!storageReady) {
      console.warn('[Storage] Continuing startup, but project workspace writes may fail.');
    }

    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 AI Builder Backend running on http://localhost:${PORT}`);
      console.log(`📦 Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
