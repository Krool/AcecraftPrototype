// Simple icon generator - creates basic PNG icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Simple PNG creator using canvas API if available
async function generateIcons() {
  try {
    // Try to use canvas if available (npm install canvas)
    const { createCanvas } = require('canvas');

    function createIcon(size) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#1a1a3a';
      ctx.fillRect(0, 0, size, size);

      // Draw "R" in ASCII style
      ctx.fillStyle = '#00ffff';
      ctx.font = `bold ${size * 0.6}px "Courier New"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', size / 2, size / 2);

      // Border
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = size * 0.02;
      ctx.strokeRect(0, 0, size, size);

      return canvas;
    }

    // Generate icons
    const icon192 = createIcon(192);
    const icon512 = createIcon(512);

    // Save to public directory
    const publicDir = path.join(__dirname, 'public');

    fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192.toBuffer());
    fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512.toBuffer());

    console.log('✓ Icons generated successfully!');
  } catch (error) {
    console.log('Canvas library not installed. To generate icons:');
    console.log('1. npm install canvas');
    console.log('2. node generate-icons.js');
    console.log('\nOR open public/create-icons.html in a browser and save the images manually.');
  }
}

generateIcons();
