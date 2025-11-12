// Simple icon generator - creates PNG icons with ASCII ship
// Run with: node generate-icons.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple PNG creator using canvas API if available
async function generateIcons() {
  try {
    // Try to use canvas if available (npm install canvas)
    const canvas = await import('canvas');
    const { createCanvas } = canvas;

    function createIcon(size) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Background - dark space
      ctx.fillStyle = '#0a0a1e';
      ctx.fillRect(0, 0, size, size);

      // Add subtle stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const starSize = Math.random() * 2 + 1;
        ctx.fillRect(x, y, starSize, starSize);
      }

      // Draw ASCII ship /█\
      ctx.fillStyle = '#ffff00'; // Yellow like the starter ship
      ctx.font = `bold ${size * 0.35}px "Courier New"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('/█\\', size / 2, size / 2);

      // Add glow effect
      ctx.shadowBlur = size * 0.05;
      ctx.shadowColor = '#ffff00';
      ctx.fillText('/█\\', size / 2, size / 2);
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = '#4a4a6a';
      ctx.lineWidth = size * 0.015;
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
