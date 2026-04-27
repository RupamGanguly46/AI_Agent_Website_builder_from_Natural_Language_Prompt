import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

const author = {
    name: 'Nirmana AI',
    email: 'ai@nirmana.builder'
};

/**
 * Helper to add all changes in a directory (mimics 'git add .')
 */
const addAll = async (dir) => {
    const STATUS_STAGED = 1;
    const STATUS_MODIFIED = 2;
    const STATUS_DELETED = 3;

    const matrix = await git.statusMatrix({ fs, dir });
    
    // Matrix row format: [filepath, head, workdir, stage]
    // 0: absent, 1: unchanged, 2: modified, 3: deleted (relative to head/workdir/stage)
    // We want to add anything that is modified or new in the workdir.
    await Promise.all(
        matrix.map(([filepath, head, workdir, stage]) => {
            // head === 1 && workdir === 1 && stage === 1 means unchanged
            if (workdir !== stage) {
                if (workdir === 0) {
                    // File deleted in workdir, remove from stage
                    return git.remove({ fs, dir, filepath });
                } else {
                    // File modified or new in workdir, add to stage
                    return git.add({ fs, dir, filepath });
                }
            }
            return null;
        }).filter(Boolean)
    );
};

/**
 * Initialize a new Git repository and make the initial commit
 */
export const initRepo = async (repoPath) => {
    await git.init({ fs, dir: repoPath });
    await addAll(repoPath);
    const commitHash = await git.commit({
        fs,
        dir: repoPath,
        message: 'Initial template',
        author
    });
    return commitHash;
};

/**
 * Stage all changes and create a commit
 */
export const commitChanges = async (repoPath, message) => {
    await addAll(repoPath);

    // Check if there are changes to commit (isomorphic-git doesn't have a simple 'git status' like simple-git)
    // If the commit results in the same tree as head, it might throw or create an empty commit.
    // However, usually we want to know if anything changed.
    
    try {
        const commitHash = await git.commit({
            fs,
            dir: repoPath,
            message: message,
            author
        });
        return commitHash;
    } catch (err) {
        // isomorphic-git throws if there are no changes to commit
        if (err.code === 'EmptyCommitError') {
            const log = await git.log({ fs, dir: repoPath, depth: 1 });
            return log[0].oid;
        }
        throw err;
    }
};

/**
 * Get commit history for a repository
 */
export const getCommits = async (repoPath) => {
    const log = await git.log({ fs, dir: repoPath });
    return log.map((entry) => ({
        commitHash: entry.oid,
        message: entry.commit.message,
        date: new Date(entry.commit.author.timestamp * 1000).toISOString(),
        author: entry.commit.author.name,
    }));
};

/**
 * Revert the repository to a specific commit using hard reset
 */
export const revertToCommit = async (repoPath, commitHash) => {
    await git.checkout({
        fs,
        dir: repoPath,
        ref: commitHash,
        force: true
    });
    
    const branch = await git.currentBranch({ fs, dir: repoPath }) || 'main';
    await git.writeRef({
        fs,
        dir: repoPath,
        ref: `refs/heads/${branch}`,
        value: commitHash,
        force: true
    });
};
