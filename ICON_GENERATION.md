# PWA Icon Generation

## Quick Method (Browser)

1. Open `create-icons.html` in your browser
2. You'll see two canvases with the game's ASCII ship: `/█\`
3. Right-click the first canvas → "Save image as..." → save as `icon-192.png` in this folder
4. Right-click the second canvas → "Save image as..." → save as `icon-512.png` in this folder
5. Rebuild and deploy: `npm run deploy`

## Alternative Method (Node.js)

If you have the canvas library installed:
```bash
npm install canvas
node generate-icons.js
```

This will automatically generate both icon files.

## What the icons look like

- Dark space background (#0a0a1e)
- Random white stars
- Yellow ASCII ship: `/█\` (from the starter ship Vulcan)
- Subtle glow effect
- Gray border

The icons match the game's ASCII art style!
