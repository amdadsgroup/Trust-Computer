const fs = require('fs');
const path = require('path');

const srcHero = 'C:\\Users\\NEED ELECTRO\\.gemini\\antigravity-ide\\brain\\73b22a7e-35ed-4ced-8f08-4a17665b7c35\\tc_hero_banner_1790232784851.jpg';
const srcFeedback = 'C:\\Users\\NEED ELECTRO\\.gemini\\antigravity-ide\\brain\\73b22a7e-35ed-4ced-8f08-4a17665b7c35\\tc_side_feedback_1790232821323.jpg';
const srcService = 'C:\\Users\\NEED ELECTRO\\.gemini\\antigravity-ide\\brain\\73b22a7e-35ed-4ced-8f08-4a17665b7c35\\tc_side_service_1790232849442.jpg';

const publicImages = path.join(__dirname, '..', 'public', 'images');

if (!fs.existsSync(publicImages)) {
  fs.mkdirSync(publicImages, { recursive: true });
}

fs.copyFileSync(srcHero, path.join(publicImages, 'hero-banner-1.jpg'));
fs.copyFileSync(srcFeedback, path.join(publicImages, 'side-banner-feedback.jpg'));
fs.copyFileSync(srcService, path.join(publicImages, 'side-banner-service.jpg'));

console.log('✓ Banners successfully copied to public/images');
