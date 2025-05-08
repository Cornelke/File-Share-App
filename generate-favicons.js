const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, 'public', 'snip.jpg');
const outputs = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'favicon-512x512.png', size: 512 },
  { file: 'icon-512.png', size: 512 },
];

(async () => {
  for (const { file, size } of outputs) {
    const output = path.join(__dirname, 'public', file);
    await sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(output);
    console.log(`Generated ${file}`);
  }
})(); 