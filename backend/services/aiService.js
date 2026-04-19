import { createGraph } from '../agents/graph.js';
import { writeFiles, listFiles, readFileContent } from '../utils/fileUtils.js';
import { commitChanges } from './gitService.js';
import { getProject } from './projectService.js';
import Commit from '../models/Commit.js';
import Message from '../models/Message.js';
import { emitLog } from '../utils/logger.js';
import { uploadProjectToCloud } from './storageService.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Process an AI prompt for a project:
 * 1. Run LangGraph agents (planner → coder)
 * 2. Write generated files to disk
 * 3. Commit changes to Git
 * 4. Store commit and messages in MongoDB
 */
export const processPrompt = async (projectId, prompt) => {
    // Get project details
    const project = await getProject(projectId);
    const repoPath = project.repoPath;

    // Fetch all files from the project
    emitLog(projectId, 'info', 'Analyzing project for a smart token-efficient context extraction...');
    const allFiles = await listFiles(repoPath);

    let fileTree = "=== FILE TREE ===\n";
    allFiles.forEach(f => {
        if (f.type === 'file') fileTree += `- ${f.path}\n`;
    });

    let currentCodebase = fileTree + "\n=== CURRENT PROJECT FILES (SMART EXTRACTION) ===\n\n";
    let includedCount = 0;

    const promptClean = prompt.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const file of allFiles) {
        if (file.type === 'file' && !file.path.match(/\.(png|jpg|jpeg|svg|woff|ttf|ico|gif)$/i)) {
            const fileName = path.parse(file.path).name.toLowerCase();
            const cleanName = fileName.replace(/[^a-z0-9]/g, '');

            // Heuristics to determine if the file should be included in exactly this payload
            const isCore = ['src/app.jsx', 'src/main.jsx', 'src/index.css'].includes(file.path.toLowerCase());
            const isMentioned = cleanName.length > 2 && promptClean.includes(cleanName);

            // Check if file was modified recently (last 15 minutes)
            const stats = await fs.stat(path.join(repoPath, file.path));
            const wasRecentlyModified = (Date.now() - stats.mtimeMs) < (15 * 60 * 1000);

            if (isCore || isMentioned || wasRecentlyModified) {
                const content = await readFileContent(repoPath, file.path);
                currentCodebase += `--- ${file.path} ---\n\`\`\`\n${content}\n\`\`\`\n\n`;
                includedCount++;
            }
        }
    }

    currentCodebase += "// Note: To save compute tokens, only core files, recently modified files, and files conceptually mentioned in the prompt are provided above. Read the FILE TREE to know what else exists.";

    emitLog(projectId, 'info', `Smart context built! Automatically extracted ${includedCount} highly relevant files to save API tokens.`);

    emitLog(projectId, 'info', `Processing new prompt: "${prompt}"`);

    // Run LangGraph agent pipeline
    const graph = createGraph();
    const result = await graph.invoke({ prompt, projectId, currentCodebase });

    const files = result.files || [];
    const message = result.message || '';

    let writtenFiles = [];
    let commitHash = null;

    if (files.length > 0) {
        emitLog(projectId, 'info', `Writing ${files.length} generated files to disk`);

        // Write files to the project directory
        writtenFiles = await writeFiles(repoPath, files);

        emitLog(projectId, 'info', 'Committing changes to git history');

        // Commit changes
        const commitMessage = `AI update: ${prompt.substring(0, 72)}`;
        commitHash = await commitChanges(repoPath, commitMessage);

        // Store commit in MongoDB
        await Commit.create({
            projectId: project._id,
            commitHash,
            prompt,
        });
    } else {
        emitLog(projectId, 'info', 'No files were generated; AI responded with a conversational message.');
    }

    // Store conversation messages
    await Message.create({
        projectId: project._id,
        commitHash,
        role: 'user',
        content: prompt,
    });

    let defaultAssistantContent = '';
    if (files.length > 0) {
        defaultAssistantContent = `✅ Generated ${files.length} file(s):\n${writtenFiles.map((f) => `• ${f}`).join('\n')}`;
    }
    const finalAssistantContent = message ? `${message}\n\n${defaultAssistantContent}`.trim() : (defaultAssistantContent || "No files were modified.");

    await Message.create({
        projectId: project._id,
        commitHash,
        role: 'assistant',
        content: finalAssistantContent,
    });

    emitLog(projectId, 'info', `Safely backing up AI generation payload upward to Firebase Storage...`);
    await uploadProjectToCloud(project._id);

    return {
        commitHash,
        modifiedFiles: writtenFiles,
        plan: result.plan,
        message: finalAssistantContent,
    };
};
