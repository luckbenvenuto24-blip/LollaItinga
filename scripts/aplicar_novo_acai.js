const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = 'https://fflaatbvwwtvckuselkr.supabase.co';
const KEY = 'sb_publishable_qctRhqScOKjKgjZWtnlWbA_nA1dsm4Z';

async function main() {
  console.log('1. Baixando dados atuais da nuvem Supabase...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/lolla_cardapio_online?id=eq.principal`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
  });

  if (!res.ok) {
    throw new Error('Falha ao consultar Supabase: ' + res.status);
  }

  const rows = await res.json();
  if (!rows || !rows.length) {
    throw new Error('Nenhum dado encontrado no Supabase!');
  }

  const d = rows[0].data;
  console.log(`Dados carregados! Total itens no banco: ${d.itens.length}`);

  // Define os 6 copos específicos com preços, descrições e fotos oficiais
  const seisCopos = [
    {
      n: "Açaí Tradicional - Copo 300ml",
      d: "Delicioso açaí tradicional batido cremoso e refrescante. Clique em Personalizar para adicionar cremes e acompanhamentos!",
      c: "Açaí Monte o Seu!!!",
      g: "loja",
      p: 15.00,
      po: 18.00,
      baseId: "tradicional",
      tamanho: "300ml",
      isAcaiCustom: true,
      j: "202502271647_N364_i_v1_400.jpg",
      w4: "202502271647_N364_i_v1_400.webp",
      w6: "202502271647_N364_i_v1_600.webp",
      w8: "202502271647_N364_i_v1_800.webp",
      imgFit: "cover",
      imgRot: 0,
      imgPosX: 0,
      imgPosY: 0,
      imgScale: 100
    },
    {
      n: "Açaí com Nutella - Copo 300ml",
      d: "Açaí batido cremoso combinado com a legítima Nutella. Clique em Personalizar para adicionar cremes e acompanhamentos!",
      c: "Açaí Monte o Seu!!!",
      g: "loja",
      p: 17.00,
      po: 20.00,
      baseId: "nutella",
      tamanho: "300ml",
      isAcaiCustom: true,
      j: "202502271647_N364_i_v1_400.jpg",
      w4: "202502271647_N364_i_v1_400.webp",
      w6: "202502271647_N364_i_v1_600.webp",
      w8: "202502271647_N364_i_v1_800.webp",
      imgFit: "cover",
      imgRot: 0,
      imgPosX: 0,
      imgPosY: 0,
      imgScale: 100
    },
    {
      n: "Açaí com Leitinho - Copo 300ml",
      d: "Açaí cremoso batido com creme sabor leite em pó suave. Clique em Personalizar para adicionar cremes e acompanhamentos!",
      c: "Açaí Monte o Seu!!!",
      g: "loja",
      p: 17.00,
      po: 20.00,
      baseId: "leitinho",
      tamanho: "300ml",
      isAcaiCustom: true,
      j: "202502271647_N364_i_v1_400.jpg",
      w4: "202502271647_N364_i_v1_400.webp",
      w6: "202502271647_N364_i_v1_600.webp",
      w8: "202502271647_N364_i_v1_800.webp",
      imgFit: "cover",
      imgRot: 0,
      imgPosX: 0,
      imgPosY: 0,
      imgScale: 100
    },
    {
      n: "Açaí Tradicional - Copo 500ml",
      d: "Copo generoso de 500ml de puro açaí tradicional batido cremoso. Clique em Personalizar para adicionar cremes e acompanhamentos!",
      c: "Açaí Monte o Seu!!!",
      g: "loja",
      p: 18.00,
      po: 22.00,
      baseId: "tradicional",
      tamanho: "500ml",
      isAcaiCustom: true,
      j: "202502271647_N364_i_v1_400.jpg",
      w4: "202502271647_N364_i_v1_400.webp",
      w6: "202502271647_N364_i_v1_600.webp",
      w8: "202502271647_N364_i_v1_800.webp",
      imgFit: "cover",
      imgRot: 0,
      imgPosX: 0,
      imgPosY: 0,
      imgScale: 100
    },
    {
      n: "Açaí com Nutella - Copo 500ml",
      d: "Copo generoso de 500ml com açaí cremoso e a legítima Nutella. Clique em Personalizar para adicionar cremes e acompanhamentos!",
      c: "Açaí Monte o Seu!!!",
      g: "loja",
      p: 20.00,
      po: 24.00,
      baseId: "nutella",
      tamanho: "500ml",
      isAcaiCustom: true,
      j: "202502271647_N364_i_v1_400.jpg",
      w4: "202502271647_N364_i_v1_400.webp",
      w6: "202502271647_N364_i_v1_600.webp",
      w8: "202502271647_N364_i_v1_800.webp",
      imgFit: "cover",
      imgRot: 0,
      imgPosX: 0,
      imgPosY: 0,
      imgScale: 100
    },
    {
      n: "Açaí com Leitinho - Copo 500ml",
      d: "Copo generoso de 500ml com açaí cremoso e creme sabor leitinho. Clique em Personalizar para adicionar cremes e acompanhamentos!",
      c: "Açaí Monte o Seu!!!",
      g: "loja",
      p: 20.00,
      po: 24.00,
      baseId: "leitinho",
      tamanho: "500ml",
      isAcaiCustom: true,
      j: "202502271647_N364_i_v1_400.jpg",
      w4: "202502271647_N364_i_v1_400.webp",
      w6: "202502271647_N364_i_v1_600.webp",
      w8: "202502271647_N364_i_v1_800.webp",
      imgFit: "cover",
      imgRot: 0,
      imgPosX: 0,
      imgPosY: 0,
      imgScale: 100
    }
  ];

  // Remove qualquer item anterior da categoria "Açaí Monte o Seu!!!"
  const outrosItens = d.itens.filter(i => i && i.c !== 'Açaí Monte o Seu!!!');
  // Coloca os 6 copos no início
  d.itens = [...seisCopos, ...outrosItens];

  // Atualiza acaiCustomizavel
  d.acaiCustomizavel = {
    ativo: true,
    titulo: "Monte o Seu Açaí",
    subtitulo: "Personalize com seus cremes e acompanhamentos favoritos!",
    tamanhos: [
      { id: "300ml", nome: "Copo 300ml", ml: 300, icone: "🥤", desc: "Perfeito para refrescar o seu dia" },
      { id: "500ml", nome: "Copo 500ml", ml: 500, icone: "🍧", desc: "O tamanho mais pedido da casa!" }
    ],
    bases: [
      {
        id: "tradicional",
        nome: "Açaí Tradicional",
        desc: "Puro açaí batido cremoso e refrescante.",
        img: "https://lolla-maringa.vercel.app/cardapios/fotos-v1/202502271647_N364_i_v1_400.jpg",
        precos: { "300ml": 15, "500ml": 18 },
        ativo: true
      },
      {
        id: "nutella",
        nome: "Açaí com Nutella",
        desc: "Açaí batido cremoso combinado com a legítima Nutella.",
        img: "https://lolla-maringa.vercel.app/cardapios/fotos-v1/202502271647_N364_i_v1_400.jpg",
        precos: { "300ml": 17, "500ml": 20 },
        ativo: true
      },
      {
        id: "leitinho",
        nome: "Açaí com Leitinho",
        desc: "Açaí especial com creme sabor leite em pó suave.",
        img: "https://lolla-maringa.vercel.app/cardapios/fotos-v1/202502271647_N364_i_v1_400.jpg",
        precos: { "300ml": 17, "500ml": 20 },
        ativo: true
      }
    ],
    acompanhamentos: [
      { id: "morango", nome: "Morango", preco: 4, img: "", icone: "🍓", ativo: true },
      { id: "uva", nome: "Uva", preco: 4, img: "", icone: "🍇", ativo: true },
      { id: "banana", nome: "Banana", preco: 4, img: "", icone: "🍌", ativo: true },
      { id: "ovomaltine", nome: "Ovomaltine", preco: 4, img: "", icone: "🍫", ativo: true },
      { id: "confeti", nome: "Confeti", preco: 4, img: "", icone: "🍬", ativo: true },
      { id: "leite-po", nome: "Leite em Pó", preco: 4, img: "", icone: "🥛", ativo: true },
      { id: "leite-cond", nome: "Leite Condensado", preco: 4, img: "", icone: "🍯", ativo: true },
      { id: "nutella-extra", nome: "Nutella Extra", preco: 8, img: "", icone: "🌰", ativo: true }
    ],
    cremes: [
      { id: "creme-cookies", nome: "Creme de Cookies", preco: 5, img: "", icone: "🍪", ativo: true },
      { id: "creme-trufado", nome: "Creme Trufado", preco: 5, img: "", icone: "🍫", ativo: true },
      { id: "creme-leitinho", nome: "Creme Leitinho", preco: 5, img: "", icone: "🥛", ativo: true },
      { id: "creme-pacoca", nome: "Creme de Paçoca", preco: 5, img: "", icone: "🥜", ativo: true }
    ]
  };

  // Garante destaquesMomento
  if (!Array.isArray(d.destaquesMomento) || d.destaquesMomento.length === 0) {
    d.destaquesMomento = [0, 3];
  }

  console.log(`2. Gravando data/cardapio.json localmente (${d.itens.length} itens)...`);
  const cardapioFile = path.join(__dirname, '../data/cardapio.json');
  fs.writeFileSync(cardapioFile, JSON.stringify(d, null, 2), 'utf8');

  console.log('3. Atualizando window.__CARDAPIO_DATA__ inline no index.html...');
  const indexFile = path.join(__dirname, '../index.html');
  let indexHtml = fs.readFileSync(indexFile, 'utf8');
  const inlineRegex = /window\.__CARDAPIO_DATA__\s*=\s*\{[\s\S]*?\};/;
  if (inlineRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(inlineRegex, `window.__CARDAPIO_DATA__ = ${JSON.stringify(d)};`);
    fs.writeFileSync(indexFile, indexHtml, 'utf8');
    console.log('index.html atualizado!');
  } else {
    console.warn('window.__CARDAPIO_DATA__ não encontrado no index.html');
  }

  console.log('4. Sincronizando com Supabase oficial...');
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
    console.log('✅ SUCESSO TOTAL! Os 6 copos de açaí foram aplicados e sincronizados em nuvem!');
  } else {
    console.error('Falha ao salvar no Supabase:', saveRes.status, await saveRes.text());
  }
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
