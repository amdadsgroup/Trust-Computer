const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const srcLogo = path.join(__dirname, '..', 'logo.jpeg');
const destLogoJpeg = path.join(imagesDir, 'logo.jpeg');
const destLogoPng = path.join(imagesDir, 'logo.png');

if (fs.existsSync(srcLogo)) {
  fs.copyFileSync(srcLogo, destLogoJpeg);
  fs.copyFileSync(srcLogo, destLogoPng);
  console.log('Logo successfully copied to public/images/logo.jpeg and public/images/logo.png');
} else {
  console.error('Source logo.jpeg not found in project root!');
}
