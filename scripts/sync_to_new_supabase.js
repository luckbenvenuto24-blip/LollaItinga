const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://fflaatbvwwtvckuselkr.supabase.co';
const KEY = 'sb_publishable_qctRhqScOKjKgjZWtnlWbA_nA1dsm4Z';

async function sync() {
  const cardapioPath = path.join(__dirname, '../data/cardapio.json');
  const d = JSON.parse(fs.readFileSync(cardapioPath, 'utf8'));

  console.log('1. Testando conexão com a tabela lolla_cardapio_online no Supabase...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/lolla_cardapio_online?select=id`, {
    headers: {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`
    }
  });

  if (!res.ok) {
    console.log(`\n❌ Tabela ainda não encontrada no Supabase (Status: ${res.status}).`);
    console.log('👉 Execute o script SQL no painel do Supabase (SQL Editor) antes de rodar este script.');
    return false;
  }

  console.log('✅ Tabela encontrada no Supabase!');

  // Opcional: Upload de fotos base64 para o Supabase Storage se o bucket estiver ativo
  console.log('2. Verificando fotos locais para upload no Supabase Storage...');
  let fotosMigradas = 0;
  for (const item of d.itens) {
    if (item.img && item.img.startsWith('data:image/')) {
      try {
        const matches = item.img.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = `foto-prod-${item.id || Math.random().toString(36).slice(2, 8)}.${ext}`;

          const resUpload = await fetch(`${SUPABASE_URL}/storage/v1/object/produtos/${filename}`, {
            method: 'POST',
            headers: {
              'apikey': KEY,
              'Authorization': `Bearer ${KEY}`,
              'Content-Type': `image/${matches[1]}`,
              'x-upsert': 'true'
            },
            body: buffer
          });

          if (resUpload.ok) {
            item.img = `${SUPABASE_URL}/storage/v1/object/public/produtos/${filename}`;
            fotosMigradas++;
            console.log(`   📸 Foto do produto "${item.n}" enviada para o Storage CDN!`);
          }
        }
      } catch (errUpload) {
        console.warn(`   ⚠️ Não foi possível subir a foto de ${item.n} para o storage:`, errUpload.message);
      }
    }
  }

  if (fotosMigradas > 0) {
    fs.writeFileSync(cardapioPath, JSON.stringify(d, null, 2), 'utf8');
    console.log(`✅ ${fotosMigradas} fotos migradas para Supabase Storage CDN!`);
  }

  console.log('3. Sincronizando catálogo completo com Supabase...');
  const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/lolla_cardapio_online`, {
    method: 'POST',
    headers: {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id: 'principal',
      data: d,
      updated_at: new Date().toISOString()
    })
  });

  if (saveRes.ok) {
    console.log('\n🎉 SUCESSO TOTAL! Cardápio e produtos sincronizados na nuvem!');
    console.log('Agora todos os celulares, computadores e clientes verão as fotos e produtos em tempo real!');
    return true;
  } else {
    console.error('❌ Erro ao salvar:', saveRes.status, await saveRes.text());
    return false;
  }
}

sync();
