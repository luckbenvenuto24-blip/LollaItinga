const fs = require('fs');
const path = require('path');

const brandAssets = [
  { url: 'https://lolla-maringa.vercel.app/cardapios/marca-v1/logo-lolla.webp', file: 'assets/marca/logo-lolla.webp' },
  { url: 'https://lolla-maringa.vercel.app/cardapios/marca-v1/vaquinha.webp', file: 'assets/marca/vaquinha.webp' },
  { url: 'https://lolla-maringa.vercel.app/logo-lolla.jpg', file: 'assets/marca/logo-lolla.jpg' }
];

async function downloadAll() {
  for (const item of brandAssets) {
    const dest = path.join(__dirname, item.file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    console.log(`Downloading ${item.url}...`);
    try {
      const res = await fetch(item.url);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buffer);
        console.log(`Saved ${dest} (${buffer.length} bytes)`);
      } else {
        console.error(`Failed ${item.url}: ${res.status}`);
      }
    } catch (e) {
      console.error(`Error downloading ${item.url}:`, e);
    }
  }
}

downloadAll();
