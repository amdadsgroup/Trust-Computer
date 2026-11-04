const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
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
} catch (err) {
  // Graceful fallback
}

