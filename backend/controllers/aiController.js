import { processPrompt } from '../services/aiService.js';

/**
 * POST /ai/prompt
 */
export const handlePrompt = async (req, res, next) => {
    try {
        const { projectId, prompt } = req.body;

        if (!projectId || !prompt) {
            console.warn('[AIController:handlePrompt] Missing projectId or prompt in request body');
            return res.status(400).json({ error: 'projectId and prompt are required' });
        }

        const result = await processPrompt(projectId, prompt);
        res.json(result);
    } catch (error) {
        console.error(`[AIController:handlePrompt] ${req.method} ${req.originalUrl} failed:`, error.message);
        next(error);
    }
};
