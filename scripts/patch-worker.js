const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const lockFile = path.join(rootDir, '.worker-building.lock');
try {
  if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
} catch {}

function patchFile(filePath, searchStr, replaceStr) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchStr)) {
      content = content.replace(new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceStr);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[patch-worker] Successfully patched: ${path.relative(rootDir, filePath)}`);
      return true;
    }
  }
  return false;
}

// 1. Patch Prisma library.js in root node_modules
patchFile(
  path.join(rootDir, 'node_modules', '@prisma', 'client', 'runtime', 'library.js'),
  'if(t.code==="ENOENT")return;throw t',
  'return;'
);
patchFile(
  path.join(rootDir, 'node_modules', '@prisma', 'client', 'runtime', 'library.js'),
  'dirname=eval("__dirname")',
  'dirname=(typeof __dirname!=="undefined"?__dirname:"")'
);

// 2. Patch Prisma library.js inside .open-next server functions
patchFile(
  path.join(rootDir, '.open-next', 'server-functions', 'default', 'node_modules', '@prisma', 'client', 'runtime', 'library.js'),
  'if(t.code==="ENOENT")return;throw t',
  'return;'
);
patchFile(
  path.join(rootDir, '.open-next', 'server-functions', 'default', 'node_modules', '@prisma', 'client', 'runtime', 'library.js'),
  'dirname=eval("__dirname")',
  'dirname=(typeof __dirname!=="undefined"?__dirname:"")'
);

// 3. Patch handler.mjs if present
patchFile(
  path.join(rootDir, '.open-next', 'server-functions', 'default', 'handler.mjs'),
  'if(t.code==="ENOENT")return;throw t',
  'return;'
);
patchFile(
  path.join(rootDir, '.open-next', 'server-functions', 'default', 'handler.mjs'),
  'eval("__dirname")',
  '(typeof __dirname!=="undefined"?__dirname:"")'
);

// 4. Inject safe fs.readdir shim into handler.mjs
const handlerPath = path.join(rootDir, '.open-next', 'server-functions', 'default', 'handler.mjs');
if (fs.existsSync(handlerPath)) {
  let content = fs.readFileSync(handlerPath, 'utf8');
  const shim = `
import __edge_fs from 'node:fs';
try {
  __edge_fs.readdir = (p, o, cb) => {
    const c = typeof o === 'function' ? o : cb;
    if (typeof c === 'function') setTimeout(() => c(null, []), 0);
    return Promise.resolve([]);
  };
  __edge_fs.readdirSync = () => [];
  if (__edge_fs.promises) {
    __edge_fs.promises.readdir = async () => [];
  }
} catch (e) {}
`;
  if (!content.includes('__edge_fs')) {
    content = shim + content;
    fs.writeFileSync(handlerPath, content, 'utf8');
    console.log('[patch-worker] Successfully injected fs.readdir shim into handler.mjs');
  }
}

// 5. Inject safe fs.readdir shim into .open-next/worker.js
const workerPath = path.join(rootDir, '.open-next', 'worker.js');
if (fs.existsSync(workerPath)) {
  let content = fs.readFileSync(workerPath, 'utf8');
  const shim = `
import __edge_worker_fs from 'node:fs';
try {
  __edge_worker_fs.readdir = (p, o, cb) => {
    const c = typeof o === 'function' ? o : cb;
    if (typeof c === 'function') setTimeout(() => c(null, []), 0);
    return Promise.resolve([]);
  };
  __edge_worker_fs.readdirSync = () => [];
  if (__edge_worker_fs.promises) {
    __edge_worker_fs.promises.readdir = async () => [];
  }
} catch (e) {}
`;
  if (!content.includes('__edge_worker_fs')) {
    content = shim + content;
    fs.writeFileSync(workerPath, content, 'utf8');
    console.log('[patch-worker] Successfully injected fs.readdir shim into worker.js');
  }
}

console.log('[patch-worker] Worker patching complete.');

