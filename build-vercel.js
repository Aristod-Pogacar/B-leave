const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'dist', 'vercel-entry.js');
const destFile = path.join(__dirname, 'api', 'index.js');
const destDir = path.join(__dirname, 'api');

if (!fs.existsSync(srcFile)) {
  console.error('Source file not found:', srcFile);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let content = fs.readFileSync(srcFile, 'utf8');

const replacements = [
  { from: /require\("\.\/app\.module"\)/g, to: 'require("../dist/app.module")' },
  { from: /require\("\.\/not-found\.filter"\)/g, to: 'require("../dist/not-found.filter")' },
];

for (const { from, to } of replacements) {
  content = content.replace(from, to);
}

fs.writeFileSync(destFile, content);
console.log('Copied and patched dist/vercel-entry.js to api/index.js');
