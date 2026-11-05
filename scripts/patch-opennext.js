const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const lockFile = path.join(rootDir, '.worker-building.lock');
try {
  fs.writeFileSync(lockFile, '1', 'utf8');
} catch {}

const targetPath = path.join(
  rootDir,
  'node_modules',
  '@opennextjs',
  'aws',
  'dist',
  'plugins',
  'edge.js'
);

try {
  if (fs.existsSync(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    if (content.includes('${entryFiles.map((file) => `require("${file}");`).join("\\n")}')) {
      content = content.replace(
        '${entryFiles.map((file) => `require("${file}");`).join("\\n")}',
        '${entryFiles.map((file) => `require("${file.replace(/\\\\/g, "/")}");`).join("\\n")}'
      );
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log('Successfully patched OpenNext edge.js for cross-platform path support');
    }
  }

  // Patch Prisma library.js in root node_modules before build
  const prismaLibPath = path.join(rootDir, 'node_modules', '@prisma', 'client', 'runtime', 'library.js');
  if (fs.existsSync(prismaLibPath)) {
    let pContent = fs.readFileSync(prismaLibPath, 'utf8');
    if (pContent.includes('if(t.code==="ENOENT")return;throw t')) {
      pContent = pContent.replace('if(t.code==="ENOENT")return;throw t', 'return;');
      fs.writeFileSync(prismaLibPath, pContent, 'utf8');
      console.log('Successfully patched Prisma library.js to avoid fs.readdir crashes');
    }
  }
  // Patch pg-cloudflare empty.js so it exports the real CloudflareSocket during build
  const pgCfEmptyPath = path.join(rootDir, 'node_modules', 'pg-cloudflare', 'dist', 'empty.js');
  if (fs.existsSync(pgCfEmptyPath)) {
    fs.writeFileSync(pgCfEmptyPath, '"use strict";\nmodule.exports = require("./index.js");\n', 'utf8');
    console.log('Successfully patched pg-cloudflare empty.js');
  }
} catch (err) {
  // Graceful fallback
}


