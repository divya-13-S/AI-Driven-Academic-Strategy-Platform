const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(fullPath));
        } else {
            if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const targetDir = path.join(__dirname, 'src');
console.log('Scanning directory:', targetDir);
const files = walkDir(targetDir);

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(/http:\/\/localhost:5050/g, 'http://localhost:8080');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated file:', file);
    }
});

console.log('Replacement complete.');
