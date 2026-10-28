const fs = require('fs');
const path = require('path');

const cardapio = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/cardapio.json'), 'utf8'));

const BASE_URL = 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/';
const OUT_DIR = path.join(__dirname, 'assets/fotos');

fs.mkdirSync(OUT_DIR, { recursive: true });

async function download() {
  const images = new Set();
  cardapio.itens.forEach(it => {
    if (it.w4) images.add(it.w4);
    if (it.w6) images.add(it.w6);
    if (it.w8) images.add(it.w8);
    if (it.j) images.add(it.j);
  });

  const list = [...images];
  console.log(`Baixando ${list.length} imagens para uso 100% offline...`);

  let baixados = 0;
  for (const filename of list) {
    const dest = path.join(OUT_DIR, filename);
    if (fs.existsSync(dest)) {
      baixados++;
      continue;
    }

    try {
      const res = await fetch(`${BASE_URL}${filename}`);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buffer);
        baixados++;
        process.stdout.write(`\rProgresso: ${baixados}/${list.length} (${filename})`);
      }
    } catch (e) {
      console.error(`\nErro ao baixar ${filename}:`, e.message);
    }
  }

  console.log(`\nConcluído! ${baixados} imagens salvas em assets/fotos/`);
}

download();
