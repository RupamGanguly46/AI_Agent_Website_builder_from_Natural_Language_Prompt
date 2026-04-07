import fs from 'fs';
import path from 'path';

let output = '';

function printTree(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    const filteredFiles = files.filter(f => !['node_modules', '.git', 'projects', 'test-mongo.js', 'test-gemini.js'].includes(f));

    filteredFiles.forEach((file, index) => {
        const isLast = index === filteredFiles.length - 1;
        const pointer = isLast ? '└── ' : '├── ';
        output += prefix + pointer + file + '\n';
        
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            printTree(fullPath, prefix + (isLast ? '    ' : '│   '));
        }
    });
}

output += 'ai-builder\n';
printTree('e:\\Website Builder Super Prompt\\ai-builder');
fs.writeFileSync('tree.txt', output, 'utf8');
