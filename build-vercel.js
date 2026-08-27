const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'dist', 'vercel-entry.js');
const destFile = path.join(__dirname, 'api', 'index.js');
const destDir = path.join(__dirname, 'api');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(srcFile)) {
  console.error('Source file not found:', srcFile);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const apiDistDir = path.join(destDir, 'dist');
if (!fs.existsSync(apiDistDir)) {
  fs.mkdirSync(apiDistDir, { recursive: true });
}

function copyBuildFiles(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyBuildFiles(srcPath, destPath);
    } else if (!entry.name.endsWith('.map') && entry.name !== 'tsconfig.build.tsbuildinfo') {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyBuildFiles(distDir, apiDistDir);

let content = fs.readFileSync(srcFile, 'utf8');

const replacements = [
  { from: /require\("\.\/app\.module"\)/g, to: 'require("./dist/app.module")' },
  { from: /require\("\.\/not-found\.filter"\)/g, to: 'require("./dist/not-found.filter")' },
];

for (const { from, to } of replacements) {
  content = content.replace(from, to);
}

fs.writeFileSync(destFile, content);
console.log('Copied dist/ build files to api/dist/ and created api/index.js');
