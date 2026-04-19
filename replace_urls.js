const fs = require('fs');
const path = require('path');

const directoryPath = 'e:/AI Academic Platform/AI Project Frontend/vite-project/src';

const searchRegexString = /(["'`])http:\/\/localhost:8080\/?(.*?(?=\1))\1/g;
const searchRegexTemplate = /`http:\/\/localhost:8080\/?(.*?)`/g;

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(directoryPath);
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace straight string urls: "http://localhost:8080/path" -> `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/path`
    content = content.replace(/(["'])http:\/\/localhost:8080\/?(.*?)\1/g, (match, quote, urlPath) => {
        count++;
        // If there's an internal variable interpolation it shouldn't be matched by ['"] 
        // We replace with backticks
        return urlPath ? `\`\${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/${urlPath}\`` : `(import.meta.env.VITE_API_URL || 'http://localhost:8080')`;
    });

    // Replace template literals: `http://localhost:8080/path/${var}` -> `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/path/${var}`
    content = content.replace(/`http:\/\/localhost:8080\/?(.*?)`/g, (match, urlPath) => {
        count++;
        return urlPath ? `\`\${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/${urlPath}\`` : `(import.meta.env.VITE_API_URL || 'http://localhost:8080')`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${count} instances.`);
