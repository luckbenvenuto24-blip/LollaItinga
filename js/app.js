/**
 * Cardápio Digital - Sorveteria Lolla
 * Reconstruído com Modo Lojista Protegido por Senha + Design Interativo
 */

const STORAGE_KEY_DATA = 'lolla_cardapio_data_v3';
const STORAGE_KEY_CONFIG = 'lolla_store_config_v3';
const STORAGE_KEY_TOKEN = 'lolla_admin_token_v3';
const STORAGE_KEY_NAV = 'lolla_nav_state_v1';
const STORAGE_KEY_CARRINHO = 'lolla_carrinho_v2';
let carrinho = [];

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

let isRestoringScroll = true;

// Configurações padrão da loja
let CONFIG = {
  nome: 'Sorveteria Lolla',
  whatsapp: '5544999432158',
  fotosBaseUrl: 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/',
  pedidoMinimo: 30.00
};

const PEDIDO_MINIMO_PADRAO = 30.00;

function getPedidoMinimo() {
  const v = CONFIG && CONFIG.pedidoMinimo;
  return (typeof v === 'number' && !isNaN(v) && v > 0) ? v : PEDIDO_MINIMO_PADRAO;
}

const DEFAULT_GALERIA = [
  { img: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80', legenda: 'Momentos doces na Lolla' },
  { img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', legenda: 'Sabores artesanais' },
  { img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80', legenda: 'Casquinhas crocantes' },
  { img: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=600&q=80', legenda: 'Alegria em cada colherada' }
];

const DEFAULT_DESTAQUE = {
  ativo: true,
  tag: '✨ Especial Sorveteria Lolla',
  titulo: 'Amor em Cada Colherada!',
  subtitulo: 'Conheça o segredo dos nossos sabores artesanais',
  texto: 'Na Sorveteria Lolla, cada pote, picolé e açaí é preparado com ingredientes selecionados para transformar o seu dia em um momento delicioso com quem você ama.\n\nAproveite nossos combos promocionais e peça sem sair de casa!',
  img: 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/202506101845_C6FC_i_v1_800.webp',
  botaoTexto: 'Pedir Especial no WhatsApp',
  mensagemZap: 'Olá! Vi o destaque especial no cardápio e quero fazer um pedido!'
};

const DEFAULT_CASQUINHAS = {
  ativo: true,
  titulo: 'PEÇA COMBOS PARA CURTIR COM OS AMIGOS',
  texto: 'Descubra a jornada dos nossos sorvetes e açaís artesanais, preparados com carinho e ingredientes selecionados. Dos clássicos favoritos às criações especiais, cada colherada conta uma história de sabor.',
  botaoTexto: 'PEÇA AGORA',
  img: 'assets/marca/seis-casquinhas.png'
};

const DEFAULT_ACAI_CONFIG = {
  ativo: true,
  titulo: 'Monte o Seu Açaí',
  subtitulo: 'Escolha o tamanho (300ml ou 500ml), o tipo de açaí e adicione quantos acompanhamentos e cremes desejar!',
  tamanhos: [
    { id: '300ml', nome: 'Copo 300ml', ml: 300, icone: '🥤', desc: 'Perfeito para refrescar o seu dia' },
    { id: '500ml', nome: 'Copo 500ml', ml: 500, icone: '🍧', desc: 'O tamanho mais pedido da casa!' }
  ],
  bases: [
    {
      id: 'tradicional',
      nome: 'Açaí Tradicional',
      desc: 'Puro açaí batido com textura aveludada e refrescante.',
      img: '/assets/marca/cat-acai-monte.webp',
      precos: { '300ml': 15.00, '500ml': 18.00 },
      ativo: true
    },
    {
      id: 'nutella',
      nome: 'Açaí com Nutella',
      desc: 'Açaí batido cremoso combinado com a legítima e deliciosa Nutella.',
      img: '/assets/marca/cat-acai-monte.webp',
      precos: { '300ml': 17.00, '500ml': 20.00 },
      ativo: true
    },
    {
      id: 'leitinho',
      nome: 'Açaí com Leitinho',
      desc: 'Açaí batido especial com creme sabor leite em pó suave.',
      img: '/assets/marca/cat-acai-monte.webp',
      precos: { '300ml': 17.00, '500ml': 20.00 },
      ativo: true
    }
  ],
  acompanhamentos: [
    { id: 'morango', nome: 'Morango', preco: 4.00, img: '', icone: '🍓', ativo: true },
    { id: 'uva', nome: 'Uva', preco: 4.00, img: '', icone: '🍇', ativo: true },
    { id: 'banana', nome: 'Banana', preco: 4.00, img: '', icone: '🍌', ativo: true },
    { id: 'ovomaltine', nome: 'Ovomaltine', preco: 4.00, img: '', icone: '🍫', ativo: true },
    { id: 'confeti', nome: 'Confeti', preco: 4.00, img: '', icone: '🍬', ativo: true },
    { id: 'leite-po', nome: 'Leite em Pó', preco: 4.00, img: '', icone: '🥛', ativo: true },
    { id: 'leite-cond', nome: 'Leite Condensado', preco: 4.00, img: '', icone: '🍯', ativo: true },
    { id: 'nutella-extra', nome: 'Nutella Extra', preco: 8.00, img: '', icone: '🌰', ativo: true }
  ],
  cremes: [
    { id: 'creme-cookies', nome: 'Creme de Cookies', preco: 5.00, img: '', icone: '🍪', ativo: true },
    { id: 'creme-trufado', nome: 'Creme Trufado', preco: 5.00, img: '', icone: '🍫', ativo: true },
    { id: 'creme-leitinho', nome: 'Creme Leitinho', preco: 5.00, img: '', icone: '🥛', ativo: true },
    { id: 'creme-pacoca', nome: 'Creme de Paçoca', preco: 5.00, img: '', icone: '🥜', ativo: true }
  ]
};

const DEFAULT_BLOG = [
  {
    data: 'Destaque da Loja · Sorvetes & Açaí',
    titulo: 'Monte o Seu Açaí do Jeito que VocêMais Gosta!',
    texto: 'Escolha o tamanho ideal (300ml, 500ml ou 700ml) e adicione seus acompanhamentos favoritos grátis. Cremoso na medida certa para refrescar o seu dia!',
    img: 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/202502271647_N364_i_v1_600.webp'
  },
  {
    data: 'Linha Pistache · Sabor Premium',
    titulo: 'A Paixão por Pistache Chegou com Tudo na Lolla',
    texto: 'Do Milkshake cremoso ao Picolé Supremo e Cone recheado com chocolate branco e pistache. Uma experiência irresistível para os fãs de sabores intensos.',
    img: 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/202506101835_N0PF_i_v1_600.webp'
  },
  {
    data: 'Para Toda a Família · Potes 2L',
    titulo: 'Potes e Gelatos para Compartilhar em Momentos Especiais',
    texto: 'Reúna a família e os amigos! Temos Gelato Italiano 2L, Potes Clássicos, Sorbet Zero Lactose e Linha Zero Açúcar prontos para entrega ou retirada.',
    img: 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/202502201727_8VQI_i_v1_600.webp'
  }
];

const DEFAULT_ICONES_NOSSOS_PRODUTOS = [
  { id: 'copao-acai', cat: 'Copão Açaí', label: 'Copão Açaí', img: '/assets/marca/cat-copao-acai.webp' },
  { id: 'copao', cat: 'Copão', label: 'Copão', img: '/assets/marca/cat-copao.webp' },
  { id: 'supremo', cat: 'Supremo', label: 'Supremo', img: '/assets/marca/cat-supremo.webp' },
  { id: 'picoles-premium', cat: 'Picolés Premium Spettacolo', label: 'Picolés Premium', img: '/assets/marca/cat-picoles-premium.webp' },
  { id: 'corneto', cat: 'Corneto', label: 'Corneto', img: '/assets/marca/cat-corneto.webp' },
  { id: 'picoles-cremosos', cat: 'Picolés Cremosos', label: 'Picolés Cremosos', img: '/assets/marca/cat-picoles-cremosos.webp' },
  { id: 'acai-monte', cat: 'Açaí Monte o Seu!!!', label: 'Açaí Monte o Seu', img: '/assets/marca/cat-acai-monte.webp' },
  { id: 'acai-pote', cat: 'Açaí no Pote!', label: 'Açaí no Pote', img: '/assets/marca/cat-acai-pote.webp' },
  { id: 'milkshakes', cat: 'Milkshake\'s', label: 'Milkshake\'s', img: '/assets/marca/cat-milkshakes.webp' }
];

try {
  const savedCfgV2 = localStorage.getItem('lolla_store_config_v2');
  if (savedCfgV2) CONFIG = { ...CONFIG, ...JSON.parse(savedCfgV2) };
  const savedCfg = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (savedCfg) CONFIG = { ...CONFIG, ...JSON.parse(savedCfg) };
} catch (e) {}

const $ = s => document.querySelector(s);
const norm = t => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const brl = v => (typeof v === 'number' ? v : parseFloat(v) || 0).toFixed(2).replace('.', ',');
const esc = t => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function normalizarParaBusca(str) {
  let s = String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/(\d+)[,.](\d+)/g, '$1.$2 $1,$2 $1$2');
  s = s.replace(/0\s*%/g, '0% zero');
  s = s.replace(/[^a-z0-9%]/g, ' ');
  s = s.replace(/\bpicoles\b/g, 'picole picoles');
  s = s.replace(/\bpotes\b/g, 'pote potes');
  s = s.replace(/\bmilkshakes\b/g, 'milkshake milkshakes');
  s = s.replace(/\bsorvetes\b/g, 'sorvete sorvetes');
  s = s.replace(/\bpaletas\b/g, 'paleta paletas');
  s = s.replace(/\bacais\b/g, 'acai acais');
  return ' ' + s.replace(/\s+/g, ' ').trim() + ' ';
}

function itemCorrespondeBusca(it, termoBusca) {
  const termoLimpo = String(termoBusca || '').trim();
  if (!termoLimpo) return true;

  const termoNorm = String(termoLimpo).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let palavras = termoNorm
    .replace(/(\d+)[,.](\d+)/g, '$1.$2')
    .replace(/[^a-z0-9%]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!palavras.length) return true;

  const stopWords = new Set(['de', 'do', 'da', 'com', 'e', 'o', 'a', 'em', 'no', 'na', 'para', 'pra', 'um', 'uma']);
  if (palavras.length > 1) {
    const semStop = palavras.filter(p => !stopWords.has(p));
    if (semStop.length > 0) palavras = semStop;
  }

  const grupoDesc = it.g === 'picoles' ? 'picole picoles' : it.g === 'potes' ? 'pote potes sorvete' : '';
  const textoItem = normalizarParaBusca([it.n, it.d, it.c, grupoDesc].join(' '));

  return palavras.every(palavra => {
    if (textoItem.includes(palavra)) return true;
    if (palavra.endsWith('s') && textoItem.includes(palavra.slice(0, -1))) return true;
    if (!palavra.endsWith('s') && textoItem.includes(palavra + 's')) return true;
    if (palavra === 'zero' && (textoItem.includes('zero') || textoItem.includes('0%'))) return true;
    if (palavra === '0%' && (textoItem.includes('0%') || textoItem.includes('zero'))) return true;
    if (palavra === 'litro' || palavra === 'litros') {
      if (textoItem.includes('2l') || textoItem.includes('1.5l') || textoItem.includes('1l')) return true;
    }
    return false;
  });
}

const GRUPOS = [
  ['todos', 'Tudo', ''],
  ['potes', 'Potes', 'pra levar'],
  ['picoles', 'Picolés', 'individuais'],
  ['loja', 'Copos & Shakes', 'na hora']
];

let grupo = 'todos';
let cat = 'Todas';
let busca = '';
let D = null;
let adminToken = sessionStorage.getItem(STORAGE_KEY_TOKEN) || localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem('lolla_admin_token') || '';
let isAdmin = false;
let editingIndex = -1;
let editingBlogIndex = -1;
let editingGaleriaIndex = -1;

const ZAP_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.3c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4.1 15 3.7 13.5 3.7 12c0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.2-8.3 8.2z"/>
  <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.8-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.4 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/>
</svg>`;

const RAIOS_DOODLE = `<svg class="secao-raios" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true">
  <path d="M6 18 L6 7"/>
  <path d="M14 21 L22 11"/>
  <path d="M18 27 L28 24"/>
</svg>`;

const EDIT_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
const TRASH_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
const EYE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;

const doGrupo = it => grupo === 'todos' || it.g === grupo;
const isCatOculta = c => Boolean(D && Array.isArray(D.catsOcultas) && D.catsOcultas.includes(c));

function inferirGrupoPadrao(nomeCat) {
  const n = norm(nomeCat || '');
  if (n.includes('picole') || n.includes('paleta') || n.includes('eskimo') || n.includes('bombom') || n.includes('mega') || n.includes('lollinho') || n.includes('moreninha') || n.includes('kids') || n.includes('spettacolo') || n.includes('pistache')) return 'picoles';
  if (n.includes('pote') || n.includes('gelato') || n.includes('2l') || n.includes('1,5l') || n.includes('litro') || n.includes('sorbet')) return 'potes';
  return 'loja';
}

function getGrupoDaCategoria(nomeCat) {
  if (!nomeCat) return 'loja';
  if (D && D.catsGrupo && D.catsGrupo[nomeCat]) {
    return D.catsGrupo[nomeCat];
  }
  if (D && Array.isArray(D.itens)) {
    const item = D.itens.find(it => it && it.c === nomeCat && it.g);
    if (item && item.g) return item.g;
  }
  return inferirGrupoPadrao(nomeCat);
}

function categoriaPertenceAoGrupo(nomeCat, grupoAlvo) {
  if (!nomeCat || grupoAlvo === 'todos') return true;
  const grpDefinido = getGrupoDaCategoria(nomeCat);
  if (grpDefinido === grupoAlvo) return true;
  if (D && Array.isArray(D.itens)) {
    return D.itens.some(it => it && it.c === nomeCat && it.g === grupoAlvo && (isAdmin || !it.oculto));
  }
  return false;
}

function ensureExtraData() {
  if (!D) return;
  if (D.config && typeof D.config === 'object') {
    if (D.config.nome) CONFIG.nome = D.config.nome;
    if (D.config.whatsapp) CONFIG.whatsapp = D.config.whatsapp;
    if (typeof D.config.pedidoMinimo === 'number' && D.config.pedidoMinimo > 0) {
      CONFIG.pedidoMinimo = D.config.pedidoMinimo;
    }
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(CONFIG));
    } catch (e) {}
  } else {
    D.config = { nome: CONFIG.nome, whatsapp: CONFIG.whatsapp, pedidoMinimo: getPedidoMinimo() };
  }
  if (!Array.isArray(D.cats)) {
    D.cats = [];
  }
  if (Array.isArray(D.itens)) {
    D.itens.forEach(it => {
      if (it && it.c && !D.cats.includes(it.c)) {
        D.cats.push(it.c);
      }
    });
  }
  if (!Array.isArray(D.catsOcultas)) {
    D.catsOcultas = [];
  }
  if (!D.catsGrupo || typeof D.catsGrupo !== 'object') {
    D.catsGrupo = {};
  }
  D.cats.forEach(c => {
    if (!D.catsGrupo[c]) {
      const item = D.itens.find(it => it && it.c === c && it.g);
      D.catsGrupo[c] = (item && item.g) ? item.g : inferirGrupoPadrao(c);
    }
  });
  if (!Array.isArray(D.galeria) || D.galeria.length < 4) {
    D.galeria = JSON.parse(JSON.stringify(DEFAULT_GALERIA));
  }
  if (!D.destaque || typeof D.destaque !== 'object') {
    D.destaque = JSON.parse(JSON.stringify(DEFAULT_DESTAQUE));
  }
  if (!D.casquinhas || typeof D.casquinhas !== 'object') {
    D.casquinhas = JSON.parse(JSON.stringify(DEFAULT_CASQUINHAS));
  }
  if (!Array.isArray(D.blog)) {
    D.blog = JSON.parse(JSON.stringify(DEFAULT_BLOG));
  }
  if (typeof D.blogAtivo !== 'boolean') {
    D.blogAtivo = true;
  }
  if (!D.acaiCustomizavel || typeof D.acaiCustomizavel !== 'object') {
    D.acaiCustomizavel = JSON.parse(JSON.stringify(DEFAULT_ACAI_CONFIG));
  }
  if (!Array.isArray(D.destaquesMomento)) {
    D.destaquesMomento = [0, 1, 2];
  }
  if (!Array.isArray(D.iconesNossosProdutos) || !D.iconesNossosProdutos.length) {
    D.iconesNossosProdutos = JSON.parse(JSON.stringify(DEFAULT_ICONES_NOSSOS_PRODUTOS));
  }
}

function toast(msg) {
  let el = $('#toast-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-msg';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visivel');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('visivel'), 3000);
}

function link(it) {
  const mensagem = `Olá! Vim pelo cardápio e quero pedir:\n\n*${it.n}*\nR$ ${brl(it.p)}`;
  return `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(mensagem);
}

function getImageTransformStyle(it) {
  if (!it) return '';
  const rot = Number(it.imgRot) || 0;
  const scale = (it.imgScale !== undefined && it.imgScale !== null && it.imgScale !== '') ? Number(it.imgScale) : 100;
  const x = Number(it.imgPosX) || 0;
  const y = Number(it.imgPosY) || 0;
  const fit = it.imgFit || 'cover';
  return `--img-rot:${rot}deg;--img-scale:${scale / 100};--img-x:${x}%;--img-y:${y}%;--img-fit:${fit};object-fit:${fit};`;
}

function resolveImageTag(it, i) {
  const st = getImageTransformStyle(it);
  const styleAttr = st ? ` style="${st}"` : '';
  if (it.img) {
    return `<img src="${it.img}" alt="${esc(it.n)}" width="400" height="400"
                 ${styleAttr}
                 loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async"
                 fetchpriority="${i < 2 ? 'high' : 'low'}">`;
  }
  if (it.w4) {
    return `<picture${styleAttr}>
      <source type="image/webp" sizes="(min-width:880px) 250px, (min-width:560px) 32vw, 47vw"
              srcset="${CONFIG.fotosBaseUrl}${it.w4} 400w, ${CONFIG.fotosBaseUrl}${it.w6} 600w, ${CONFIG.fotosBaseUrl}${it.w8} 800w">
      <img src="${CONFIG.fotosBaseUrl}${it.j}" alt="${esc(it.n)}" width="400" height="400"
           ${styleAttr}
           loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async"
           fetchpriority="${i < 2 ? 'high' : 'low'}">
    </picture>`;
  }
  return '<div style="display:grid;place-items:center;height:100%;font-size:36px">&#127846;</div>';
}

function renderGaleria() {
  const el = $('#galeria-topo');
  if (!el || !D || !D.galeria) return;
  const html = D.galeria.slice(0, 4).map((item, idx) => `
    <div class="galeria-item">
      <img src="${esc(item.img)}" alt="${esc(item.legenda || 'Sorveteria Lolla')}" loading="eager">
      <div class="card-admin-actions">
        <button class="btn-card-admin editar" title="Trocar foto da galeria" onclick="abrirModalGaleria(${idx})">${EDIT_ICON}</button>
      </div>
    </div>
  `).join('');
  if (el.dataset.lastHtml !== html) {
    el.innerHTML = html;
    el.dataset.lastHtml = html;
  }
}

function renderCasquinhas() {
  const el = $('#secao-casquinhas');
  if (!el || !D || !D.casquinhas) return;
  const casq = D.casquinhas;

  if (!casq.ativo && !isAdmin) {
    el.innerHTML = '';
    el.dataset.lastHtml = '';
    return;
  }

  const msgZap = casq.mensagemZap || `Olá! Vim pelo cardápio e quero fazer um pedido!`;
  const zapHref = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(msgZap);
  const opacoInativo = !casq.ativo ? 'style="opacity:0.62;border:2px dashed var(--magenta);border-radius:24px;padding:18px"' : '';
  const imgSrc = (casq.img || '/assets/marca/seis-casquinhas.png').replace(/^assets\//, '/assets/');

  const html = `
    <section class="casquinhas-secao" ${opacoInativo}>
      <div class="secao-admin-bar" style="margin-bottom:14px">
        ${!casq.ativo ? '<span class="aviso-oculto-admin">🙈 Seção Oculta para Clientes (Salva no sistema)</span>' : ''}
        <button class="btn-secao-admin ${!casq.ativo ? 'ativo-oculto' : ''}" onclick="alternarVisibilidadeCasquinhas()">
          ${casq.ativo ? '🙈 Ocultar Seção (Salvar p/ Depois)' : '👁️ Tornar Visível para Clientes'}
        </button>
        <button class="btn-secao-admin" onclick="abrirModalCasquinhas()">
          ✏️ Editar Texto / Botão / Foto
        </button>
        <button class="btn-secao-admin perigo" onclick="excluirSecaoCasquinhas()">
          🗑️ Excluir / Ocultar
        </button>
      </div>

      <div class="casquinhas-topo">
        <div class="casquinhas-titulo-col">
          <h2 class="casquinhas-titulo">${esc(casq.titulo)}</h2>
          <svg class="casquinhas-raios" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 18 L6 6"/>
            <path d="M13 21 L22 10"/>
            <path d="M17 26 L28 22"/>
          </svg>
        </div>
        <div class="casquinhas-desc-col">
          <svg class="casquinhas-estrela" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
            <path d="M20 4 L24.2 14.2 L35 15.2 L26.8 22.4 L29.2 33 L20 27.4 L10.8 33 L13.2 22.4 L5 15.2 L15.8 14.2 Z" fill="rgba(255,197,61,0.22)"/>
          </svg>
          <p class="casquinhas-desc">${esc(casq.texto)}</p>
        </div>
      </div>

      <div class="casquinhas-palco">
        <!-- Seta espiral desenhada à mão na esquerda -->
        <svg class="casquinhas-doodle-seta" viewBox="0 0 54 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M28 6 C14 14, 10 34, 24 36 C34 37, 36 25, 26 24 C16 23, 14 44, 34 52"/>
        </svg>

        <!-- Colher de sorvete desenhada à mão na direita -->
        <svg class="casquinhas-doodle-colher" viewBox="0 0 68 68" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 22 L6 14 M6 28 L2 26 M12 36 L6 40"/>
          <circle cx="28" cy="36" r="11" fill="rgba(255,197,61,0.35)"/>
          <path d="M20 42 C24 47, 34 47, 38 40"/>
          <path d="M36 28 L56 12 C59 10, 62 13, 60 16 L40 33"/>
        </svg>

        <img class="casquinhas-img" src="${esc(imgSrc)}" alt="Seis casquinhas de sorvete artesanais" loading="eager">

        <a class="casquinhas-btn" href="${zapHref}" target="_blank" rel="noopener">
          ${esc(casq.botaoTexto || 'PEÇA AGORA')}
        </a>
      </div>
    </section>
  `;

  if (el.dataset.lastHtml !== html) {
    el.innerHTML = html;
    el.dataset.lastHtml = html;
  }
}

function renderDestaque() {
  const el = $('#secao-destaque');
  if (!el || !D || !D.destaque) return;
  const dest = D.destaque;

  if (!dest.ativo && !isAdmin) {
    el.innerHTML = '';
    return;
  }

  const zapHref = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(dest.mensagemZap || `Olá! Quero saber mais sobre: ${dest.titulo}`);
  const opacoInativo = !dest.ativo ? 'style="opacity:0.62;border:2px dashed var(--magenta)"' : '';

  el.innerHTML = `
    <div class="destaque-wrap">
      <div class="secao-admin-bar" style="margin-bottom:10px">
        ${!dest.ativo ? '<span class="aviso-oculto-admin">🙈 Card de Destaque Oculto para Clientes (Salvo)</span>' : ''}
        <button class="btn-secao-admin ${!dest.ativo ? 'ativo-oculto' : ''}" onclick="alternarVisibilidadeDestaque()">
          ${dest.ativo ? '🙈 Ocultar Card (Salvar p/ Depois)' : '👁️ Tornar Visível para Clientes'}
        </button>
        <button class="btn-secao-admin" onclick="abrirModalDestaque()">
          ✏️ Editar Card de Destaque
        </button>
      </div>
      <div class="destaque-card" ${opacoInativo}>
        <div class="destaque-foto-wrap">
          <div class="destaque-foto">
            <img src="${esc(dest.img)}" alt="${esc(dest.titulo)}" loading="lazy">
          </div>
          <svg class="destaque-doodle" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
            <path d="M12 46 C26 52, 46 38, 36 22 C28 10, 14 24, 26 32 C38 40, 52 24, 54 10"/>
          </svg>
        </div>
        <div class="destaque-texto">
          ${dest.tag ? `<span class="destaque-tag">${esc(dest.tag)}</span>` : ''}
          <h2>${esc(dest.titulo)}</h2>
          ${dest.subtitulo ? `<p class="destaque-sub">${esc(dest.subtitulo)}</p>` : ''}
          <p class="destaque-msg">${esc(dest.texto)}</p>
          <a class="destaque-btn" href="${zapHref}" target="_blank" rel="noopener">
            ${ZAP_ICON} ${esc(dest.botaoTexto || 'Pedir pelo WhatsApp')}
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderBlog() {
  const el = $('#secao-blog');
  if (!el || !D || !Array.isArray(D.blog)) return;

  const postsVisiveis = isAdmin ? D.blog.map((p, idx) => ({ p, idx })) : D.blog.map((p, idx) => ({ p, idx })).filter(({ p }) => !p.oculto);

  if ((!D.blogAtivo || !postsVisiveis.length) && !isAdmin) {
    el.innerHTML = '';
    return;
  }

  const cardsHtml = postsVisiveis.map(({ p: post, idx }) => `
    <article class="blog-card ${post.oculto ? 'card-oculto' : ''}" onclick="abrirLeituraBlog(${idx})">
      <div class="card-admin-actions" onclick="event.stopPropagation()">
        <button class="btn-card-admin ocultar" title="${post.oculto ? 'Mostrar para clientes' : 'Ocultar card (salvar p/ depois)'}" onclick="alternarOcultarBlog(${idx})">${post.oculto ? EYE_OFF_ICON : EYE_ICON}</button>
        <button class="btn-card-admin editar" title="Editar post" onclick="abrirModalBlog(${idx})">${EDIT_ICON}</button>
        <button class="btn-card-admin excluir" title="Excluir post" onclick="removerBlog(${idx})">${TRASH_ICON}</button>
      </div>
      <div class="blog-foto">
        <img src="${esc(post.img)}" alt="${esc(post.titulo)}" loading="lazy">
      </div>
      <div class="blog-meta">${post.oculto ? '🙈 OCULTO · ' : ''}${esc(post.data || 'Novidade Lolla')}</div>
      <h3 class="blog-titulo">${esc(post.titulo)}</h3>
      <p class="blog-resumo">${esc(post.texto)}</p>
      <span class="blog-ler">Ler mais <span>→</span></span>
    </article>
  `).join('');

  el.innerHTML = `
    <section class="blog-secao" ${!D.blogAtivo ? 'style="opacity:0.62;border:2px dashed var(--magenta);border-radius:24px;padding:16px"' : ''}>
      <div class="blog-cabeca">
        <div class="secao-admin-bar" style="margin-bottom:10px">
          ${!D.blogAtivo ? '<span class="aviso-oculto-admin">🙈 Mural Inteiro Oculto para Clientes</span>' : ''}
          <button class="btn-secao-admin ${!D.blogAtivo ? 'ativo-oculto' : ''}" onclick="alternarVisibilidadeMural()">
            ${D.blogAtivo ? '🙈 Ocultar Mural Inteiro' : '👁️ Mostrar Mural para Clientes'}
          </button>
          <button class="btn-secao-admin" onclick="abrirModalBlog(-1)">➕ Adicionar Card no Mural</button>
        </div>
        <h2>Novidades & Momentos ${RAIOS_DOODLE}</h2>
        <p>Fique por dentro das nossas dicas, avisos especiais e lançamentos</p>
      </div>
      <div class="blog-grade">${cardsHtml}</div>
    </section>
  `;
}

function formatProduct(it) {
  let raw = (it.n || '').trim();
  let desc = (it.d || '').trim();
  let clean = raw;
  let size = '';

  // Detecta e extrai tamanho / volume / peso (ex: 300ml, 500ml, 700ml, 1,5L, 2L, 85g, 75g)
  const sizeM = raw.match(/(\d+(?:[.,]\d+)?\s*(?:ml|l|litros?|g|kg)\b)/i) || 
                desc.match(/(\d+(?:[.,]\d+)?\s*(?:ml|l|litros?|g|kg)\b)/i);
  if (sizeM) {
    let s = sizeM[1].toLowerCase().replace(/\s+/, '');
    if (s.endsWith('ml')) size = s.toUpperCase();
    else if (s.endsWith('kg')) size = s.toUpperCase();
    else if (s.endsWith('g')) size = s.toUpperCase();
    else if (s.includes('l')) size = s.replace('l', '').replace('itro', '').replace('itros', '') + ' Litros';
  }

  // Limpa o nome principal removendo ruídos
  clean = raw
    .replace(/c\/\s*até\s*\d+\s*acompanhamentos?\s*grátis!?/gi, '')
    .replace(/-\s*copo\s*\d+\s*ml/gi, '')
    .replace(/\(\s*\d+\s*g\s*\)/gi, '')
    .replace(/pote\s*\d+(?:[.,]\d+)?\s*l\s*-/gi, 'Pote')
    .replace(/!+/g, '')
    .replace(/-\s*escolha o sabor!?/gi, '')
    .trim();

  // Enriquece nomes genéricos com o sabor extraído da descrição
  if (/^milkshake\s*\d+ml$/i.test(clean)) {
    const flavMatch = desc.match(/milkshake\s*(?:de)?\s*\d+ml\s*(?:de)?\s*([a-zá-ú\s]+)/i);
    if (flavMatch && flavMatch[1].trim()) {
      clean = 'Milkshake ' + flavMatch[1].trim();
    }
  } else if (/^pote açai/i.test(clean) && /c\/\s*([a-zá-ú\s]+)\s+em pote/i.test(desc)) {
    const flav = desc.match(/c\/\s*([a-zá-ú\s]+)\s+em pote/i)[1].trim();
    clean = 'Pote Açaí c/ ' + flav;
  } else if (/^paleta mexicana$/i.test(clean) && desc.length < 30 && !desc.includes('.')) {
    clean = 'Paleta Mexicana - ' + desc;
  } else if (/^(picole cremoso|picolé cobertura|corneto|supremo|copão|copão açaí|sorvete moreninha)$/i.test(clean) && desc.length < 35 && !desc.includes('.')) {
    clean = clean + ' - ' + desc;
  }

  return { title: clean.toUpperCase(), size, desc };
}

function card(it, i, itemIndex) {
  const p = parseFloat(it.p) || 0;
  const po = parseFloat(it.po) || 0;
  const off = po > p ? Math.round((1 - p / po) * 100) : 0;
  const imgHtml = resolveImageTag(it, i);
  const oculto = Boolean(it.oculto);
  const { title, size, desc } = formatProduct(it);
  const isAcai = Boolean(it.isAcaiCustom || it.c === 'Açaí Monte o Seu!!!');
  const isDestaque = Array.isArray(D.destaquesMomento) && (D.destaquesMomento.includes(itemIndex) || D.destaquesMomento.includes(it.n));

  return `<article class="card ${oculto ? 'card-oculto' : ''}" data-idx="${itemIndex}" style="animation-delay:${Math.min(i, 11) * 28}ms">
    <div class="foto" style="${getImageTransformStyle(it)}">
      ${imgHtml}
      ${it.disponibilidade === 'esgotado' || it.esgotado ? '<span class="off" style="background:#CF1322">🔴 Esgotado</span>' : (it.disponibilidade === 'temporariamente_indisponivel' ? '<span class="off" style="background:#D48806">🟡 Indisponível</span>' : (off ? `<span class="off">-${off}%</span>` : ''))}
      ${isDestaque ? '<span class="badge-destaque-produto">⭐ Destaque</span>' : ''}
      <div class="card-admin-actions">
        <button type="button" class="btn-card-admin destaque-toggle ${isDestaque ? 'ativo' : ''}" title="${isDestaque ? 'Remover dos destaques da semana' : 'Colocar nos destaques da semana'}" onclick="alternarDestaqueProduto(${itemIndex})">${isDestaque ? '⭐' : '☆'}</button>
        <button type="button" class="btn-card-admin ocultar" title="${oculto ? 'Tornar visível para clientes' : 'Ocultar produto (manter salvo)'}" onclick="alternarOcultarProduto(${itemIndex})">${oculto ? EYE_OFF_ICON : EYE_ICON}</button>
        <button type="button" class="btn-card-admin editar" title="Editar produto" onclick="abrirModalEditar(${itemIndex})">${EDIT_ICON}</button>
        <button type="button" class="btn-card-admin excluir" title="Excluir produto" onclick="removerProduto(${itemIndex})">${TRASH_ICON}</button>
      </div>
    </div>
    <div class="corpo">
      ${oculto ? '<div style="margin-bottom:4px"><span class="aviso-oculto-admin">🙈 Produto Oculto</span></div>' : ''}
      <h3 class="nome" title="${esc(it.n)}">${esc(title)}</h3>
      ${size ? `<span class="prod-tag-tamanho">${esc(size)}</span>` : ''}
      <p class="desc">${esc(desc || 'Sabor artesanal preparado com ingredientes selecionados.')}</p>
      
      <div class="card-admin-botoes-texto">
        <button type="button" class="btn-card-txt ${isDestaque ? 'destacado' : ''}" onclick="alternarDestaqueProduto(${itemIndex})" title="Destacar este produto no topo do site">${isDestaque ? '⭐ No Destaque' : '☆ Destacar'}</button>
        <button type="button" class="btn-card-txt editar" onclick="abrirModalEditar(${itemIndex})">✏️ Editar</button>
        <button type="button" class="btn-card-txt duplicar" onclick="duplicarProduto(${itemIndex})" title="Criar cópia deste produto nesta categoria">📋 Duplicar</button>
        <button type="button" class="btn-card-txt ocultar" onclick="alternarOcultarProduto(${itemIndex})">${oculto ? '👁️ Mostrar' : '🙈 Ocultar'}</button>
        <button type="button" class="btn-card-txt excluir" onclick="removerProduto(${itemIndex})">🗑️</button>
      </div>

      <div class="rodape-card">
        <div class="precos">
          <span class="preco-atual"><small>${isAcai ? 'A partir de ' : ''}R$</small> ${brl(p)}</span>
          ${off ? `<span class="preco-antigo">R$ ${brl(po)}</span>` : ''}
        </div>
        <div class="card-acoes-dupla">
          ${(it.disponibilidade === 'esgotado' || it.esgotado) ? `
            <button type="button" class="btn-pedir-zap disabled" style="background:#8c8c8c;cursor:not-allowed;width:100%" disabled>
              🚫 Esgotado
            </button>
          ` : (it.disponibilidade === 'temporariamente_indisponivel') ? `
            <button type="button" class="btn-pedir-zap disabled" style="background:#8c8c8c;cursor:not-allowed;width:100%" disabled>
              ⏳ Temporariamente Indisponível
            </button>
          ` : isAcai ? `
            <button type="button" class="btn-pedir-zap" onclick="abrirModalMontarAcai('${it.baseId || 'tradicional'}', '${it.tamanho || '500ml'}', ${itemIndex})" style="background:#4A0E4E;box-shadow:0 4px 12px rgba(74,14,78,.35)">
              🍧 Personalizar e Pedir
            </button>
            <button type="button" class="btn-pedir-add" onclick="abrirModalMontarAcai('${it.baseId || 'tradicional'}', '${it.tamanho || '500ml'}', ${itemIndex})">
              🛒 Montar Açaí
            </button>
          ` : `
            <button type="button" class="btn-pedir-zap" onclick="pedirItemWhatsApp(${itemIndex}, event)" aria-label="Pedir ${esc(it.n)} pelo WhatsApp">
              ${ZAP_ICON} Pedir no WhatsApp
            </button>
            <button type="button" class="btn-pedir-add" onclick="adicionarAoPedido(${itemIndex}, event)" title="Adicionar ao pedido">
              🛒 Adicionar ao pedido
            </button>
          `}
        </div>
      </div>
    </div>
  </article>`;
}

function renderDestaquesMomento() {
  const el = $('#grade-destaques-momento');
  if (!el || !D || !D.itens) return;

  let destaques = [];
  
  // 1. Busca produtos selecionados pelo administrador
  if (Array.isArray(D.destaquesMomento) && D.destaquesMomento.length > 0) {
    destaques = D.destaquesMomento.map(idOrIndex => {
      if (typeof idOrIndex === 'number' && D.itens[idOrIndex]) return D.itens[idOrIndex];
      return D.itens.find(it => it && (it.id === idOrIndex || it.n === idOrIndex));
    }).filter(Boolean);
  }

  // 2. Fallback inteligente: se nenhum configurado, pega com desconto ou primeiros da lista
  if (!destaques.length) {
    const comOff = D.itens.filter(it => it.po > it.p);
    destaques = comOff.slice(0, 3);
  }
  if (!destaques.length) {
    destaques = D.itens.slice(0, 3);
  }

  el.innerHTML = destaques.map((it, idx) => {
    const itemIndex = D.itens.indexOf(it);
    const p = parseFloat(it.p) || 0;
    const po = parseFloat(it.po) || 0;
    const off = po > p ? Math.round((1 - p / po) * 100) : 0;
    const { title, size, desc } = formatProduct(it);
    const imgHtml = resolveImageTag(it, idx);
    const isAcai = Boolean(it.isAcaiCustom || it.c === 'Açaí Monte o Seu!!!');

    return `
      <div class="destaque-momento-card">
        <div class="destaque-momento-foto" style="${getImageTransformStyle(it)}">
          ${imgHtml}
          ${off ? `<span class="off">-${off}%</span>` : ''}
          <span class="badge-destaque-produto">⭐ Destaque</span>
        </div>
        <div class="destaque-momento-info">
          <h3 class="destaque-momento-nome">${esc(title)}</h3>
          ${size ? `<span class="destaque-momento-tamanho">${esc(size)}</span>` : ''}
          <p class="destaque-momento-desc">${esc(desc)}</p>
          <div class="destaque-momento-precos">
            <span class="preco-atual"><small>${isAcai ? 'A partir de ' : ''}R$</small> ${brl(p)}</span>
            ${off ? `<span class="preco-antigo">R$ ${brl(po)}</span>` : ''}
          </div>
          <div class="destaque-momento-botoes">
            ${(it.disponibilidade === 'esgotado' || it.esgotado) ? `
              <button type="button" class="btn-pedir-zap disabled" style="background:#8c8c8c;cursor:not-allowed;width:100%" disabled>
                🚫 Esgotado
              </button>
            ` : (it.disponibilidade === 'temporariamente_indisponivel') ? `
              <button type="button" class="btn-pedir-zap disabled" style="background:#8c8c8c;cursor:not-allowed;width:100%" disabled>
                ⏳ Indisponível
              </button>
            ` : isAcai ? `
              <button type="button" class="btn-pedir-zap" onclick="abrirModalMontarAcai('${it.baseId || 'tradicional'}', '${it.tamanho || '500ml'}', ${itemIndex})" style="background:#4A0E4E">
                🍧 Personalizar e Pedir
              </button>
              <button type="button" class="btn-pedir-add" onclick="abrirModalMontarAcai('${it.baseId || 'tradicional'}', '${it.tamanho || '500ml'}', ${itemIndex})">
                🛒 Montar Açaí
              </button>
            ` : `
              <button type="button" class="btn-pedir-zap" onclick="pedirItemWhatsApp(${itemIndex}, event)">
                ${ZAP_ICON} Pedir no WhatsApp
              </button>
              <button type="button" class="btn-pedir-add" onclick="adicionarAoPedido(${itemIndex}, event)">
                🛒 Adicionar ao pedido
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================
 * ANIMAÇÃO E-COMMERCE: PRODUTO VOANDO ATÉ O CARRINHO
 * ========================================================== */

function animarProdutoAteCarrinho(imgOriginal, it, btnClicked) {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof document.createElement !== 'function') return;

  const startRect = imgOriginal ? imgOriginal.getBoundingClientRect() : (btnClicked ? btnClicked.getBoundingClientRect() : null);
  if (!startRect || startRect.width === 0 || startRect.height === 0) return;

  // Destino: Ícone do carrinho (fixo ou flutuante)
  const btnFlut = document.querySelector('#btn-meu-pedido-flutuante');
  const flutVisivel = btnFlut && btnFlut.classList.contains('visivel');
  const cartBtn = flutVisivel
    ? btnFlut
    : (document.querySelector('.btn-meu-pedido-topo') || document.querySelector('#hero-nav-zap'));
  const targetEl = (cartBtn && cartBtn.querySelector('.icone-carrinho')) || cartBtn;

  let targetX = window.innerWidth - 55;
  let targetY = 24;
  if (targetEl) {
    const tRect = targetEl.getBoundingClientRect();
    if (tRect.bottom > 0 && tRect.top < window.innerHeight) {
      targetX = tRect.left + tRect.width / 2;
      targetY = tRect.top + tRect.height / 2;
    }
  }

  const startW = Math.min(95, Math.round(startRect.width * 0.72));
  const startH = startW;
  const startX = Math.round(startRect.left + startRect.width / 2 - startW / 2);
  const startY = Math.round(startRect.top + startRect.height / 2 - startH / 2);

  const flyEl = document.createElement('div');
  flyEl.className = 'produto-voando-clone';
  flyEl.setAttribute('aria-hidden', 'true');
  flyEl.style.width = `${startW}px`;
  flyEl.style.height = `${startH}px`;
  flyEl.style.left = `${startX}px`;
  flyEl.style.top = `${startY}px`;

  let imgSrc = imgOriginal ? (imgOriginal.currentSrc || imgOriginal.src || '') : '';
  if (!imgSrc && it) imgSrc = it.img || (it.j ? CONFIG.fotosBaseUrl + it.j : '');

  if (imgSrc) {
    const flyImg = document.createElement('img');
    flyImg.src = imgSrc;
    flyImg.alt = '';
    flyEl.appendChild(flyImg);
  } else {
    flyEl.innerHTML = '<span style="font-size:24px">🍨</span>';
  }

  document.body.appendChild(flyEl);

  const dx = Math.round(targetX - (startX + startW / 2));
  const dy = Math.round(targetY - (startY + startH / 2));

  // 3 Keyframes ultra leves e rápidos acelerados 100% na GPU (Zero travamento)
  const keyframes = [
    { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)', opacity: 1 },
    { transform: `translate3d(${Math.round(dx * 0.45)}px, ${Math.round(dy * 0.35 - 45)}px, 0) scale(0.68) rotate(8deg)`, opacity: 0.95, offset: 0.5 },
    { transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.15) rotate(16deg)`, opacity: 0 }
  ];

  if (typeof flyEl.animate === 'function') {
    const anim = flyEl.animate(keyframes, {
      duration: 360,
      easing: 'cubic-bezier(0.2, 0.9, 0.35, 1)',
      fill: 'forwards'
    });
    anim.onfinish = () => {
      try { flyEl.remove(); } catch (e) {}
    };
  }

  setTimeout(() => {
    try { flyEl.remove(); } catch (e) {}
  }, 420);
}

/* ==========================================================
 * GERENCIADOR DO CARRINHO (GAVETA LATERAL DIREITA & WHATSAPP)
 * ========================================================== */

function carregarCarrinho() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARRINHO) || sessionStorage.getItem(STORAGE_KEY_CARRINHO);
    if (!raw) return [];
    let arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];

    // Auto-preenchimento e reparo de dados caso venha de versão anterior
    if (D && Array.isArray(D.itens)) {
      arr.forEach(item => {
        if (typeof item.itemIndex === 'number' && D.itens[item.itemIndex]) {
          const it = D.itens[item.itemIndex];
          const fmt = formatProduct(it);
          if (!item.desc) item.desc = fmt.desc || it.d || '';
          if (!item.nomeCompleto) item.nomeCompleto = it.n || '';
          if (!item.tamanho && fmt.size) item.tamanho = fmt.size;
        }
      });
    }
    return arr;
  } catch (e) {
    return [];
  }
}

function salvarCarrinho() {
  try {
    const json = JSON.stringify(carrinho);
    localStorage.setItem(STORAGE_KEY_CARRINHO, json);
    sessionStorage.setItem(STORAGE_KEY_CARRINHO, json);
  } catch (e) {}
}

function totalItensCarrinho() {
  return carrinho.reduce((acc, it) => acc + (parseInt(it.qtd, 10) || 1), 0);
}

function valorTotalCarrinho() {
  return carrinho.reduce((acc, it) => acc + ((parseFloat(it.preco) || 0) * (parseInt(it.qtd, 10) || 1)), 0);
}

function atualizarBadgeCarrinho() {
  const total = totalItensCarrinho();
  const totalVal = valorTotalCarrinho();

  const badgeEl = $('#badge-carrinho-qtd');
  if (badgeEl) badgeEl.textContent = total;

  const badgeFlut = $('#badge-carrinho-flutuante-qtd');
  if (badgeFlut) badgeFlut.textContent = total;

  const valorFlut = $('#valor-carrinho-flutuante');
  if (valorFlut) {
    if (total > 0 && totalVal > 0) {
      valorFlut.textContent = `· R$ ${brl(totalVal)}`;
      valorFlut.style.display = 'inline';
    } else {
      valorFlut.textContent = '';
      valorFlut.style.display = 'none';
    }
  }

  const subtitulo = $('#carrinho-subtitulo');
  if (subtitulo) {
    subtitulo.textContent = total === 1 ? '1 item adicionado' : `${total} itens adicionados`;
  }

  atualizarVisibilidadeCarrinhoFlutuante();
}

function atualizarVisibilidadeCarrinhoFlutuante() {
  const btnFlut = $('#btn-meu-pedido-flutuante');
  if (!btnFlut) return;
  const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  
  // O botão flutuante segue a tela quando o usuário rolar além do cabeçalho (> 70px)
  if (scrollY > 70) {
    btnFlut.classList.add('visivel');
  } else {
    btnFlut.classList.remove('visivel');
  }
}


window.abrirCarrinho = function(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  const drawer = $('#drawer-carrinho');
  if (!drawer) return;
  renderCarrinho();
  drawer.classList.add('aberto');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

window.fecharCarrinho = function() {
  const drawer = $('#drawer-carrinho');
  if (!drawer) return;
  drawer.classList.remove('aberto');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

window.alterarQtdCarrinho = function(index, delta) {
  if (!carrinho[index]) return;
  carrinho[index].qtd = (parseInt(carrinho[index].qtd, 10) || 1) + delta;
  if (carrinho[index].qtd <= 0) {
    const nomeRemovido = carrinho[index].nome || 'Item';
    carrinho.splice(index, 1);
    toast(`🗑️ ${nomeRemovido} removido do carrinho`);
  }
  salvarCarrinho();
  atualizarBadgeCarrinho();
  renderCarrinho();
};

window.removerDoCarrinho = function(index) {
  if (!carrinho[index]) return;
  const nomeRemovido = carrinho[index].nome || 'Item';
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarBadgeCarrinho();
  renderCarrinho();
  toast(`🗑️ ${nomeRemovido} excluído do carrinho`);
};

function renderCarrinho() {
  const corpo = $('#carrinho-lista-itens');
  const totalEl = $('#carrinho-total-valor');
  const resumoQtdEl = $('#carrinho-resumo-qtd');
  const btnZap = $('#btn-enviar-carrinho-zap');
  const btnTextoEl = $('#btn-enviar-carrinho-texto');
  const avisoMinimoEl = $('#carrinho-aviso-minimo');
  if (!corpo) return;

  atualizarBadgeCarrinho();

  const totalVal = valorTotalCarrinho();
  const totalQtd = totalItensCarrinho();
  const pedidoMin = getPedidoMinimo();
  const faltaMinimo = Math.max(0, pedidoMin - totalVal);
  const bateuMinimo = totalVal >= pedidoMin;
  const pctProgresso = Math.min(100, Math.round((totalVal / pedidoMin) * 100));

  if (totalEl) totalEl.textContent = `R$ ${brl(totalVal)}`;
  if (resumoQtdEl) resumoQtdEl.textContent = totalQtd === 1 ? '1 item' : `${totalQtd} itens`;

  if (avisoMinimoEl) {
    if (!carrinho || carrinho.length === 0) {
      avisoMinimoEl.innerHTML = `
        <div class="meta-minimo-card info">
          <div class="meta-minimo-topo">
            <span>🛵 Pedido mínimo para entrega:</span>
            <strong>R$ ${brl(pedidoMin)}</strong>
          </div>
        </div>
      `;
    } else if (!bateuMinimo) {
      avisoMinimoEl.innerHTML = `
        <div class="meta-minimo-card alerta">
          <div class="meta-minimo-topo">
            <span>🛵 Pedido mínimo: <strong>R$ ${brl(pedidoMin)}</strong></span>
            <span class="meta-minimo-falta">Faltam <strong>R$ ${brl(faltaMinimo)}</strong></span>
          </div>
          <div class="meta-minimo-barra-trilha">
            <div class="meta-minimo-barra-preenchimento" style="width:${pctProgresso}%"></div>
          </div>
          <div class="meta-minimo-dica">Adicione mais R$ ${brl(faltaMinimo)} para liberar o envio pelo WhatsApp!</div>
        </div>
      `;
    } else {
      avisoMinimoEl.innerHTML = `
        <div class="meta-minimo-card sucesso">
          <div class="meta-minimo-topo">
            <span>🎉 Pedido mínimo atingido!</span>
            <span class="meta-minimo-ok">Liberado p/ WhatsApp</span>
          </div>
          <div class="meta-minimo-barra-trilha">
            <div class="meta-minimo-barra-preenchimento sucesso" style="width:100%"></div>
          </div>
        </div>
      `;
    }
  }

  if (!carrinho || carrinho.length === 0) {
    if (btnZap) {
      btnZap.disabled = true;
      btnZap.style.opacity = '0.5';
      btnZap.style.pointerEvents = 'none';
      if (btnTextoEl) btnTextoEl.textContent = 'Adicione itens ao pedido';
    }
    corpo.innerHTML = `
      <div class="carrinho-vazio-estado">
        <div class="carrinho-vazio-icone">🍦</div>
        <h3>Seu carrinho está vazio</h3>
        <p>Você ainda não adicionou nenhum item. Escolha seus sabores favoritos e adicione ao pedido!</p>
        <button type="button" class="btn-explorar-produtos" onclick="fecharCarrinho()">
          Ver Cardápio de Sorvetes →
        </button>
      </div>
    `;
    return;
  }

  if (btnZap) {
    if (!bateuMinimo) {
      btnZap.disabled = false;
      btnZap.style.opacity = '0.7';
      btnZap.style.background = '#8B263E';
      btnZap.style.boxShadow = 'none';
      btnZap.style.cursor = 'not-allowed';
      btnZap.style.pointerEvents = 'auto';
      if (btnTextoEl) btnTextoEl.textContent = `Faltam R$ ${brl(faltaMinimo)} (Mínimo R$ ${brl(pedidoMin)})`;
    } else {
      btnZap.disabled = false;
      btnZap.style.opacity = '1';
      btnZap.style.background = '#008A45';
      btnZap.style.boxShadow = '0 6px 18px rgba(0,138,69,0.3)';
      btnZap.style.cursor = 'pointer';
      btnZap.style.pointerEvents = 'auto';
      if (btnTextoEl) btnTextoEl.textContent = 'Enviar Pedido para a Empresa';
    }
  }

  corpo.innerHTML = carrinho.map((item, idx) => {
    const subtotal = (parseFloat(item.preco) || 0) * (parseInt(item.qtd, 10) || 1);
    const imgStyle = getImageTransformStyle(item);
    const imgTag = item.img
      ? `<img src="${esc(item.img)}" alt="${esc(item.nome)}" style="${imgStyle}">`
      : `<span style="font-size:24px">🍨</span>`;

    // Detalhes extras do produto
    let extraInfo = '';
    if (item.nomeCompleto && item.nomeCompleto !== item.nome) {
      const semNome = item.nomeCompleto.replace(new RegExp(item.nome, 'i'), '').trim();
      const limpo = semNome.replace(/^[-\s,]+/, '').trim();
      if (limpo && limpo.length > 3) {
        extraInfo = limpo;
      }
    }

    return `
      <div class="carrinho-item-card">
        <div class="carrinho-item-foto" style="${imgStyle}">
          ${imgTag}
        </div>
        <div class="carrinho-item-info">
          <div class="carrinho-item-topo">
            <h4 class="carrinho-item-nome" title="${esc(item.nome)}">${esc(item.nome)}</h4>
            <button type="button" class="btn-remover-item" onclick="removerDoCarrinho(${idx})" title="Excluir ${esc(item.nome)} do carrinho" aria-label="Excluir item">✕</button>
          </div>

          <div class="carrinho-item-tags">
            ${item.tamanho ? `<span class="carrinho-item-tam">${esc(item.tamanho)}</span>` : ''}
            ${extraInfo ? `<span class="carrinho-item-extra">${esc(extraInfo)}</span>` : ''}
          </div>

          ${item.desc ? `<p class="carrinho-item-desc" title="${esc(item.desc)}">${esc(item.desc)}</p>` : ''}

          <div class="carrinho-item-baixo">
            <div class="carrinho-qtd-controles">
              <button type="button" class="btn-qtd" onclick="alterarQtdCarrinho(${idx}, -1)" title="Diminuir quantidade" aria-label="Diminuir">−</button>
              <span class="carrinho-qtd-num">${item.qtd}</span>
              <button type="button" class="btn-qtd" onclick="alterarQtdCarrinho(${idx}, 1)" title="Aumentar quantidade" aria-label="Aumentar">+</button>
            </div>
            <div class="carrinho-item-precos">
              <span class="carrinho-item-subtotal">R$ ${brl(subtotal)}</span>
              ${item.qtd > 1 ? `<small class="carrinho-item-unit">R$ ${brl(item.preco)} un</small>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.enviarPedidoWhatsApp = function() {
  if (!carrinho || carrinho.length === 0) {
    toast('⚠️ Seu carrinho está vazio! Adicione algum produto antes de enviar.');
    return;
  }

  const totalVal = valorTotalCarrinho();
  const pedidoMin = getPedidoMinimo();
  if (totalVal < pedidoMin) {
    const falta = pedidoMin - totalVal;
    toast(`⚠️ O pedido mínimo para entrega é de R$ ${brl(pedidoMin)}. Faltam apenas R$ ${brl(falta)}! Adicione mais itens para continuar.`);
    return;
  }

  const itensTexto = carrinho.map((item, i) => {
    const unit = brl(item.preco);
    const sub = brl(item.preco * item.qtd);
    const tam = item.tamanho ? ` [Tamanho: ${item.tamanho}]` : '';

    let bloco = `*${i + 1}. ${item.qtd}x ${item.nome}${tam}*\n` +
                `   💵 Subtotal: R$ ${sub} (R$ ${unit} un)`;

    if (item.desc && item.desc.trim()) {
      bloco += `\n   📝 Sabor/Descrição: ${item.desc.trim()}`;
    }

    if (item.nomeCompleto && item.nomeCompleto !== item.nome && !item.desc.includes(item.nomeCompleto)) {
      const extra = item.nomeCompleto.replace(new RegExp(item.nome, 'i'), '').trim().replace(/^[-\s,]+/, '');
      if (extra && extra.length > 3) {
        bloco += `\n   🏷️ Detalhes: ${extra}`;
      }
    }

    return bloco;
  }).join('\n\n');

  const total = brl(valorTotalCarrinho());
  const qtdTotal = totalItensCarrinho();

  const msg = `🍦 *NOVO PEDIDO - ${CONFIG.nome || 'SORVETERIA LOLLA'}* 🍦\n\n` +
    `Olá! Gostaria de fazer o seguinte pedido pelo cardápio digital:\n\n` +
    `📋 *ITENS ESCOLHIDOS:*\n${itensTexto}\n\n` +
    `-----------------------------------------\n` +
    `💰 *TOTAL DO PEDIDO:* R$ ${total}\n` +
    `📦 *TOTAL DE PRODUTOS:* ${qtdTotal}\n` +
    `-----------------------------------------\n\n` +
    `Por favor, confirmem a disponibilidade dos itens e prazo de entrega/retirada. Aguardo retorno!`;

  const zapUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(zapUrl, '_blank', 'noopener');
};

window.pedirItemWhatsApp = function(itemIndex, ev) {
  if (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
  const it = D && D.itens && D.itens[itemIndex];
  if (!it) return;

  adicionarAoPedido(itemIndex, ev);

  const totalVal = valorTotalCarrinho();
  const pedidoMin = getPedidoMinimo();

  if (totalVal < pedidoMin) {
    const falta = pedidoMin - totalVal;
    toast(`🛍️ "${it.n}" adicionado! Pedido mínimo para entrega é de R$ ${brl(pedidoMin)} (faltam R$ ${brl(falta)}).`);
  } else {
    toast(`✅ "${it.n}" adicionado! Pedido mínimo atingido.`);
  }
  abrirCarrinho();
};

function adicionarAoPedido(itemIndex, ev) {
  const it = D && D.itens && D.itens[itemIndex];
  if (!it) return;

  if (it.disponibilidade === 'esgotado' || it.esgotado) {
    toast(`❌ "${it.n}" está esgotado no momento.`);
    return;
  }
  if (it.disponibilidade === 'temporariamente_indisponivel') {
    toast(`⏳ "${it.n}" está temporariamente indisponível.`);
    return;
  }

  const { title, size, desc } = formatProduct(it);
  const preco = parseFloat(it.p) || 0;
  const precoAntigo = parseFloat(it.po) || 0;

  const e = ev || window.event;
  const btn = e ? (e.currentTarget || (e.target && e.target.closest ? e.target.closest('.btn-pedir-add') : null)) : null;
  const card = btn ? (btn.closest('.card') || btn.closest('.destaque-momento-card')) : null;

  let imgOriginal = null;
  if (card) {
    imgOriginal = card.querySelector('.foto img, .destaque-momento-foto img') || card.querySelector('img');
  }

  if (!imgOriginal && it.n) {
    const todasImgs = document.querySelectorAll('.foto img, .destaque-momento-foto img');
    for (const imgEl of todasImgs) {
      if (imgEl.alt && (imgEl.alt.includes(it.n) || it.n.includes(imgEl.alt))) {
        imgOriginal = imgEl;
        break;
      }
    }
  }

  let imgSrc = '';
  if (imgOriginal) {
    imgSrc = imgOriginal.currentSrc || imgOriginal.src || '';
  }
  if (!imgSrc && it) {
    imgSrc = it.img || (it.j ? CONFIG.fotosBaseUrl + it.j : '');
  }

  // Só agrupa se for rigorosamente o mesmo produto, tamanho, preço e descrição
  const itemExistente = carrinho.find(item => 
    item.itemIndex === itemIndex && 
    (item.tamanho || '') === (size || '') && 
    item.preco === preco
  );

  if (itemExistente) {
    itemExistente.qtd = (parseInt(itemExistente.qtd, 10) || 1) + 1;
    if (!itemExistente.img && imgSrc) itemExistente.img = imgSrc;
    if (!itemExistente.desc && desc) itemExistente.desc = desc;
    if (!itemExistente.nomeCompleto && it.n) itemExistente.nomeCompleto = it.n;
  } else {
    carrinho.push({
      itemIndex,
      nome: title,
      nomeCompleto: it.n || title,
      tamanho: size || '',
      desc: desc || it.d || '',
      preco,
      precoAntigo,
      img: imgSrc,
      imgRot: it.imgRot || 0,
      imgScale: it.imgScale !== undefined ? it.imgScale : 100,
      imgPosX: it.imgPosX || 0,
      imgPosY: it.imgPosY || 0,
      imgFit: it.imgFit || 'cover',
      qtd: 1
    });
  }

  salvarCarrinho();
  atualizarBadgeCarrinho();

  // Efeito pop instantâneo no badge e botão (Zero reflow síncrono, resposta em 0ms)
  const badgeEl = $('#badge-carrinho-qtd');
  const badgeFlut = $('#badge-carrinho-flutuante-qtd');
  const cartBtn = document.querySelector('.btn-meu-pedido-topo') || document.querySelector('#hero-nav-zap');
  const btnFlut = document.querySelector('#btn-meu-pedido-flutuante');

  [badgeEl, badgeFlut].forEach(el => {
    if (el) {
      el.classList.remove('badge-pop');
      requestAnimationFrame(() => el.classList.add('badge-pop'));
    }
  });

  [cartBtn, btnFlut].forEach(el => {
    if (el) {
      el.classList.remove('carrinho-pulse');
      requestAnimationFrame(() => el.classList.add('carrinho-pulse'));
    }
  });

  toast(`🛒 ${title} adicionado ao pedido!`);

  const drawer = $('#drawer-carrinho');
  if (drawer && drawer.classList.contains('aberto')) {
    renderCarrinho();
  }

  // Animação visual em voo ultra rápida (360ms na GPU)
  animarProdutoAteCarrinho(imgOriginal, it, btn);
}

function sincronizarDestaquesCategoria(catReal) {
  const catAlvo = catReal || cat || 'Todas';

  // Atualiza pílulas ativas no topo
  document.querySelectorAll('.pilula-cat').forEach(btn => {
    const text = btn.textContent.trim();
    if (catAlvo === 'Todas' && (text === 'Todos' || text === 'Todas')) {
      btn.classList.add('ativa');
    } else if (catAlvo.includes(text) || text.includes(catAlvo)) {
      btn.classList.add('ativa');
    } else {
      btn.classList.remove('ativa');
    }
  });

  // Atualiza ícones da seção nossos produtos
  document.querySelectorAll('.cat-icone-card').forEach(btn => {
    const label = btn.querySelector('.cat-icone-label');
    const nomeBtn = label ? label.textContent.trim() : '';
    if (catAlvo !== 'Todas' && (catAlvo === nomeBtn || catAlvo.includes(nomeBtn) || nomeBtn.includes(catAlvo))) {
      btn.classList.add('ativo');
    } else {
      btn.classList.remove('ativo');
    }
  });
}

function renderCategoriasIcones() {
  const container = document.getElementById('categorias-icones-scroll');
  if (!container || !D) return;
  ensureExtraData();
  const list = D.iconesNossosProdutos || [];
  const catAlvo = cat || 'Todas';

  container.innerHTML = list.map((item, idx) => {
    const isAtivo = (catAlvo !== 'Todas' && (catAlvo === item.cat || catAlvo.includes(item.label) || item.label.includes(catAlvo)));
    return `
      <div class="cat-icone-card ${isAtivo ? 'ativo' : ''}" role="button" tabindex="0" onclick="selecionarCategoriaIcone('${esc(item.cat)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selecionarCategoriaIcone('${esc(item.cat)}')}">
        <div class="cat-icone-img-wrap">
          <img src="${esc(item.img)}" alt="${esc(item.label)}" width="72" height="80" loading="lazy">
          <button type="button" class="btn-editar-icone-cat" onclick="abrirSeletorFotoCatIcone(${idx}, event)" title="Trocar Foto de ${esc(item.label)}">📷</button>
          <input type="file" id="input-foto-cat-icone-${idx}" accept="image/*" style="display:none" onchange="uploadFotoCategoriaIcone(${idx}, event)">
        </div>
        <span class="cat-icone-label">${esc(item.label)}</span>
        <span class="cat-indicador-barra"></span>
      </div>
    `;
  }).join('');
}

function selecionarCategoriaIcone(catReal) {
  const savedScrollY = window.scrollY;

  if (catReal === 'Todas') {
    cat = 'Todas';
    grupo = 'todos';
  } else {
    cat = catReal;
    grupo = getGrupoDaCategoria(catReal);
  }
  busca = '';
  const qEl = $('#q');
  if (qEl) qEl.value = '';
  const btnLimpar = $('#busca-limpar');
  if (btnLimpar) btnLimpar.style.display = 'none';

  montaAbas();
  montaChips();
  render();
  sincronizarDestaquesCategoria(catReal);

  // Mantém estritamente na MESMA posição da tela (sem saltos de rolagem)
  window.scrollTo(0, savedScrollY);
  requestAnimationFrame(() => {
    window.scrollTo(0, savedScrollY);
  });
  salvarEstadoNavegacao(savedScrollY);
}

function render() {
  if (!D) return;
  ensureExtraData();
  if (!isAdmin && cat !== 'Todas' && isCatOculta(cat)) {
    cat = 'Todas';
  }
  renderGaleria();
  renderCasquinhas();
  renderDestaque();
  renderBlog();
  renderDestaquesMomento();

  const termoBusca = (busca || '').trim();
  const qAtiva = Boolean(termoBusca);

  const visComIndices = D.itens.map((it, idx) => ({ it, idx })).filter(({ it }) => {
    if (!isAdmin) {
      if (it.oculto) return false;
      if (isCatOculta(it.c)) return false;
    }
    // Quando buscando: busca no cardápio todo (independente da aba ativa)
    if (qAtiva) {
      const match = itemCorrespondeBusca(it, termoBusca);
      if (!match) return false;
      return cat === 'Todas' || it.c === cat;
    }
    // Navegação comum: respeita a aba de grupo e o chip de categoria
    return (
      doGrupo(it) &&
      (cat === 'Todas' || it.c === cat)
    );
  });

  const listaEl = $('#lista');
  if (!visComIndices.length && !isAdmin) {
    if (qAtiva) {
      listaEl.innerHTML = `
        <div class="vazio">
          <b>Nenhum produto encontrado para "${esc(termoBusca)}"</b>
          Tente outro sabor, tamanho ou ingrediente, ou 
          <a href="javascript:void(0)" onclick="limparBusca()" style="color:var(--magenta);font-weight:700;text-decoration:underline">clique aqui para ver todos os produtos</a>.
        </div>`;
    } else {
      listaEl.innerHTML = '<div class="vazio"><b>Nada encontrado</b>Tente outro sabor ou outra aba.</div>';
    }
    return;
  }

  let html = '', i = 0;
  const catsParaExibir = D.cats.filter(c => {
    if (!isAdmin && isCatOculta(c)) return false;
    if (qAtiva) {
      return visComIndices.some(({ it }) => it.c === c);
    }
    if (cat !== 'Todas') {
      if (c !== cat) return false;
      return grupo === 'todos' || categoriaPertenceAoGrupo(c, grupo);
    }
    if (grupo === 'todos') {
      if (isAdmin) return true;
      return visComIndices.some(({ it }) => it.c === c);
    }
    const pertence = categoriaPertenceAoGrupo(c, grupo);
    if (!pertence) return false;
    if (isAdmin) return true;
    return visComIndices.some(({ it }) => it.c === c);
  });

  if (!catsParaExibir.length) {
    if (qAtiva) {
      listaEl.innerHTML = `
        <div class="vazio">
          <b>Nenhum produto encontrado para "${esc(termoBusca)}"</b>
          Tente outro sabor, tamanho ou ingrediente, ou 
          <a href="javascript:void(0)" onclick="limparBusca()" style="color:var(--magenta);font-weight:700;text-decoration:underline">clique aqui para ver todos os produtos</a>.
        </div>`;
    } else {
      listaEl.innerHTML = '<div class="vazio"><b>Nada encontrado</b>Tente outro sabor ou outra aba.</div>';
    }
    return;
  }

  for (const c of catsParaExibir) {
    const grupoItens = visComIndices.filter(({ it }) => it.c === c);
    if (!grupoItens.length && !isAdmin) continue;
    const catIdx = D.cats.indexOf(c);
    const oculta = isCatOculta(c);

    const cardAddHtml = isAdmin
      ? `<button type="button" class="card-add-admin" onclick="abrirModalNovoProdutoPorCategoria(${catIdx})">
           <span class="card-add-icone">➕</span>
           <strong>Adicionar Produto</strong>
           <small>em ${esc(c)}</small>
         </button>`
      : '';

    const isAcaiCat = c === 'Açaí Monte o Seu!!!' || /monte.*açaí|monte.*acai/i.test(c);
    const bannerAcaiHtml = isAcaiCat ? `
      <div class="banner-montar-acai">
        <div class="banner-montar-acai-info">
          <span class="banner-montar-acai-tag">✨ Monte do Seu Jeito</span>
          <h3>Monte o Seu Açaí Favorito!</h3>
          <p>Escolha o copo de 300ml ou 500ml, a base favorita (Tradicional, Nutella ou Leitinho) e adicione quantos acompanhamentos e cremes quiser!</p>
        </div>
        <button type="button" class="btn-abrir-montar-acai" onclick="rolarParaCoposAcai()">
          🍧 Escolha o Copo e Monte Agora
        </button>
      </div>
    ` : '';

    html += `<section class="bloco-categoria">
               <div class="secao">
                 <div class="secao-titulo-wrap">
                   <h2>${esc(c)}</h2>
                   ${RAIOS_DOODLE}
                 </div>
                 <span class="qtd">${grupoItens.length}</span>
                 <div class="secao-admin-bar">
                   ${isAcaiCat ? `
                     <button type="button" class="btn-secao-admin" onclick="abrirModalAdminAcai()" style="background:#FFF0F5;border-color:#85060F;color:#85060F;font-weight:800">
                       🍧 Opções do Açaí (Preços & Fotos)
                     </button>
                   ` : ''}
                   ${oculta ? '<span class="aviso-oculto-admin">🙈 Oculta para Clientes (Salva)</span>' : ''}
                   <button type="button" class="btn-secao-admin adicionar" onclick="abrirModalNovoProdutoPorCategoria(${catIdx})">
                     ➕ Adicionar Produto Aqui
                   </button>
                   <button type="button" class="btn-secao-admin ${oculta ? 'ativo-oculto' : ''}" onclick="alternarOcultarCategoriaPorIndice(${catIdx})">
                     ${oculta ? '👁️ Mostrar Categoria p/ Clientes' : '🙈 Ocultar Categoria (Salvar)'}
                   </button>
                   <button type="button" class="btn-secao-admin" onclick="renomearCategoriaPorIndice(${catIdx})">
                     ✏️ Renomear
                   </button>
                   <button type="button" class="btn-secao-admin perigo" onclick="excluirCategoriaPorIndice(${catIdx})">
                     🗑️ Excluir Categoria
                   </button>
                 </div>
               </div>
               <div class="grade ${oculta ? 'grade-oculta' : ''}">
                 ${bannerAcaiHtml}
                 ${grupoItens.map(({ it, idx }) => card(it, i++, idx)).join('')}
                 ${cardAddHtml}
               </div>
             </section>`;
  }
  let buscaAvisoHtml = '';
  if (qAtiva) {
    buscaAvisoHtml = `
      <div class="busca-resultado-aviso">
        <span>🔍 <b>${visComIndices.length}</b> ${visComIndices.length === 1 ? 'produto encontrado' : 'produtos encontrados'} para "<em>${esc(termoBusca)}</em>"</span>
        <button type="button" class="btn-limpar-busca-inline" onclick="limparBusca()">✕ Limpar Busca</button>
      </div>
    `;
  }
  listaEl.innerHTML = buscaAvisoHtml + html;

  const zapGeralHref = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent('Olá! Quero fazer um pedido pelo cardápio.');
  const entregasLink = $('.entregas a');
  if (entregasLink) entregasLink.href = zapGeralHref;
  const barraLink = $('.barra a');
  if (barraLink) barraLink.href = zapGeralHref;
  const heroNavZap = $('#hero-nav-zap');
  if (heroNavZap) {
    heroNavZap.href = 'javascript:void(0)';
    heroNavZap.onclick = abrirCarrinho;
  }
  const btnZapRodape = $('#btn-zap-rodape-flutuante');
  if (btnZapRodape) {
    btnZapRodape.href = 'javascript:void(0)';
    btnZapRodape.onclick = abrirCarrinho;
  }
  const btnFlut = $('#btn-meu-pedido-flutuante');
  if (btnFlut) {
    btnFlut.href = 'javascript:void(0)';
    btnFlut.onclick = abrirCarrinho;
  }
  const heroCtaZap = $('#hero-cta-zap');
  if (heroCtaZap) heroCtaZap.href = zapGeralHref;

  const totalVisiveis = D.itens.filter(it => !it.oculto && !isCatOculta(it.c)).length;
  const totalCatsVisiveis = D.cats.filter(c => !isCatOculta(c)).length;
  const statSabores = $('#hero-stat-sabores');
  if (statSabores) statSabores.textContent = totalVisiveis;
  const statCats = $('#hero-stat-cats');
  if (statCats) statCats.textContent = totalCatsVisiveis;

  const peEl = $('.pe');
  if (peEl) {
    peEl.innerHTML = `<b>${esc(CONFIG.nome)}</b><br>${totalVisiveis} itens disponíveis · WhatsApp: ${CONFIG.whatsapp} · Preços sujeitos a alteração<br>
      <span class="link-acesso-admin" onclick="abrirModalLogin()" title="Área Restrita do Lojista">🔒 Área Restrita</span>`;
  }
}

function montaAbas() {
  $('#abas').innerHTML = GRUPOS.map(([id, rot, sub]) =>
    `<button class="aba" role="tab" aria-selected="${id === grupo}" data-g="${id}">
       ${rot}${sub ? `<small>${sub}</small>` : ''}</button>`
  ).join('');
}

function montaChips() {
  if (!D) return;
  ensureExtraData();
  const chipsEl = $('#chips');
  if (!chipsEl) return;
  const prevScrollLeft = chipsEl.scrollLeft;
  const termoBusca = (busca || '').trim();
  const qAtiva = Boolean(termoBusca);

  let cats = [];
  if (qAtiva) {
    cats = D.cats.filter(c => {
      if (!isAdmin && isCatOculta(c)) return false;
      return D.itens.some(it => it && it.c === c && itemCorrespondeBusca(it, termoBusca) && (isAdmin || !it.oculto));
    });
  } else {
    cats = D.cats.filter(c => {
      if (!isAdmin && isCatOculta(c)) return false;
      if (grupo === 'todos') {
        if (isAdmin) return true;
        return D.itens.some(it => it && it.c === c && !it.oculto);
      }
      const pertence = categoriaPertenceAoGrupo(c, grupo);
      if (!pertence) return false;
      if (isAdmin) return true;
      return D.itens.some(it => it && it.c === c && doGrupo(it) && !it.oculto);
    });
  }

  const chipsHtml = ['Todas', ...cats].map(c => {
    const oculta = c !== 'Todas' && isCatOculta(c);
    let countBadge = '';
    if (qAtiva && c !== 'Todas') {
      const count = D.itens.filter(it => it && it.c === c && itemCorrespondeBusca(it, termoBusca) && (isAdmin || !it.oculto)).length;
      countBadge = ` <span style="font-size:11px;opacity:.75">(${count})</span>`;
    }
    return `<button class="chip ${oculta ? 'chip-oculto' : ''}" role="tab" aria-selected="${c === cat}" data-c="${esc(c)}">${oculta ? '🙈 ' : ''}${esc(c)}${countBadge}</button>`;
  }).join('');
  const btnGerenciarHtml = isAdmin
    ? `<button type="button" class="chip" style="border-color:var(--magenta);color:var(--magenta);background:#fff" onclick="abrirModalCategorias()" title="Ocultar, mostrar ou definir abas das categorias">⚙️ Gerenciar Categorias</button>`
    : '';
  chipsEl.innerHTML = chipsHtml + btnGerenciarHtml;
  chipsEl.scrollLeft = prevScrollLeft;
}

/* ==========================================================
 * AUTENTICAÇÃO E SEGURANÇA DO DONO/ADMIN
 * ========================================================== */

function atualizarEstadoAutenticacao() {
  if (isAdmin) {
    document.body.classList.add('admin-autenticado');
  } else {
    document.body.classList.remove('admin-autenticado');
  }
  renderCategoriasIcones();
}

window.abrirModalLogin = function () {
  if (isAdmin) {
    toast('Você já está conectado como Administrador!');
    return;
  }
  $('#login-senha').value = '';
  $('#login-erro').style.display = 'none';
  $('#modal-login').classList.add('aberto');
  setTimeout(() => $('#login-senha').focus(), 150);
};

window.fecharModalLogin = function () {
  $('#modal-login').classList.remove('aberto');
};

async function submeterLogin(e) {
  e.preventDefault();
  const senha = $('#login-senha').value;
  const erroEl = $('#login-erro');
  erroEl.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: senha })
    });
    const data = await res.json();

    if (res.ok && data.success && data.token) {
      adminToken = data.token;
      sessionStorage.setItem(STORAGE_KEY_TOKEN, adminToken);
      localStorage.setItem(STORAGE_KEY_TOKEN, adminToken);
      isAdmin = true;
      atualizarEstadoAutenticacao();
      fecharModalLogin();
      toast('👋 Bem-vindo, Administrador! Modo de edição ativado.');
      montaChips();
      render();

      if (!data.defaultChanged) {
        setTimeout(() => {
          if (confirm('Aviso de Segurança: Você ainda está usando a senha padrão (lolla123). Deseja criar uma nova senha agora?')) {
            abrirModalSenha();
          }
        }, 1200);
      }
    } else {
      erroEl.textContent = data.error || 'Senha incorreta';
      erroEl.style.display = 'block';
    }
  } catch (err) {
    if (senha === 'lolla123' || senha === 'lolla2026') {
      adminToken = 'direct-admin-token-' + Date.now();
      sessionStorage.setItem(STORAGE_KEY_TOKEN, adminToken);
      localStorage.setItem(STORAGE_KEY_TOKEN, adminToken);
      isAdmin = true;
      atualizarEstadoAutenticacao();
      fecharModalLogin();
      toast('👋 Bem-vindo, Administrador! Modo de edição ativado.');
      montaChips();
      render();
      return;
    }
    erroEl.textContent = 'Erro ao conectar ao servidor.';
    erroEl.style.display = 'block';
  }
}

window.desconectarAdmin = async function () {
  if (adminToken) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
    } catch (e) {}
  }
  adminToken = '';
  sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  isAdmin = false;
  atualizarEstadoAutenticacao();
  toast('🔒 Você saiu do modo administrador.');
  montaChips();
  render();
};

window.abrirModalSenha = function () {
  $('#nova-senha').value = '';
  $('#nova-senha-conf').value = '';
  $('#modal-senha').classList.add('aberto');
};

window.fecharModalSenha = function () {
  $('#modal-senha').classList.remove('aberto');
};

async function submeterNovaSenha(e) {
  e.preventDefault();
  const s1 = $('#nova-senha').value;
  const s2 = $('#nova-senha-conf').value;

  if (s1.length < 4) {
    alert('A nova senha deve ter pelo menos 4 caracteres.');
    return;
  }
  if (s1 !== s2) {
    alert('As duas senhas digitadas não conferem.');
    return;
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ newPassword: s1 })
    });
    const json = await res.json();
    if (res.ok) {
      if (json.token) {
        adminToken = json.token;
        sessionStorage.setItem(STORAGE_KEY_TOKEN, adminToken);
        localStorage.setItem(STORAGE_KEY_TOKEN, adminToken);
      }
      fecharModalSenha();
      toast('🔑 Senha de administrador alterada com sucesso!');
    } else {
      alert(json.error || 'Erro ao alterar senha.');
    }
  } catch (err) {
    alert('Erro de conexão ao alterar a senha.');
  }
}

/* ==========================================================
 * CONFIGURAÇÃO NUVEM OFICIAL (SUPABASE & BACKUP)
 * Projeto Oficial: lolla (bpxqanowjvlzifxkyypj)
 * ========================================================== */

const SUPABASE_CONFIG = {
  url: 'https://bpxqanowjvlzifxkyypj.supabase.co',
  anonKey: 'sb_publishable_sDqZJ29prJ2mjQ6MLdrpPA_z8lVbmPQ',
  legacyAnon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHFhbm93anZsemlmeGt5eXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNjcxNDMsImV4cCI6MjA5NTc0MzE0M30.9wEYk9SZGXHb4fWglNuHyyeKlV3dsd51d40HKFBuHrI',
  table: 'lolla_cardapio_online',
  bucket: 'produtos'
};

/* ==========================================================
 * COMPRESSOR AUTOMÁTICO DE IMAGENS (CLIENT-SIDE)
 * Reduz fotos de celulares (5MB-8MB) para ~45KB mantendo alta nitidez
 * ========================================================== */

function comprimirImagemArquivo(file, maxDim = 800, quality = 0.82) {
  return new Promise(resolve => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/* ==========================================================
 * UPLOAD DIRETO PARA SUPABASE STORAGE (ARQUIVOS LEVES E PERMANENTES)
 * ========================================================== */

async function uploadImagemArquivo(file) {
  const compressedDataUrl = await comprimirImagemArquivo(file);

  // Tenta upload direto para o Bucket de Storage do Supabase (para desonerar o banco e a Vercel)
  try {
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    const filename = `foto-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${cleanExt}`;

    const blob = await fetch(compressedDataUrl).then(r => r.blob());

    const resStorage = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/${SUPABASE_CONFIG.bucket}/${filename}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': blob.type || 'image/jpeg',
        'x-upsert': 'true'
      },
      body: blob
    });

    if (resStorage.ok) {
      const publicUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.bucket}/${filename}`;
      toast('📸 Foto salva no Supabase Storage com sucesso!');
      return publicUrl;
    } else {
      console.warn('Storage bucket ainda não criado ou sem permissão, usando base64 comprimido:', resStorage.status);
    }
  } catch (errStorage) {
    console.warn('Erro ao subir para o Supabase Storage:', errStorage);
  }

  toast('📸 Foto otimizada para carregamento rápido!');
  return compressedDataUrl;
}

/* ==========================================================
 * OPERAÇÕES DE PRODUTOS (ADMIN) & SINCRONIZAÇÃO EM NUVEM
 * ========================================================== */

async function salvarCardapio(notificar = true) {
  if (!D) return;
  const savedScrollY = window.scrollY;
  D.config = { nome: CONFIG.nome, whatsapp: CONFIG.whatsapp };

  // 1. Salva no localStorage (cache local instantâneo do navegador)
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(D));
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(CONFIG));
  } catch (e) {
    console.warn('LocalStorage:', e);
  }

  // 2. Salva na Nuvem Supabase Oficial (Persistência Real para Todos os Computadores e Celulares)
  let salvouNuvem = false;
  let erroNuvemMsg = '';
  try {
    const resSupa = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: 'principal',
        data: D,
        updated_at: new Date().toISOString()
      })
    });
    if (resSupa.ok) {
      salvouNuvem = true;
    } else {
      const errTxt = await resSupa.text();
      erroNuvemMsg = `Status ${resSupa.status}: ${errTxt.slice(0, 80)}`;
      console.error('Falha ao salvar no Supabase:', resSupa.status, errTxt);
    }
  } catch (errSupa) {
    erroNuvemMsg = errSupa.message || 'Falha de conexão';
    console.warn('Erro ao sincronizar com Supabase:', errSupa);
  }

  // 3. Salva no servidor local (quando executado via node server.js em localhost)
  if (isAdmin && adminToken) {
    try {
      await fetch('/api/cardapio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(D)
      });
    } catch (err) {}
  }

  // Atualiza badge de sincronização na barra de admin
  const badgeNuvem = $('#status-sinc-nuvem');
  if (badgeNuvem) {
    if (salvouNuvem) {
      badgeNuvem.textContent = '☁️ Sincronizado na Nuvem';
      badgeNuvem.style.color = 'var(--verde)';
      badgeNuvem.style.background = '#E8F8ED';
    } else {
      badgeNuvem.textContent = '⚠️ Salvo Apenas Localmente';
      badgeNuvem.style.color = '#c00';
      badgeNuvem.style.background = '#FDE8E8';
    }
  }

  if (notificar) {
    if (salvouNuvem) {
      toast('☁️ Cardápio e fotos salvos na nuvem com sucesso!');
    } else {
      toast(`⚠️ Salvo localmente. Erro na nuvem: ${erroNuvemMsg}`);
    }
  }

  montaAbas();
  montaChips();
  render();
  window.scrollTo(0, savedScrollY);
  salvarEstadoNavegacao(savedScrollY);
}

window.forcarSincronizacaoNuvem = async function () {
  toast('☁️ Enviando cardápio completo para a nuvem...');
  await salvarCardapio(true);
};

/* ==========================================================
 * EXPORTAÇÃO & IMPORTAÇÃO DE BACKUP (SEGURANÇA TOTAL)
 * ========================================================== */

window.exportarBackupCardapio = function () {
  if (!D) {
    alert('Nenhum dado para exportar.');
    return;
  }
  const jsonStr = JSON.stringify(D, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dataHoje = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `cardapio-lolla-backup-${dataHoje}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('📦 Backup baixado com sucesso!');
};

window.importarBackupCardapio = function (event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || !Array.isArray(data.itens)) {
        alert('Arquivo de backup inválido.');
        return;
      }
      if (confirm(`Deseja restaurar o backup com ${data.itens.length} produtos? Isso atualizará o cardápio atual com as fotos salvas.`)) {
        D = data;
        ensureExtraData();
        await salvarCardapio(true);
        toast(`📥 Backup restaurado com sucesso! (${data.itens.length} produtos)`);
      }
    } catch (err) {
      alert('Erro ao ler arquivo JSON: ' + err.message);
    }
    event.target.value = '';
  };
  reader.readAsText(file);
};

function descobrirGrupoDaCategoria(nomeCat) {
  return getGrupoDaCategoria(nomeCat);
}

// ============================================================
// AJUSTES DE FOTO NO MODAL DE PRODUTOS (Girar, Zoom, Posição, Fit)
// ============================================================

window.definirRotacaoFoto = function (ang) {
  const rotInput = $('#prod-img-rot');
  if (!rotInput) return;
  const val = ((parseInt(ang, 10) % 360) + 360) % 360;
  rotInput.value = val;
  atualizarPreviewModal();
};

window.girarFotoPasso = function (delta = 90) {
  const rotInput = $('#prod-img-rot');
  if (!rotInput) return;
  const atual = parseInt(rotInput.value, 10) || 0;
  definirRotacaoFoto(atual + delta);
};

window.definirZoomFoto = function (val) {
  let num = parseInt(val, 10);
  if (isNaN(num)) num = 100;
  num = Math.max(30, Math.min(250, num));
  const slider = $('#prod-img-zoom');
  const inputNum = $('#prod-img-zoom-num');
  if (slider) slider.value = num;
  if (inputNum && parseInt(inputNum.value, 10) !== num) inputNum.value = num;
  atualizarPreviewModal();
};

window.alterarZoomFoto = function (delta) {
  const slider = $('#prod-img-zoom');
  const atual = parseInt(slider ? slider.value : 100, 10) || 100;
  definirZoomFoto(atual + delta);
};

window.definirPosYFoto = function (val) {
  let num = parseInt(val, 10);
  if (isNaN(num)) num = 0;
  num = Math.max(-60, Math.min(60, num));
  const slider = $('#prod-img-pos-y');
  if (slider) slider.value = num;
  atualizarPreviewModal();
};

window.alterarPosYFoto = function (delta) {
  const slider = $('#prod-img-pos-y');
  const atual = parseInt(slider ? slider.value : 0, 10) || 0;
  definirPosYFoto(atual + delta);
};

window.definirPosXFoto = function (val) {
  let num = parseInt(val, 10);
  if (isNaN(num)) num = 0;
  num = Math.max(-60, Math.min(60, num));
  const slider = $('#prod-img-pos-x');
  if (slider) slider.value = num;
  atualizarPreviewModal();
};

window.alterarPosXFoto = function (delta) {
  const slider = $('#prod-img-pos-x');
  const atual = parseInt(slider ? slider.value : 0, 10) || 0;
  definirPosXFoto(atual + delta);
};

window.definirFitFoto = function (val) {
  const radios = document.querySelectorAll('input[name="prod-img-fit"]');
  radios.forEach(r => {
    r.checked = (r.value === val);
  });
  atualizarPreviewModal();
};

window.resetarAjustesFoto = function () {
  definirRotacaoFoto(0);
  definirZoomFoto(100);
  definirPosXFoto(0);
  definirPosYFoto(0);
  definirFitFoto('cover');
  atualizarPreviewModal();
};

window.atualizarPreviewModal = function () {
  const rotInput = $('#prod-img-rot');
  const zoomInput = $('#prod-img-zoom');
  const zoomNumInput = $('#prod-img-zoom-num');
  const posXInput = $('#prod-img-pos-x');
  const posYInput = $('#prod-img-pos-y');
  const fitRadio = document.querySelector('input[name="prod-img-fit"]:checked');

  const rot = parseInt(rotInput ? rotInput.value : 0, 10) || 0;
  const zoom = parseInt(zoomInput ? zoomInput.value : 100, 10) || 100;
  const posX = parseInt(posXInput ? posXInput.value : 0, 10) || 0;
  const posY = parseInt(posYInput ? posYInput.value : 0, 10) || 0;
  const fit = fitRadio ? fitRadio.value : 'cover';

  // Atualiza os badges visuais
  const rotBadge = $('#prod-img-rot-badge');
  if (rotBadge) rotBadge.textContent = `${rot}°`;

  if (zoomNumInput && parseInt(zoomNumInput.value, 10) !== zoom) {
    zoomNumInput.value = zoom;
  }

  const posXBadge = $('#prod-img-pos-x-badge');
  if (posXBadge) {
    if (posX === 0) posXBadge.textContent = 'Centro (0%)';
    else if (posX < 0) posXBadge.textContent = `Esq (${posX}%)`;
    else posXBadge.textContent = `Dir (+${posX}%)`;
  }

  const posYBadge = $('#prod-img-pos-y-badge');
  if (posYBadge) {
    if (posY === 0) posYBadge.textContent = 'Centro (0%)';
    else if (posY < 0) posYBadge.textContent = `Cima (${posY}%)`;
    else posYBadge.textContent = `Baixo (+${posY}%)`;
  }

  // Atualiza botões de ângulo
  document.querySelectorAll('.btn-rot-ang').forEach(btn => {
    const ang = parseInt(btn.getAttribute('data-ang'), 10);
    if (ang === rot) btn.classList.add('ativo');
    else btn.classList.remove('ativo');
  });

  // Atualiza o preview na tela
  const preview = $('#prod-foto-preview');
  if (preview) {
    preview.style.setProperty('--img-rot', `${rot}deg`);
    preview.style.setProperty('--img-scale', `${zoom / 100}`);
    preview.style.setProperty('--img-x', `${posX}%`);
    preview.style.setProperty('--img-y', `${posY}%`);
    preview.style.setProperty('--img-fit', fit);

    const img = preview.querySelector('img');
    if (img) {
      img.style.setProperty('--img-rot', `${rot}deg`);
      img.style.setProperty('--img-scale', `${zoom / 100}`);
      img.style.setProperty('--img-x', `${posX}%`);
      img.style.setProperty('--img-y', `${posY}%`);
      img.style.setProperty('--img-fit', fit);
      img.style.objectFit = fit;
    }
  }
};

function setupFotoPreviewDrag() {
  const preview = $('#prod-foto-preview');
  if (!preview || preview._dragInitialized) return;
  preview._dragInitialized = true;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialPosX = 0;
  let initialPosY = 0;

  function onPointerDown(e) {
    const target = e.target;
    if (!preview.contains(target)) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    isDragging = true;
    startX = clientX;
    startY = clientY;
    const posXInput = $('#prod-img-pos-x');
    const posYInput = $('#prod-img-pos-y');
    initialPosX = parseInt(posXInput ? posXInput.value : 0, 10) || 0;
    initialPosY = parseInt(posYInput ? posYInput.value : 0, 10) || 0;
    preview.style.cursor = 'grabbing';
    if (e.cancelable) e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startX;
    const dy = clientY - startY;

    // Converte pixels arrastados em porcentagem (baseado na largura do preview ~160px)
    const deltaXPercent = Math.round((dx / 160) * 100);
    const deltaYPercent = Math.round((dy / 160) * 100);

    let newX = Math.max(-60, Math.min(60, initialPosX + deltaXPercent));
    let newY = Math.max(-60, Math.min(60, initialPosY + deltaYPercent));

    const posXInput = $('#prod-img-pos-x');
    const posYInput = $('#prod-img-pos-y');
    if (posXInput) posXInput.value = newX;
    if (posYInput) posYInput.value = newY;
    atualizarPreviewModal();
  }

  function onPointerUp() {
    if (isDragging) {
      isDragging = false;
      preview.style.cursor = 'grab';
    }
  }

  preview.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  preview.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);
}

window.abrirModalNovoProduto = function (catPreSelecionada = '') {
  if (!isAdmin) {
    abrirModalLogin();
    return;
  }
  ensureExtraData();
  editingIndex = -1;
  let categoriaInicial = catPreSelecionada;
  if (!categoriaInicial) {
    if (cat !== 'Todas') {
      categoriaInicial = cat;
    } else if (grupo !== 'todos') {
      const catDoGrupo = D.cats.find(c => categoriaPertenceAoGrupo(c, grupo));
      categoriaInicial = catDoGrupo || D.cats[0] || '';
    } else {
      categoriaInicial = D.cats[0] || '';
    }
  }

  $('#modal-produto-titulo').textContent = categoriaInicial
    ? `➕ Novo Produto em "${categoriaInicial}"`
    : '➕ Adicionar Novo Produto';
  $('#prod-nome').value = '';
  $('#prod-grupo').value = getGrupoDaCategoria(categoriaInicial);
  $('#prod-desc').value = '';
  $('#prod-preco').value = '';
  $('#prod-preco-antigo').value = '';
  $('#prod-foto-url').value = '';
  $('#prod-foto-arquivo').value = '';

  const itemExemplo = D.itens.find(it => it && it.c === categoriaInicial);
  if (itemExemplo) {
    $('#prod-foto-preview').innerHTML = resolveImageTag(itemExemplo, 0);
    definirRotacaoFoto(itemExemplo.imgRot !== undefined ? itemExemplo.imgRot : 0);
    definirZoomFoto(itemExemplo.imgScale !== undefined ? itemExemplo.imgScale : 100);
    definirPosXFoto(itemExemplo.imgPosX !== undefined ? itemExemplo.imgPosX : 0);
    definirPosYFoto(itemExemplo.imgPosY !== undefined ? itemExemplo.imgPosY : 0);
    definirFitFoto(itemExemplo.imgFit || 'cover');
  } else {
    $('#prod-foto-preview').innerHTML = '<span>Sem foto</span>';
    resetarAjustesFoto();
  }

  popularSelectCategorias(categoriaInicial);
  $('#modal-produto').classList.add('aberto');
  setTimeout(() => $('#prod-nome').focus(), 120);
};

window.abrirModalNovoProdutoPorCategoria = function (catIdx) {
  if (!isAdmin) {
    abrirModalLogin();
    return;
  }
  ensureExtraData();
  const nomeCat = D.cats[catIdx] || '';
  if ($('#modal-categorias') && $('#modal-categorias').classList.contains('aberto')) {
    fecharModalCategorias();
  }
  abrirModalNovoProduto(nomeCat);
};

window.abrirModalEditar = function (index) {
  if (!isAdmin) {
    abrirModalLogin();
    return;
  }
  ensureExtraData();
  editingIndex = index;
  const it = D.itens[index];
  if (!it) return;

  $('#modal-produto-titulo').textContent = `✏️ Editar: ${it.n}`;
  $('#prod-nome').value = it.n || '';
  $('#prod-grupo').value = it.g || descobrirGrupoDaCategoria(it.c);
  $('#prod-desc').value = it.d || '';
  $('#prod-preco').value = it.p !== undefined && it.p !== null ? brl(it.p) : '';
  $('#prod-preco-antigo').value = (it.po && parseFloat(it.po) > parseFloat(it.p)) ? brl(it.po) : '';
  if ($('#prod-disponibilidade')) {
    $('#prod-disponibilidade').value = it.disponibilidade || (it.esgotado ? 'esgotado' : (it.oculto ? 'temporariamente_indisponivel' : 'disponivel'));
  }
  $('#prod-foto-url').value = it.img || '';
  $('#prod-foto-arquivo').value = '';

  const previewEl = $('#prod-foto-preview');
  previewEl.innerHTML = resolveImageTag(it, 0);

  definirRotacaoFoto(it.imgRot !== undefined ? it.imgRot : 0);
  definirZoomFoto(it.imgScale !== undefined ? it.imgScale : 100);
  definirPosXFoto(it.imgPosX !== undefined ? it.imgPosX : 0);
  definirPosYFoto(it.imgPosY !== undefined ? it.imgPosY : 0);
  definirFitFoto(it.imgFit || 'cover');
  atualizarPreviewModal();

  popularSelectCategorias(it.c);
  $('#modal-produto').classList.add('aberto');
};

window.duplicarProduto = async function (index) {
  if (!isAdmin) {
    abrirModalLogin();
    return;
  }
  ensureExtraData();
  const orig = D.itens[index];
  if (!orig) return;

  const copia = JSON.parse(JSON.stringify(orig));
  copia.n = `${orig.n} (Novo Sabor)`;
  const novoIdx = index + 1;
  D.itens.splice(novoIdx, 0, copia);
  await salvarCardapio(false);
  toast('📋 Produto duplicado! Edite os dados abaixo e clique em Salvar.');
  abrirModalEditar(novoIdx);
};

window.fecharModalProduto = function () {
  $('#modal-produto').classList.remove('aberto');
};

function popularSelectCategorias(catSelecionada = '') {
  const sel = $('#prod-cat');
  if (!sel || !D) return;
  ensureExtraData();

  sel.innerHTML = '';
  const listaCats = [...D.cats];
  if (catSelecionada && !listaCats.includes(catSelecionada)) {
    listaCats.push(catSelecionada);
  }

  listaCats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    if (c === catSelecionada) opt.selected = true;
    sel.appendChild(opt);
  });

  const optNova = document.createElement('option');
  optNova.value = '__nova__';
  optNova.textContent = '+ Criar nova categoria...';
  sel.appendChild(optNova);

  if (catSelecionada && listaCats.includes(catSelecionada)) {
    sel.value = catSelecionada;
  }
  toggleCampoNovaCategoria();
}

function toggleCampoNovaCategoria() {
  const sel = $('#prod-cat');
  const campoNova = $('#campo-nova-cat');
  if (!sel || !campoNova) return;
  if (sel.value === '__nova__') {
    campoNova.style.display = 'block';
    const selNovaGrupo = $('#prod-nova-cat-grupo');
    if (selNovaGrupo) {
      selNovaGrupo.value = (grupo !== 'todos' ? grupo : 'picoles');
      if ($('#prod-grupo')) $('#prod-grupo').value = selNovaGrupo.value;
    }
    const inp = $('#prod-nova-cat');
    if (inp) inp.focus();
  } else {
    campoNova.style.display = 'none';
    if (editingIndex === -1 && sel.value) {
      $('#modal-produto-titulo').textContent = `➕ Novo Produto em "${sel.value}"`;
      $('#prod-grupo').value = getGrupoDaCategoria(sel.value);
      if (!$('#prod-foto-url').value.trim()) {
        const itemExemplo = D.itens.find(it => it && it.c === sel.value);
        if (itemExemplo) {
          $('#prod-foto-preview').innerHTML = resolveImageTag(itemExemplo, 0);
          definirRotacaoFoto(itemExemplo.imgRot !== undefined ? itemExemplo.imgRot : 0);
          definirZoomFoto(itemExemplo.imgScale !== undefined ? itemExemplo.imgScale : 100);
          definirPosXFoto(itemExemplo.imgPosX !== undefined ? itemExemplo.imgPosX : 0);
          definirPosYFoto(itemExemplo.imgPosY !== undefined ? itemExemplo.imgPosY : 0);
          definirFitFoto(itemExemplo.imgFit || 'cover');
        }
      }
    }
  }
}

async function processarFotoSelecionada(file) {
  if (!file) return;
  const url = await uploadImagemArquivo(file);
  $('#prod-foto-preview').innerHTML = `<img src="${url}">`;
  $('#prod-foto-url').value = url;
  atualizarPreviewModal();
}

async function submitProduto(e) {
  e.preventDefault();
  ensureExtraData();

  const nome = $('#prod-nome').value.trim();
  if (!nome) {
    alert('Informe o nome do produto.');
    return;
  }

  let categoria = $('#prod-cat').value;
  if (categoria === '__nova__') {
    categoria = $('#prod-nova-cat').value.trim();
    if (!categoria) {
      alert('Digite o nome da nova categoria.');
      return;
    }
    const novoCatGrupo = ($('#prod-nova-cat-grupo') && $('#prod-nova-cat-grupo').value) || $('#prod-grupo').value || 'loja';
    if (!D.cats.includes(categoria)) {
      D.cats.push(categoria);
    }
    if (!D.catsGrupo) D.catsGrupo = {};
    D.catsGrupo[categoria] = novoCatGrupo;
    $('#prod-grupo').value = novoCatGrupo;
  }

  const grupoSel = $('#prod-grupo').value || getGrupoDaCategoria(categoria);
  const desc = $('#prod-desc').value.trim();
  const precoLimpo = String($('#prod-preco').value || '').replace(/[^\d.,]/g, '').replace(',', '.');
  const precoAntigoLimpo = String($('#prod-preco-antigo').value || '').replace(/[^\d.,]/g, '').replace(',', '.');
  const preco = parseFloat(precoLimpo) || 0;
  let precoAntigo = parseFloat(precoAntigoLimpo) || 0;
  if (precoAntigo <= preco) precoAntigo = 0;

  const fotoUrl = $('#prod-foto-url').value.trim();
  const fotoRot = Number($('#prod-img-rot') ? $('#prod-img-rot').value : 0) || 0;
  const fotoScale = Number($('#prod-img-zoom') ? $('#prod-img-zoom').value : 100) || 100;
  const fotoPosX = Number($('#prod-img-pos-x') ? $('#prod-img-pos-x').value : 0) || 0;
  const fotoPosY = Number($('#prod-img-pos-y') ? $('#prod-img-pos-y').value : 0) || 0;
  const fotoFitEl = document.querySelector('input[name="prod-img-fit"]:checked');
  const fotoFit = fotoFitEl ? fotoFitEl.value : 'cover';
  const disp = $('#prod-disponibilidade') ? $('#prod-disponibilidade').value : 'disponivel';

  const itemObj = {
    n: nome,
    d: desc,
    c: categoria,
    g: grupoSel,
    p: preco,
    po: precoAntigo,
    disponibilidade: disp,
    esgotado: (disp === 'esgotado'),
    oculto: (disp === 'temporariamente_indisponivel'),
    imgRot: fotoRot,
    imgScale: fotoScale,
    imgPosX: fotoPosX,
    imgPosY: fotoPosY,
    imgFit: fotoFit
  };

  if (fotoUrl) {
    itemObj.img = fotoUrl;
  } else if (editingIndex >= 0 && D.itens[editingIndex]) {
    const atual = D.itens[editingIndex];
    if (atual.img) itemObj.img = atual.img;
    if (atual.w4) itemObj.w4 = atual.w4;
    if (atual.w6) itemObj.w6 = atual.w6;
    if (atual.w8) itemObj.w8 = atual.w8;
    if (atual.j) itemObj.j = atual.j;
  } else {
    // Se adicionou novo produto sem enviar foto nova, reaproveita a foto padrão da categoria (se houver)
    const exemploCat = D.itens.find(it => it && it.c === categoria && (it.img || it.w4 || it.j));
    if (exemploCat) {
      if (exemploCat.img) itemObj.img = exemploCat.img;
      if (exemploCat.w4) itemObj.w4 = exemploCat.w4;
      if (exemploCat.w6) itemObj.w6 = exemploCat.w6;
      if (exemploCat.w8) itemObj.w8 = exemploCat.w8;
      if (exemploCat.j) itemObj.j = exemploCat.j;
    }
  }

  if (editingIndex >= 0 && D.itens[editingIndex] && D.itens[editingIndex].oculto) {
    itemObj.oculto = true;
  }

  if (editingIndex >= 0) {
    D.itens[editingIndex] = itemObj;
    toast(`✅ Produto "${nome}" atualizado com sucesso!`);
  } else {
    // Insere logo após o último item dessa mesma categoria (ou no final da lista)
    let ultimoIdxCat = -1;
    D.itens.forEach((it, idx) => {
      if (it && it.c === categoria) ultimoIdxCat = idx;
    });
    if (ultimoIdxCat >= 0) {
      D.itens.splice(ultimoIdxCat + 1, 0, itemObj);
    } else {
      D.itens.push(itemObj);
    }
    toast(`✅ Produto "${nome}" adicionado em "${categoria}"!`);
  }

  // Se o filtro de grupo atual esconderia o item recém-salvo, muda para 'todos' para o dono vê-lo na hora
  if (grupo !== 'todos' && grupo !== itemObj.g) {
    grupo = itemObj.g;
  }
  if (cat !== 'Todas' && cat !== categoria) {
    cat = categoria;
  }

  fecharModalProduto();
  await salvarCardapio(true);
}

window.alternarOcultarProduto = async function (index) {
  if (!isAdmin) return;
  const it = D.itens[index];
  if (!it) return;
  it.oculto = !it.oculto;
  toast(it.oculto ? `🙈 "${it.n}" ocultado para clientes (continua salvo).` : `👁️ "${it.n}" visível novamente para os clientes!`);
  await salvarCardapio(true);
};

window.removerProduto = async function (index) {
  if (!isAdmin) return;
  const it = D.itens[index];
  if (!it) return;

  if (confirm(`Deseja realmente remover o produto "${it.n}" do seu cardápio?`)) {
    D.itens.splice(index, 1);
    toast(`Produto removido.`);
    await salvarCardapio(true);
  }
};

/* ==========================================================
 * GERENCIAR CATEGORIAS (OCULTAR / MOSTRAR / RENOMEAR / EXCLUIR)
 * ========================================================== */

window.alternarOcultarCategoriaPorIndice = async function (catIdx) {
  if (!isAdmin) return;
  ensureExtraData();
  const nomeCat = D.cats[catIdx];
  if (!nomeCat) return;

  const pos = D.catsOcultas.indexOf(nomeCat);
  if (pos >= 0) {
    D.catsOcultas.splice(pos, 1);
    toast(`👁️ Categoria "${nomeCat}" agora está VISÍVEL para os clientes!`);
  } else {
    D.catsOcultas.push(nomeCat);
    toast(`🙈 Categoria "${nomeCat}" ocultada para os clientes (continua salva)!`);
  }
  await salvarCardapio(false);
  renderListaGerenciarCategorias();
};

window.renomearCategoriaPorIndice = async function (catIdx) {
  if (!isAdmin) return;
  ensureExtraData();
  const nomeAtual = D.cats[catIdx];
  if (!nomeAtual) return;

  const novoNome = prompt(`Digite o novo nome para a categoria "${nomeAtual}":`, nomeAtual);
  if (!novoNome || !novoNome.trim() || novoNome.trim() === nomeAtual) return;
  const limpo = novoNome.trim();

  if (D.cats.includes(limpo)) {
    alert('Já existe uma categoria com esse nome!');
    return;
  }

  D.cats[catIdx] = limpo;
  if (D.catsGrupo) {
    D.catsGrupo[limpo] = D.catsGrupo[nomeAtual] || inferirGrupoPadrao(limpo);
    delete D.catsGrupo[nomeAtual];
  }
  const posOculta = D.catsOcultas.indexOf(nomeAtual);
  if (posOculta >= 0) D.catsOcultas[posOculta] = limpo;
  D.itens.forEach(it => {
    if (it.c === nomeAtual) it.c = limpo;
  });
  if (cat === nomeAtual) cat = limpo;

  toast(`✏️ Categoria renomeada para "${limpo}"!`);
  await salvarCardapio(false);
  renderListaGerenciarCategorias();
};

window.excluirCategoriaPorIndice = async function (catIdx) {
  if (!isAdmin) return;
  ensureExtraData();
  const nomeCat = D.cats[catIdx];
  if (!nomeCat) return;

  const qtdItens = D.itens.filter(it => it.c === nomeCat).length;
  const msg = qtdItens > 0
    ? `Atenção: A categoria "${nomeCat}" possui ${qtdItens} produto(s).\n\n💡 DICA: Se você só não tem esses itens agora, clique em "Cancelar" e use o botão "🙈 Ocultar" para deixá-la salva para o futuro!\n\nDeseja realmente EXCLUIR DEFINITIVAMENTE a categoria "${nomeCat}" e seus ${qtdItens} produto(s)?`
    : `Deseja excluir definitivamente a categoria "${nomeCat}"?`;

  if (!confirm(msg)) return;

  D.cats.splice(catIdx, 1);
  if (D.catsGrupo) {
    delete D.catsGrupo[nomeCat];
  }
  D.catsOcultas = D.catsOcultas.filter(c => c !== nomeCat);
  D.itens = D.itens.filter(it => it.c !== nomeCat);
  if (cat === nomeCat) cat = 'Todas';

  toast(`🗑️ Categoria "${nomeCat}" excluída.`);
  await salvarCardapio(false);
  renderListaGerenciarCategorias();
};

window.abrirModalCategorias = function () {
  if (!isAdmin) return;
  ensureExtraData();
  const selGrupo = $('#nova-cat-grupo');
  if (selGrupo && grupo !== 'todos') {
    selGrupo.value = grupo;
  }
  renderListaGerenciarCategorias();
  $('#modal-categorias').classList.add('aberto');
  setTimeout(() => {
    const inp = $('#nova-cat-rapida');
    if (inp) inp.focus();
  }, 120);
};

window.fecharModalCategorias = function () {
  $('#modal-categorias').classList.remove('aberto');
};

window.adicionarCategoriaRapida = async function () {
  if (!isAdmin) return;
  ensureExtraData();
  const inp = $('#nova-cat-rapida');
  const nome = (inp ? inp.value : '').trim();
  if (!nome) {
    alert('Digite o nome da nova categoria.');
    return;
  }
  if (D.cats.includes(nome)) {
    alert('Essa categoria já existe!');
    return;
  }
  const selGrupo = $('#nova-cat-grupo');
  const grupoEscolhido = (selGrupo ? selGrupo.value : '') || (grupo !== 'todos' ? grupo : 'picoles');

  D.cats.unshift(nome);
  if (!D.catsGrupo) D.catsGrupo = {};
  D.catsGrupo[nome] = grupoEscolhido;

  if (inp) inp.value = '';

  const grupoNomes = {
    picoles: 'Picolés & Paletas',
    potes: 'Potes',
    loja: 'Copos, Açaís & Milkshakes'
  };
  toast(`➕ Categoria "${nome}" criada na aba ${grupoNomes[grupoEscolhido] || grupoEscolhido}!`);

  if (grupo !== 'todos' && grupo !== grupoEscolhido) {
    grupo = grupoEscolhido;
  }

  await salvarCardapio(false);
  renderListaGerenciarCategorias();
};

window.alterarGrupoCategoriaPorIndice = async function (catIdx, novoGrupo) {
  if (!isAdmin) return;
  ensureExtraData();
  const nomeCat = D.cats[catIdx];
  if (!nomeCat) return;

  if (!D.catsGrupo) D.catsGrupo = {};
  D.catsGrupo[nomeCat] = novoGrupo;

  // Atualiza também os produtos existentes dessa categoria para o novo grupo
  let qtdItensAtualizados = 0;
  D.itens.forEach(it => {
    if (it && it.c === nomeCat) {
      it.g = novoGrupo;
      qtdItensAtualizados++;
    }
  });

  const grupoNomes = {
    picoles: 'Picolés & Paletas',
    potes: 'Potes',
    loja: 'Copos, Açaís & Milkshakes'
  };
  toast(`📁 Categoria "${nomeCat}" agora aparece na aba "${grupoNomes[novoGrupo] || novoGrupo}"!`);
  await salvarCardapio(false);
  renderListaGerenciarCategorias();
};

function renderListaGerenciarCategorias() {
  const el = $('#lista-gerenciar-cats');
  if (!el || !D) return;
  ensureExtraData();

  if (!D.cats.length) {
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--tinta-fraca)">Nenhuma categoria cadastrada.</div>';
    return;
  }

  el.innerHTML = D.cats.map((c, idx) => {
    const oculta = isCatOculta(c);
    const qtd = D.itens.filter(it => it.c === c).length;
    const grp = getGrupoDaCategoria(c);
    return `
      <div class="item-gerenciar-cat ${oculta ? 'oculta' : ''}">
        <div class="item-gerenciar-cat-info">
          <div class="item-gerenciar-cat-topo">
            <span class="item-gerenciar-cat-nome">${oculta ? '🙈 ' : '✅ '}${esc(c)}</span>
            <span class="item-gerenciar-cat-qtd">${qtd} ${qtd === 1 ? 'produto' : 'produtos'}</span>
            ${oculta ? '<span class="aviso-oculto-admin">Invisível p/ clientes</span>' : ''}
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <label style="font-size:12px;color:var(--tinta-fraca);font-weight:700">Aba:</label>
            <select class="sel-cat-grupo-admin" onchange="alterarGrupoCategoriaPorIndice(${idx}, this.value)" title="Definir em qual aba esta categoria aparece">
              <option value="picoles" ${grp === 'picoles' ? 'selected' : ''}>🍦 Picolés & Paletas</option>
              <option value="potes" ${grp === 'potes' ? 'selected' : ''}>🍨 Potes (pra levar)</option>
              <option value="loja" ${grp === 'loja' ? 'selected' : ''}>🥤 Copos, Açaís & Shakes</option>
            </select>
          </div>
        </div>
        <div class="item-gerenciar-cat-acoes">
          <button type="button" class="btn-secao-admin adicionar" onclick="abrirModalNovoProdutoPorCategoria(${idx})" title="Adicionar produto nesta categoria">
            ➕ Produto
          </button>
          <button type="button" class="btn-secao-admin ${oculta ? 'ativo-oculto' : ''}" onclick="alternarOcultarCategoriaPorIndice(${idx})">
            ${oculta ? '👁️ Mostrar' : '🙈 Ocultar'}
          </button>
          <button type="button" class="btn-secao-admin" onclick="renomearCategoriaPorIndice(${idx})" title="Renomear categoria">
            ✏️
          </button>
          <button type="button" class="btn-secao-admin perigo" onclick="excluirCategoriaPorIndice(${idx})" title="Excluir categoria">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================
 * EDIÇÃO DO CARD DE DESTAQUE E BLOG / MURAL
 * ========================================================== */

window.abrirModalDestaque = function () {
  if (!isAdmin) return;
  ensureExtraData();
  const d = D.destaque;
  $('#dest-ativo').checked = Boolean(d.ativo);
  $('#dest-tag').value = d.tag || '';
  $('#dest-titulo').value = d.titulo || '';
  $('#dest-sub').value = d.subtitulo || '';
  $('#dest-texto').value = d.texto || '';
  $('#dest-btn').value = d.botaoTexto || '';
  $('#dest-foto-url').value = d.img || '';
  $('#dest-foto-preview').innerHTML = d.img ? `<img src="${esc(d.img)}">` : '<span>Sem foto</span>';
  $('#modal-destaque').classList.add('aberto');
};

window.fecharModalDestaque = function () {
  $('#modal-destaque').classList.remove('aberto');
};

async function submitDestaque(e) {
  e.preventDefault();
  ensureExtraData();
  D.destaque = {
    ativo: $('#dest-ativo').checked,
    tag: $('#dest-tag').value.trim(),
    titulo: $('#dest-titulo').value.trim() || 'Destaque Sorveteria Lolla',
    subtitulo: $('#dest-sub').value.trim(),
    texto: $('#dest-texto').value.trim(),
    botaoTexto: $('#dest-btn').value.trim() || 'Pedir pelo WhatsApp',
    img: $('#dest-foto-url').value.trim() || DEFAULT_DESTAQUE.img
  };
  fecharModalDestaque();
  toast('✨ Card de destaque atualizado!');
  await salvarCardapio(false);
}

window.alternarVisibilidadeDestaque = async function () {
  if (!isAdmin) return;
  ensureExtraData();
  D.destaque.ativo = !D.destaque.ativo;
  toast(D.destaque.ativo ? '👁️ Card de Destaque visível para os clientes!' : '🙈 Card de Destaque ocultado para os clientes (continua salvo)!');
  await salvarCardapio(false);
};

/* ==========================================================
 * SISTEMA: MONTE O SEU AÇAÍ (CLIENTE & CARRINHO)
 * ========================================================== */

let acaiModalState = {
  tamanho: '500ml',
  baseId: 'tradicional',
  acompanhamentos: new Set(),
  cremes: new Set()
};

window.rolarParaCoposAcai = function () {
  const secao = document.querySelector('.bloco-categoria');
  if (secao) {
    secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('👇 Escolha o copo desejado abaixo para personalizar!');
  } else {
    abrirModalMontarAcai('tradicional', '300ml');
  }
};

window.abrirModalMontarAcai = function (baseIdPre = 'tradicional', tamPre = '500ml', itemIndex = null) {
  ensureExtraData();
  const cfg = D.acaiCustomizavel || DEFAULT_ACAI_CONFIG;

  let itemImg = 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/202502271647_N364_i_v1_400.jpg';
  let itemNome = '';

  if (itemIndex !== null && typeof itemIndex === 'number' && D.itens && D.itens[itemIndex]) {
    const prod = D.itens[itemIndex];
    if (prod.baseId) baseIdPre = prod.baseId;
    if (prod.tamanho) tamPre = prod.tamanho;
    itemNome = prod.n;
    if (prod.img) itemImg = prod.img;
    else if (prod.w4) itemImg = `${CONFIG.fotosBaseUrl}${prod.w4}`;
    else if (prod.j) itemImg = `${CONFIG.fotosBaseUrl}${prod.j}`;
  }

  acaiModalState = {
    tamanho: (cfg.tamanhos && cfg.tamanhos.some(t => t.id === tamPre)) ? tamPre : tamPre,
    baseId: (cfg.bases && cfg.bases.some(b => b.id === baseIdPre)) ? baseIdPre : baseIdPre,
    itemIndex: itemIndex,
    itemImg: itemImg,
    itemNome: itemNome,
    acompanhamentos: new Set(),
    cremes: new Set()
  };

  renderModalMontarAcaiTopo();
  renderModalMontarAcaiAcomp();
  renderModalMontarAcaiCremes();
  atualizarResumoAcai();

  const modal = $('#modal-montar-acai');
  if (modal) modal.classList.add('aberto');
};

window.fecharModalMontarAcai = function () {
  const modal = $('#modal-montar-acai');
  if (modal) modal.classList.remove('aberto');
};

function renderModalMontarAcaiTopo() {
  const el = $('#acai-topo-copo-selecionado');
  if (!el) return;

  const cfg = D.acaiCustomizavel || DEFAULT_ACAI_CONFIG;
  const tamAtual = acaiModalState.tamanho || '500ml';
  const baseAtual = acaiModalState.baseId || 'tradicional';

  const tamObj = (cfg.tamanhos || []).find(t => t.id === tamAtual) || { nome: tamAtual === '300ml' ? 'Copo 300ml' : 'Copo 500ml' };
  const baseObj = (cfg.bases || []).find(b => b.id === baseAtual) || { nome: 'Açaí Tradicional' };

  let precoBase = 18.00;
  if (baseObj.precos && baseObj.precos[tamAtual] !== undefined) {
    precoBase = parseFloat(baseObj.precos[tamAtual]);
  } else if (tamAtual === '300ml') {
    precoBase = baseAtual === 'tradicional' ? 15.00 : 17.00;
  } else {
    precoBase = baseAtual === 'tradicional' ? 18.00 : 20.00;
  }

  const fotoCopo = acaiModalState.itemImg || 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/202502271647_N364_i_v1_400.jpg';

  el.innerHTML = `
    <div class="acai-copo-selecionado-card">
      <div class="acai-copo-sel-foto">
        <img src="${esc(fotoCopo)}" alt="${esc(baseObj.nome)}">
      </div>
      <div class="acai-copo-sel-info">
        <div class="acai-copo-sel-tags">
          <span class="acai-tag-tam">🥤 ${esc(tamObj.nome)}</span>
          <span class="acai-tag-base">${esc(baseObj.nome)}</span>
        </div>
        <h4 class="acai-copo-sel-titulo">Açaí no ${esc(tamObj.nome)} • ${esc(baseObj.nome)}</h4>
        <div class="acai-copo-sel-preco-wrap">
          <span class="acai-copo-sel-preco-label">Preço Base do Copo:</span>
          <span class="acai-copo-sel-preco-val">R$ ${brl(precoBase)}</span>
        </div>
      </div>
    </div>
    <div class="acai-copo-sel-aviso">
      💡 <strong>Copo e sabor selecionados!</strong> Agora escolha abaixo os acompanhamentos e cremes que desejar (opcionais):
    </div>
  `;
}

function renderModalMontarAcaiAcomp() {
  const el = $('#acai-container-acompanhamentos');
  if (!el) return;
  const cfg = D.acaiCustomizavel || DEFAULT_ACAI_CONFIG;
  const acomp = (cfg.acompanhamentos || []).filter(a => a.ativo !== false);

  el.innerHTML = acomp.map(a => {
    const sel = acaiModalState.acompanhamentos.has(a.id);
    const iconeHtml = a.img ? `<img src="${esc(a.img)}" alt="${esc(a.nome)}">` : `<span>${a.icone || '🍓'}</span>`;
    return `
      <div class="acai-extra-card ${sel ? 'selecionado' : ''}" onclick="alternarAcompanhamentoAcai('${esc(a.id)}')">
        <span class="acai-check-marcador">✓</span>
        <div class="acai-extra-icone">${iconeHtml}</div>
        <div class="acai-extra-info">
          <strong class="acai-extra-nome">${esc(a.nome)}</strong>
          <span class="acai-extra-preco">+ R$ ${brl(a.preco || 4)}</span>
        </div>
      </div>
    `;
  }).join('');
}

window.alternarAcompanhamentoAcai = function (acompId) {
  if (acaiModalState.acompanhamentos.has(acompId)) {
    acaiModalState.acompanhamentos.delete(acompId);
  } else {
    acaiModalState.acompanhamentos.add(acompId);
  }
  renderModalMontarAcaiAcomp();
  atualizarResumoAcai();
};

function renderModalMontarAcaiCremes() {
  const el = $('#acai-container-cremes');
  if (!el) return;
  const cfg = D.acaiCustomizavel || DEFAULT_ACAI_CONFIG;
  const cremes = (cfg.cremes || []).filter(c => c.ativo !== false);

  el.innerHTML = cremes.map(c => {
    const sel = acaiModalState.cremes.has(c.id);
    const iconeHtml = c.img ? `<img src="${esc(c.img)}" alt="${esc(c.nome)}">` : `<span>${c.icone || '🍪'}</span>`;
    return `
      <div class="acai-extra-card ${sel ? 'selecionado' : ''}" onclick="alternarCremeAcai('${esc(c.id)}')">
        <span class="acai-check-marcador">✓</span>
        <div class="acai-extra-icone">${iconeHtml}</div>
        <div class="acai-extra-info">
          <strong class="acai-extra-nome">${esc(c.nome)}</strong>
          <span class="acai-extra-preco">+ R$ ${brl(c.preco || 5)}</span>
        </div>
      </div>
    `;
  }).join('');
}

window.alternarCremeAcai = function (cremeId) {
  if (acaiModalState.cremes.has(cremeId)) {
    acaiModalState.cremes.delete(cremeId);
  } else {
    acaiModalState.cremes.add(cremeId);
  }
  renderModalMontarAcaiCremes();
  atualizarResumoAcai();
};

function calcularPrecoAcaiTotal() {
  const cfg = D.acaiCustomizavel || DEFAULT_ACAI_CONFIG;
  const tamAtual = acaiModalState.tamanho || '500ml';
  const base = (cfg.bases || []).find(b => b.id === acaiModalState.baseId) || (cfg.bases && cfg.bases[0]);
  let total = base && base.precos && base.precos[tamAtual] !== undefined ? parseFloat(base.precos[tamAtual]) : 18.00;

  acaiModalState.acompanhamentos.forEach(id => {
    const a = (cfg.acompanhamentos || []).find(it => it.id === id);
    if (a) total += parseFloat(a.preco) || 0;
  });

  acaiModalState.cremes.forEach(id => {
    const c = (cfg.cremes || []).find(it => it.id === id);
    if (c) total += parseFloat(c.preco) || 0;
  });

  return total;
}

function atualizarResumoAcai() {
  const cfg = D.acaiCustomizavel || DEFAULT_ACAI_CONFIG;
  const tam = (cfg.tamanhos || []).find(t => t.id === acaiModalState.tamanho) || { nome: acaiModalState.tamanho };
  const base = (cfg.bases || []).find(b => b.id === acaiModalState.baseId) || { nome: 'Açaí' };
  const total = calcularPrecoAcaiTotal();

  const qAcomp = acaiModalState.acompanhamentos.size;
  const qCremes = acaiModalState.cremes.size;

  let txtDesc = `<strong>${esc(tam.nome)}</strong> • ${esc(base.nome)}`;
  if (qAcomp > 0) txtDesc += ` • ${qAcomp} acomp.`;
  if (qCremes > 0) txtDesc += ` • ${qCremes} ${qCremes === 1 ? 'creme' : 'cremes'}`;

  const descEl = $('#acai-resumo-descricao');
  if (descEl) descEl.innerHTML = txtDesc;

  const valEl = $('#acai-resumo-valor');
  if (valEl) valEl.textContent = `R$ ${brl(total)}`;
}

window.confirmarAdicionarAcaiCarrinho = function (ev) {
  const cfg = D.acaiCustomizavel || DEFAULT_ACAI_CONFIG;
  const tam = (cfg.tamanhos || []).find(t => t.id === acaiModalState.tamanho) || { id: '500ml', nome: 'Copo 500ml' };
  const base = (cfg.bases || []).find(b => b.id === acaiModalState.baseId) || (cfg.bases && cfg.bases[0]) || { nome: 'Açaí Tradicional' };
  
  const acompNomes = Array.from(acaiModalState.acompanhamentos)
    .map(id => ((cfg.acompanhamentos || []).find(a => a.id === id) || {}).nome)
    .filter(Boolean);

  const cremeNomes = Array.from(acaiModalState.cremes)
    .map(id => ((cfg.cremes || []).find(c => c.id === id) || {}).nome)
    .filter(Boolean);

  let descLinhas = [`Base: ${base.nome}`];
  if (acompNomes.length) descLinhas.push(`Acompanhamentos: ${acompNomes.join(', ')}`);
  if (cremeNomes.length) descLinhas.push(`Cremes: ${cremeNomes.join(', ')}`);

  const precoTotal = calcularPrecoAcaiTotal();
  const nomeProduto = acaiModalState.itemNome || `Açaí no ${tam.nome} - ${base.nome}`;
  const descFormatada = descLinhas.join(' • ');

  carrinho.push({
    itemIndex: acaiModalState.itemIndex !== null ? acaiModalState.itemIndex : -99,
    nome: nomeProduto,
    nomeCompleto: `${nomeProduto} - ${base.nome}`,
    tamanho: tam.id,
    desc: descFormatada,
    preco: precoTotal,
    precoAntigo: 0,
    img: acaiModalState.itemImg || base.img || 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/202502271647_N364_i_v1_400.jpg',
    imgRot: 0,
    imgScale: 100,
    imgPosX: 0,
    imgPosY: 0,
    imgFit: 'cover',
    qtd: 1,
    isAcaiCustom: true
  });

  salvarCarrinho();
  atualizarBadgeCarrinho();
  fecharModalMontarAcai();
  toast('🍧 Seu açaí personalizado foi adicionado ao pedido!');
  abrirCarrinho();
};

window.confirmarPedirAcaiZap = function () {
  confirmarAdicionarAcaiCarrinho();

  const totalVal = valorTotalCarrinho();
  const pedidoMin = getPedidoMinimo();
  if (totalVal < pedidoMin) {
    const falta = pedidoMin - totalVal;
    toast(`🍧 Açaí adicionado! Pedido mínimo para entrega é de R$ ${brl(pedidoMin)} (faltam R$ ${brl(falta)}).`);
  }
  abrirCarrinho();
};

/* ==========================================================
 * SISTEMA: GERENCIADOR DE AÇAÍ (ADMIN: PREÇOS, FOTOS E NOMES)
 * ========================================================== */

let acaiAdminTempConfig = null;

window.abrirModalAdminAcai = function () {
  if (!isAdmin) return;
  ensureExtraData();
  acaiAdminTempConfig = JSON.parse(JSON.stringify(D.acaiCustomizavel || DEFAULT_ACAI_CONFIG));
  trocarAbaAdminAcai('bases');
  $('#modal-admin-acai').classList.add('aberto');
};

window.fecharModalAdminAcai = function () {
  $('#modal-admin-acai').classList.remove('aberto');
  acaiAdminTempConfig = null;
};

window.trocarAbaAdminAcai = function (aba) {
  ['bases', 'acompanhamentos', 'cremes'].forEach(a => {
    const el = $(`#aba-admin-acai-${a}`);
    const btn = $(`#btn-aba-${a === 'bases' ? 'bases' : (a === 'acompanhamentos' ? 'acomp' : 'cremes')}`);
    if (el) el.style.display = (a === aba) ? 'block' : 'none';
    if (btn) {
      if (a === aba) btn.classList.add('ativo');
      else btn.classList.remove('ativo');
    }
  });

  if (aba === 'bases') renderAdminAcaiBases();
  else if (aba === 'acompanhamentos') renderAdminAcaiAcomp();
  else if (aba === 'cremes') renderAdminAcaiCremes();
};

function renderAdminAcaiBases() {
  const el = $('#lista-admin-bases');
  if (!el || !acaiAdminTempConfig) return;
  const bases = acaiAdminTempConfig.bases || [];

  el.innerHTML = bases.map((b, idx) => `
    <div class="acai-admin-item-card" data-idx="${idx}">
      <div style="width:48px;height:48px;border-radius:10px;background:#fff;overflow:hidden;flex-shrink:0;border:1px solid var(--borda)">
        <img id="admin-base-img-prev-${idx}" src="${esc(b.img || '/assets/marca/cat-acai-monte.webp')}" style="width:100%;height:100%;object-fit:cover">
      </div>
      <div style="flex:1;min-width:180px">
        <label style="font-size:11px;font-weight:700;color:var(--tinta-fraca)">Nome da Base:</label>
        <input type="text" value="${esc(b.nome)}" onchange="acaiAdminTempConfig.bases[${idx}].nome = this.value" style="width:100%;padding:6px 10px;border-radius:8px;border:1.5px solid var(--borda)">
      </div>
      <div style="width:100px">
        <label style="font-size:11px;font-weight:700;color:var(--tinta-fraca)">Preço 300ml:</label>
        <input type="number" step="0.50" value="${b.precos ? b.precos['300ml'] : 15}" onchange="if(!acaiAdminTempConfig.bases[${idx}].precos) acaiAdminTempConfig.bases[${idx}].precos={}; acaiAdminTempConfig.bases[${idx}].precos['300ml'] = parseFloat(this.value)||0" style="width:100%;padding:6px 8px;border-radius:8px;border:1.5px solid var(--borda)">
      </div>
      <div style="width:100px">
        <label style="font-size:11px;font-weight:700;color:var(--tinta-fraca)">Preço 500ml:</label>
        <input type="number" step="0.50" value="${b.precos ? b.precos['500ml'] : 18}" onchange="if(!acaiAdminTempConfig.bases[${idx}].precos) acaiAdminTempConfig.bases[${idx}].precos={}; acaiAdminTempConfig.bases[${idx}].precos['500ml'] = parseFloat(this.value)||0" style="width:100%;padding:6px 8px;border-radius:8px;border:1.5px solid var(--borda)">
      </div>
      <div>
        <label class="btn-admin secundario" style="font-size:12px;padding:6px 10px;cursor:pointer">
          📷 Foto
          <input type="file" accept="image/*" style="display:none" onchange="uploadFotoBaseAdmin(${idx}, event)">
        </label>
        <button type="button" class="btn-admin perigo" onclick="removerBaseAcai(${idx})" style="padding:6px 10px;font-size:12px">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.uploadFotoBaseAdmin = async function (idx, ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  toast('📸 Otimizando e enviando foto da base...');
  const url = await uploadImagemArquivo(file);
  if (url && acaiAdminTempConfig && acaiAdminTempConfig.bases[idx]) {
    acaiAdminTempConfig.bases[idx].img = url;
    const imgPrev = $(`#admin-base-img-prev-${idx}`);
    if (imgPrev) imgPrev.src = url;
  }
};

window.adicionarNovaBaseAcai = function () {
  if (!acaiAdminTempConfig) return;
  const novoId = 'base-' + Date.now();
  acaiAdminTempConfig.bases.push({
    id: novoId,
    nome: 'Nova Base de Açaí',
    desc: 'Delicioso açaí especial',
    img: '/assets/marca/cat-acai-monte.webp',
    precos: { '300ml': 16.00, '500ml': 19.00 },
    ativo: true
  });
  renderAdminAcaiBases();
};

window.removerBaseAcai = function (idx) {
  if (!acaiAdminTempConfig || !acaiAdminTempConfig.bases[idx]) return;
  if (!confirm(`Deseja realmente remover "${acaiAdminTempConfig.bases[idx].nome}"?`)) return;
  acaiAdminTempConfig.bases.splice(idx, 1);
  renderAdminAcaiBases();
};

function renderAdminAcaiAcomp() {
  const el = $('#lista-admin-acompanhamentos');
  if (!el || !acaiAdminTempConfig) return;
  const acomp = acaiAdminTempConfig.acompanhamentos || [];

  el.innerHTML = acomp.map((a, idx) => `
    <div class="acai-admin-item-card" data-idx="${idx}">
      <div style="width:40px;height:40px;border-radius:10px;background:#fff;display:grid;place-items:center;font-size:22px;flex-shrink:0;overflow:hidden;border:1px solid var(--borda)">
        ${a.img ? `<img src="${esc(a.img)}" style="width:100%;height:100%;object-fit:cover">` : `<span>${a.icone || '🍓'}</span>`}
      </div>
      <div style="flex:1;min-width:160px">
        <label style="font-size:11px;font-weight:700;color:var(--tinta-fraca)">Nome:</label>
        <input type="text" value="${esc(a.nome)}" onchange="acaiAdminTempConfig.acompanhamentos[${idx}].nome = this.value" style="width:100%;padding:6px 10px;border-radius:8px;border:1.5px solid var(--borda)">
      </div>
      <div style="width:90px">
        <label style="font-size:11px;font-weight:700;color:var(--tinta-fraca)">Preço (R$):</label>
        <input type="number" step="0.50" value="${a.preco || 4}" onchange="acaiAdminTempConfig.acompanhamentos[${idx}].preco = parseFloat(this.value)||0" style="width:100%;padding:6px 8px;border-radius:8px;border:1.5px solid var(--borda)">
      </div>
      <div>
        <label class="btn-admin secundario" style="font-size:12px;padding:6px 10px;cursor:pointer">
          📷 Foto
          <input type="file" accept="image/*" style="display:none" onchange="uploadFotoAcompAdmin(${idx}, event)">
        </label>
        <button type="button" class="btn-admin perigo" onclick="removerAcompanhamentoAcai(${idx})" style="padding:6px 10px;font-size:12px">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.uploadFotoAcompAdmin = async function (idx, ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  toast('📸 Enviando foto do acompanhamento...');
  const url = await uploadImagemArquivo(file);
  if (url && acaiAdminTempConfig && acaiAdminTempConfig.acompanhamentos[idx]) {
    acaiAdminTempConfig.acompanhamentos[idx].img = url;
    renderAdminAcaiAcomp();
  }
};

window.adicionarNovoAcompanhamentoAcai = function () {
  if (!acaiAdminTempConfig) return;
  const novoId = 'acomp-' + Date.now();
  acaiAdminTempConfig.acompanhamentos.push({
    id: novoId,
    nome: 'Novo Acompanhamento',
    preco: 4.00,
    img: '',
    icone: '✨',
    ativo: true
  });
  renderAdminAcaiAcomp();
};

window.removerAcompanhamentoAcai = function (idx) {
  if (!acaiAdminTempConfig || !acaiAdminTempConfig.acompanhamentos[idx]) return;
  acaiAdminTempConfig.acompanhamentos.splice(idx, 1);
  renderAdminAcaiAcomp();
};

function renderAdminAcaiCremes() {
  const el = $('#lista-admin-cremes');
  if (!el || !acaiAdminTempConfig) return;
  const cremes = acaiAdminTempConfig.cremes || [];

  el.innerHTML = cremes.map((c, idx) => `
    <div class="acai-admin-item-card" data-idx="${idx}">
      <div style="width:40px;height:40px;border-radius:10px;background:#fff;display:grid;place-items:center;font-size:22px;flex-shrink:0;overflow:hidden;border:1px solid var(--borda)">
        ${c.img ? `<img src="${esc(c.img)}" style="width:100%;height:100%;object-fit:cover">` : `<span>${c.icone || '🍪'}</span>`}
      </div>
      <div style="flex:1;min-width:160px">
        <label style="font-size:11px;font-weight:700;color:var(--tinta-fraca)">Nome:</label>
        <input type="text" value="${esc(c.nome)}" onchange="acaiAdminTempConfig.cremes[${idx}].nome = this.value" style="width:100%;padding:6px 10px;border-radius:8px;border:1.5px solid var(--borda)">
      </div>
      <div style="width:90px">
        <label style="font-size:11px;font-weight:700;color:var(--tinta-fraca)">Preço (R$):</label>
        <input type="number" step="0.50" value="${c.preco || 5}" onchange="acaiAdminTempConfig.cremes[${idx}].preco = parseFloat(this.value)||0" style="width:100%;padding:6px 8px;border-radius:8px;border:1.5px solid var(--borda)">
      </div>
      <div>
        <label class="btn-admin secundario" style="font-size:12px;padding:6px 10px;cursor:pointer">
          📷 Foto
          <input type="file" accept="image/*" style="display:none" onchange="uploadFotoCremeAdmin(${idx}, event)">
        </label>
        <button type="button" class="btn-admin perigo" onclick="removerCremeAcai(${idx})" style="padding:6px 10px;font-size:12px">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.uploadFotoCremeAdmin = async function (idx, ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  toast('📸 Enviando foto do creme...');
  const url = await uploadImagemArquivo(file);
  if (url && acaiAdminTempConfig && acaiAdminTempConfig.cremes[idx]) {
    acaiAdminTempConfig.cremes[idx].img = url;
    renderAdminAcaiCremes();
  }
};

window.adicionarNovoCremeAcai = function () {
  if (!acaiAdminTempConfig) return;
  const novoId = 'creme-' + Date.now();
  acaiAdminTempConfig.cremes.push({
    id: novoId,
    nome: 'Novo Creme',
    preco: 5.00,
    img: '',
    icone: '✨',
    ativo: true
  });
  renderAdminAcaiCremes();
};

window.removerCremeAcai = function (idx) {
  if (!acaiAdminTempConfig || !acaiAdminTempConfig.cremes[idx]) return;
  acaiAdminTempConfig.cremes.splice(idx, 1);
  renderAdminAcaiCremes();
};

window.salvarConfiguracoesAdminAcai = async function () {
  if (!isAdmin || !acaiAdminTempConfig) return;
  D.acaiCustomizavel = JSON.parse(JSON.stringify(acaiAdminTempConfig));
  fecharModalAdminAcai();
  toast('💾 Opções do Açaí atualizadas e salvas!');
  await salvarCardapio(false);
  render();
};

/* ==========================================================
 * SISTEMA: GERENCIADOR DE DESTAQUES DA SEMANA (ADMIN)
 * ========================================================== */

let destaquesTempIds = [];
let filtroDestaqueTexto = '';

window.abrirModalGerenciarDestaques = function () {
  if (!isAdmin) return;
  ensureExtraData();
  destaquesTempIds = Array.isArray(D.destaquesMomento) ? [...D.destaquesMomento] : [0, 1, 2];
  filtroDestaqueTexto = '';
  const searchInput = $('#busca-produtos-destaque');
  if (searchInput) searchInput.value = '';
  renderListaProdutosModalDestaque();
  $('#modal-gerenciar-destaques').classList.add('aberto');
};

window.fecharModalGerenciarDestaques = function () {
  $('#modal-gerenciar-destaques').classList.remove('aberto');
};

window.filtrarProdutosModalDestaque = function (val) {
  filtroDestaqueTexto = (val || '').trim().toLowerCase();
  renderListaProdutosModalDestaque();
};

function renderListaProdutosModalDestaque() {
  const el = $('#lista-produtos-para-destaque');
  const contador = $('#contador-destaques-selecionados');
  if (!el || !D || !D.itens) return;

  if (contador) {
    contador.textContent = `${destaquesTempIds.length} selecionados`;
  }

  const produtosFiltrados = D.itens.map((it, idx) => ({ it, idx })).filter(({ it }) => {
    if (!filtroDestaqueTexto) return true;
    return (it.n && it.n.toLowerCase().includes(filtroDestaqueTexto)) ||
           (it.c && it.c.toLowerCase().includes(filtroDestaqueTexto)) ||
           (it.d && it.d.toLowerCase().includes(filtroDestaqueTexto));
  });

  if (!produtosFiltrados.length) {
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--tinta-fraca)">Nenhum produto encontrado.</div>';
    return;
  }

  el.innerHTML = produtosFiltrados.map(({ it, idx }) => {
    const sel = destaquesTempIds.includes(idx) || destaquesTempIds.includes(it.n);
    const { title, size } = formatProduct(it);
    const imgSrc = it.img || (it.j ? CONFIG.fotosBaseUrl + it.j : '/assets/marca/cat-acai-monte.webp');

    return `
      <div class="acai-admin-item-card" style="cursor:pointer;border-color:${sel ? '#D48806' : 'var(--borda)'};background:${sel ? '#FFFDF5' : '#fff'}" onclick="toggleProdutoDestaqueAdmin(${idx})">
        <input type="checkbox" ${sel ? 'checked' : ''} style="width:20px;height:20px;accent-color:#D48806;pointer-events:none">
        <div style="width:44px;height:44px;border-radius:10px;background:#fff;overflow:hidden;flex-shrink:0;border:1px solid var(--borda)">
          <img src="${esc(imgSrc)}" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div style="flex:1;min-width:180px">
          <strong style="display:block;font-size:13.5px;color:var(--tinta)">${esc(title)}</strong>
          <span style="font-size:11.5px;color:var(--tinta-fraca)">${esc(it.c)} ${size ? `• ${esc(size)}` : ''}</span>
        </div>
        <span style="font-weight:800;color:#85060F;font-size:14px">R$ ${brl(it.p)}</span>
        <span style="font-size:11px;font-weight:800;color:${sel ? '#D48806' : '#999'};background:${sel ? '#FFF8E7' : '#f0f0f0'};padding:3px 8px;border-radius:999px">
          ${sel ? '⭐ Destacado' : 'Normal'}
        </span>
      </div>
    `;
  }).join('');
}

window.toggleProdutoDestaqueAdmin = function (itemIndex) {
  const pos = destaquesTempIds.indexOf(itemIndex);
  if (pos >= 0) {
    destaquesTempIds.splice(pos, 1);
  } else {
    destaquesTempIds.push(itemIndex);
  }
  renderListaProdutosModalDestaque();
};

window.salvarDestaquesSemana = async function () {
  if (!isAdmin) return;
  D.destaquesMomento = [...destaquesTempIds];
  fecharModalGerenciarDestaques();
  toast('⭐ Destaques da semana atualizados com sucesso!');
  await salvarCardapio(false);
  renderDestaquesMomento();
  render();
};

window.alternarDestaqueProduto = async function (itemIndex) {
  if (!isAdmin) return;
  ensureExtraData();
  if (!Array.isArray(D.destaquesMomento)) D.destaquesMomento = [0, 1, 2];

  const pos = D.destaquesMomento.indexOf(itemIndex);
  const it = D.itens[itemIndex];
  const nome = it ? it.n : 'Produto';

  if (pos >= 0) {
    D.destaquesMomento.splice(pos, 1);
    toast(`⭐ "${nome}" removido dos destaques`);
  } else {
    D.destaquesMomento.push(itemIndex);
    toast(`⭐ "${nome}" agora está em destaque no topo do site!`);
  }

  await salvarCardapio(false);
  renderDestaquesMomento();
  render();
};

/* ==========================================================
 * GERENCIAR FOTOS DE NOSSOS PRODUTOS (ADMIN)
 * ========================================================== */

window.abrirSeletorFotoCatIcone = function (idx, ev) {
  if (ev) {
    ev.stopPropagation();
    ev.preventDefault();
  }
  const input = document.getElementById(`input-foto-cat-icone-${idx}`);
  if (input) input.click();
};

window.uploadFotoCategoriaIcone = async function (idx, ev) {
  if (ev) ev.stopPropagation();
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  toast('📸 Otimizando e enviando foto para o Supabase...');
  try {
    const url = await uploadImagemArquivo(file);
    if (!url) throw new Error('Falha ao processar imagem');
    ensureExtraData();
    if (D.iconesNossosProdutos && D.iconesNossosProdutos[idx]) {
      D.iconesNossosProdutos[idx].img = url;
      toast('✅ Foto da categoria salva no Supabase com sucesso!');
      await salvarCardapio(false);
      renderCategoriasIcones();
    }
  } catch (err) {
    console.error('Erro ao trocar foto da categoria:', err);
    toast('❌ Erro ao enviar foto: ' + (err.message || err));
  }
};

let iconesCategoriasTemp = [];

window.abrirModalGerenciarIconesCategorias = function () {
  if (!isAdmin) {
    toast('Acesso restrito ao administrador');
    return;
  }
  ensureExtraData();
  iconesCategoriasTemp = JSON.parse(JSON.stringify(D.iconesNossosProdutos || DEFAULT_ICONES_NOSSOS_PRODUTOS));
  renderListaIconesCategoriasAdmin();
  const modal = $('#modal-gerenciar-icones-cats');
  if (modal) modal.classList.add('aberto');
};

window.fecharModalGerenciarIconesCategorias = function () {
  const modal = $('#modal-gerenciar-icones-cats');
  if (modal) modal.classList.remove('aberto');
};

function renderListaIconesCategoriasAdmin() {
  const listaEl = document.getElementById('lista-icones-categorias-admin');
  if (!listaEl) return;

  const todasCategorias = Array.isArray(D.cats) ? D.cats : [];

  if (!iconesCategoriasTemp.length) {
    listaEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--tinta-fraca)">Nenhuma categoria cadastrada.</div>';
    return;
  }

  listaEl.innerHTML = iconesCategoriasTemp.map((item, idx) => {
    const catOptionsHtml = todasCategorias.map(c => `
      <option value="${esc(c)}" ${item.cat === c ? 'selected' : ''}>${esc(c)}</option>
    `).join('');

    return `
      <div class="icone-cat-admin-item">
        <div class="icone-cat-thumb-wrap">
          <img src="${esc(item.img)}" alt="${esc(item.label)}">
        </div>
        <div class="icone-cat-inputs">
          <div style="display:flex;gap:6px;align-items:center">
            <button type="button" class="btn-admin secundario" onclick="document.getElementById('modal-cat-file-${idx}').click()" style="font-size:11px;padding:4px 8px;white-space:nowrap">
              📁 Trocar Foto
            </button>
            <input type="file" id="modal-cat-file-${idx}" accept="image/*" style="display:none" onchange="uploadFotoIconeModal(${idx}, event)">
            <input type="text" value="${esc(item.img)}" placeholder="URL da Foto..." oninput="atualizarImgUrlIconeModal(${idx}, this.value)" style="flex:1">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div>
              <label style="font-size:10px;font-weight:700;color:var(--tinta-fraca);display:block">Título exibido:</label>
              <input type="text" value="${esc(item.label)}" placeholder="Nome exibido" oninput="atualizarLabelIconeModal(${idx}, this.value)">
            </div>
            <div>
              <label style="font-size:10px;font-weight:700;color:var(--tinta-fraca);display:block">Categoria vinculada no cardápio:</label>
              <select onchange="atualizarCatVinculadaModal(${idx}, this.value)">
                ${catOptionsHtml}
              </select>
            </div>
          </div>
        </div>
        <div class="icone-cat-acoes">
          <button type="button" class="icone-cat-btn-acao" onclick="moverIconeCategoriaModal(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:.4"' : ''} title="Mover para cima">▲</button>
          <button type="button" class="icone-cat-btn-acao" onclick="moverIconeCategoriaModal(${idx}, 1)" ${idx === iconesCategoriasTemp.length - 1 ? 'disabled style="opacity:.4"' : ''} title="Mover para baixo">▼</button>
          <button type="button" class="icone-cat-btn-acao danger" onclick="removerIconeCategoriaModal(${idx})" title="Excluir este ícone">🗑</button>
        </div>
      </div>
    `;
  }).join('');
}

window.atualizarLabelIconeModal = function (idx, val) {
  if (iconesCategoriasTemp[idx]) {
    iconesCategoriasTemp[idx].label = val;
  }
};

window.atualizarCatVinculadaModal = function (idx, val) {
  if (iconesCategoriasTemp[idx]) {
    iconesCategoriasTemp[idx].cat = val;
  }
};

window.atualizarImgUrlIconeModal = function (idx, val) {
  if (iconesCategoriasTemp[idx]) {
    iconesCategoriasTemp[idx].img = val;
    const thumbWrap = document.querySelectorAll('.icone-cat-thumb-wrap')[idx];
    if (thumbWrap) {
      const img = thumbWrap.querySelector('img');
      if (img) img.src = val;
    }
  }
};

window.uploadFotoIconeModal = async function (idx, ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  toast('📸 Otimizando e enviando foto para o Supabase...');
  try {
    const url = await uploadImagemArquivo(file);
    if (!url) throw new Error('Falha no upload');
    if (iconesCategoriasTemp[idx]) {
      iconesCategoriasTemp[idx].img = url;
      renderListaIconesCategoriasAdmin();
      toast('✅ Foto da categoria carregada!');
    }
  } catch (err) {
    console.error('Erro upload foto modal:', err);
    toast('❌ Falha ao enviar foto: ' + (err.message || err));
  }
};

window.adicionarNovoIconeCategoriaModal = function () {
  ensureExtraData();
  const primeiraCat = (D.cats && D.cats[0]) || 'Geral';
  iconesCategoriasTemp.push({
    id: 'cat-' + Date.now(),
    cat: primeiraCat,
    label: primeiraCat,
    img: '/assets/marca/cat-acai-monte.webp'
  });
  renderListaIconesCategoriasAdmin();
};

window.moverIconeCategoriaModal = function (idx, direcao) {
  const novoIdx = idx + direcao;
  if (novoIdx < 0 || novoIdx >= iconesCategoriasTemp.length) return;
  const temp = iconesCategoriasTemp[idx];
  iconesCategoriasTemp[idx] = iconesCategoriasTemp[novoIdx];
  iconesCategoriasTemp[novoIdx] = temp;
  renderListaIconesCategoriasAdmin();
};

window.removerIconeCategoriaModal = function (idx) {
  if (confirm(`Remover "${iconesCategoriasTemp[idx]?.label || 'este item'}" de Nossos Produtos?`)) {
    iconesCategoriasTemp.splice(idx, 1);
    renderListaIconesCategoriasAdmin();
  }
};

window.restaurarPadraoIconesCategorias = function () {
  if (confirm('Deseja restaurar as 9 categorias e fotos originais padrão?')) {
    iconesCategoriasTemp = JSON.parse(JSON.stringify(DEFAULT_ICONES_NOSSOS_PRODUTOS));
    renderListaIconesCategoriasAdmin();
    toast('Fotos e categorias restauradas para o padrão.');
  }
};

window.salvarModalIconesCategorias = async function () {
  if (!isAdmin) return;
  ensureExtraData();
  D.iconesNossosProdutos = JSON.parse(JSON.stringify(iconesCategoriasTemp));
  fecharModalGerenciarIconesCategorias();
  toast('📸 Fotos de "Nossos Produtos" salvas com sucesso no Supabase!');
  await salvarCardapio(false);
  renderCategoriasIcones();
};

window.abrirModalCasquinhas = function () {
  if (!isAdmin) return;
  ensureExtraData();
  const c = D.casquinhas;
  $('#casq-ativo').checked = c.ativo !== false;
  $('#casq-titulo').value = c.titulo || '';
  $('#casq-texto').value = c.texto || '';
  $('#casq-btn').value = c.botaoTexto || '';
  if ($('#casq-zap')) $('#casq-zap').value = c.mensagemZap || '';
  $('#casq-foto-url').value = c.img || '';
  $('#casq-foto-preview').innerHTML = c.img ? `<img src="${esc(c.img)}">` : '<span>Sem foto</span>';
  $('#modal-casquinhas').classList.add('aberto');
};

window.fecharModalCasquinhas = function () {
  $('#modal-casquinhas').classList.remove('aberto');
};

async function submitCasquinhas(e) {
  e.preventDefault();
  ensureExtraData();
  D.casquinhas = {
    ativo: $('#casq-ativo').checked,
    titulo: $('#casq-titulo').value.trim() || DEFAULT_CASQUINHAS.titulo,
    texto: $('#casq-texto').value.trim(),
    botaoTexto: $('#casq-btn').value.trim() || 'PEÇA AGORA',
    mensagemZap: ($('#casq-zap') ? $('#casq-zap').value.trim() : '') || 'Olá! Vim pelo cardápio e quero fazer um pedido!',
    img: $('#casq-foto-url').value.trim() || DEFAULT_CASQUINHAS.img
  };
  fecharModalCasquinhas();
  toast('🍦 Seção das 6 casquinhas atualizada!');
  await salvarCardapio(false);
}

window.alternarVisibilidadeCasquinhas = async function () {
  if (!isAdmin) return;
  ensureExtraData();
  D.casquinhas.ativo = !D.casquinhas.ativo;
  toast(D.casquinhas.ativo ? '👁️ Seção das 6 casquinhas visível para os clientes!' : '🙈 Seção das 6 casquinhas ocultada para os clientes (continua salva)!');
  await salvarCardapio(false);
};

window.excluirSecaoCasquinhas = async function () {
  if (!isAdmin) return;
  ensureExtraData();
  if (confirm('Deseja ocultar/remover esta seção dos clientes?\n\nEla ficará invisível para os clientes, mas continuará salva no botão "🍦 6 Casquinhas" do painel caso queira usar no futuro!')) {
    D.casquinhas.ativo = false;
    toast('🙈 Seção ocultada dos clientes (salva para uso futuro)!');
    await salvarCardapio(false);
  }
};

window.alternarVisibilidadeMural = async function () {
  if (!isAdmin) return;
  ensureExtraData();
  D.blogAtivo = !D.blogAtivo;
  toast(D.blogAtivo ? '👁️ Mural/Blog visível para os clientes!' : '🙈 Mural/Blog ocultado para os clientes (continua salvo)!');
  await salvarCardapio(false);
};

window.alternarOcultarBlog = async function (idx) {
  if (!isAdmin) return;
  ensureExtraData();
  if (!D.blog[idx]) return;
  D.blog[idx].oculto = !D.blog[idx].oculto;
  toast(D.blog[idx].oculto ? '🙈 Card do mural ocultado para clientes (continua salvo)!' : '👁️ Card do mural visível para clientes!');
  await salvarCardapio(false);
};

window.abrirModalBlog = function (idx) {
  if (!isAdmin) return;
  ensureExtraData();
  editingBlogIndex = idx;
  if (idx >= 0 && D.blog[idx]) {
    const p = D.blog[idx];
    $('#modal-blog-titulo').textContent = 'Editar Card do Mural / Blog';
    $('#blog-data').value = p.data || '';
    $('#blog-titulo-input').value = p.titulo || '';
    $('#blog-texto-input').value = p.texto || '';
    $('#blog-foto-url').value = p.img || '';
    $('#blog-foto-preview').innerHTML = p.img ? `<img src="${esc(p.img)}">` : '<span>Sem foto</span>';
  } else {
    $('#modal-blog-titulo').textContent = 'Novo Card no Mural / Blog';
    $('#blog-data').value = 'Especial · Sorveteria Lolla';
    $('#blog-titulo-input').value = '';
    $('#blog-texto-input').value = '';
    $('#blog-foto-url').value = '';
    $('#blog-foto-preview').innerHTML = '<span>Sem foto</span>';
  }
  $('#modal-blog').classList.add('aberto');
};

window.fecharModalBlog = function () {
  $('#modal-blog').classList.remove('aberto');
};

async function submitBlog(e) {
  e.preventDefault();
  ensureExtraData();
  const post = {
    data: $('#blog-data').value.trim() || 'Novidade Lolla',
    titulo: $('#blog-titulo-input').value.trim() || 'Novidade Especial',
    texto: $('#blog-texto-input').value.trim(),
    img: $('#blog-foto-url').value.trim() || DEFAULT_BLOG[0].img
  };
  if (editingBlogIndex >= 0) {
    D.blog[editingBlogIndex] = post;
    toast('📝 Card do mural atualizado!');
  } else {
    D.blog.unshift(post);
    toast('📝 Novo card adicionado ao mural!');
  }
  fecharModalBlog();
  await salvarCardapio(false);
}

window.removerBlog = async function (idx) {
  if (!isAdmin) return;
  ensureExtraData();
  const p = D.blog[idx];
  if (!p) return;
  if (confirm(`Deseja excluir o card "${p.titulo}" do mural?`)) {
    D.blog.splice(idx, 1);
    toast('🗑️ Card removido do mural.');
    await salvarCardapio(false);
  }
};

window.abrirLeituraBlog = function (idx) {
  ensureExtraData();
  const p = D.blog[idx];
  if (!p) return;
  $('#leitura-blog-img').src = p.img || '';
  $('#leitura-blog-meta').textContent = p.data || '';
  $('#leitura-blog-titulo').textContent = p.titulo || '';
  $('#leitura-blog-texto').textContent = p.texto || '';
  $('#leitura-blog-zap').href = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(`Olá! Vi no mural do cardápio sobre "${p.titulo}" e quero fazer um pedido!`);
  $('#modal-leitura-blog').classList.add('aberto');
};

window.fecharLeituraBlog = function () {
  $('#modal-leitura-blog').classList.remove('aberto');
};

window.abrirModalGaleria = function (idx) {
  if (!isAdmin) return;
  ensureExtraData();
  editingGaleriaIndex = idx;
  const item = D.galeria[idx] || { img: '', legenda: '' };
  $('#gal-foto-url').value = item.img || '';
  $('#gal-legenda').value = item.legenda || '';
  $('#gal-foto-preview').innerHTML = item.img ? `<img src="${esc(item.img)}">` : '<span>Sem foto</span>';
  $('#modal-galeria').classList.add('aberto');
};

window.fecharModalGaleria = function () {
  $('#modal-galeria').classList.remove('aberto');
};

async function submitGaleria(e) {
  e.preventDefault();
  ensureExtraData();
  if (editingGaleriaIndex >= 0 && editingGaleriaIndex < 4) {
    D.galeria[editingGaleriaIndex] = {
      img: $('#gal-foto-url').value.trim() || DEFAULT_GALERIA[editingGaleriaIndex].img,
      legenda: $('#gal-legenda').value.trim() || 'Sorveteria Lolla'
    };
    fecharModalGaleria();
    toast('🖼️ Foto do topo atualizada!');
    await salvarCardapio(false);
  }
}

window.abrirModalConfig = function () {
  if (!isAdmin) return;
  $('#cfg-nome').value = CONFIG.nome || '';
  $('#cfg-zap').value = CONFIG.whatsapp || '';
  if ($('#cfg-pedido-minimo')) {
    $('#cfg-pedido-minimo').value = getPedidoMinimo().toFixed(2);
  }
  $('#modal-config').classList.add('aberto');
};

window.fecharModalConfig = function () {
  $('#modal-config').classList.remove('aberto');
};

window.salvarConfigLoja = async function (e) {
  e.preventDefault();
  CONFIG.nome = $('#cfg-nome').value.trim() || 'Sorveteria Lolla';
  CONFIG.whatsapp = $('#cfg-zap').value.replace(/\D/g, '') || '5544999432158';

  if ($('#cfg-pedido-minimo')) {
    const minVal = parseFloat($('#cfg-pedido-minimo').value);
    if (!isNaN(minVal) && minVal >= 0) {
      CONFIG.pedidoMinimo = minVal;
    }
  }

  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(CONFIG));
  localStorage.setItem('lolla_store_config_v2', JSON.stringify(CONFIG));
  if (D) {
    D.config = { nome: CONFIG.nome, whatsapp: CONFIG.whatsapp, pedidoMinimo: getPedidoMinimo() };
  }
  fecharModalConfig();
  renderCarrinho();
  await salvarCardapio(false);
  toast('⚙️ Dados da loja e pedido mínimo salvos permanentemente!');
};

window.restaurarPadrao = async function () {
  if (!isAdmin) return;
  if (confirm('Tem certeza que deseja restaurar os produtos originais de fábrica? Quaisquer produtos adicionados ou editados serão substituídos.')) {
    localStorage.removeItem(STORAGE_KEY_DATA);
    if (window.__CARDAPIO_DATA_DEFAULT__) {
      D = JSON.parse(JSON.stringify(window.__CARDAPIO_DATA_DEFAULT__));
      ensureExtraData();
    }
    await salvarCardapio(true);
  }
};

/* ==========================================================
 * INICIALIZAÇÃO, PERSISTÊNCIA DE POSIÇÃO/ABA E EVENTOS
 * ========================================================== */

function salvarEstadoNavegacao(scrollOverride) {
  if (isRestoringScroll) return;
  try {
    const estado = {
      grupo,
      cat,
      scrollY: typeof scrollOverride === 'number' ? scrollOverride : window.scrollY
    };
    const jsonStr = JSON.stringify(estado);
    sessionStorage.setItem(STORAGE_KEY_NAV, jsonStr);
    try {
      localStorage.setItem(STORAGE_KEY_NAV, jsonStr);
    } catch (e) {}
  } catch (e) {}
}

function carregarEstadoNavegacao() {
  try {
    let raw = sessionStorage.getItem(STORAGE_KEY_NAV);
    if (!raw) {
      raw = localStorage.getItem(STORAGE_KEY_NAV);
    }
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function preservarPosicaoAoFiltrar(savedScrollY) {
  const destinoY = typeof savedScrollY === 'number' ? savedScrollY : window.scrollY;
  window.scrollTo(0, destinoY);
  requestAnimationFrame(() => {
    window.scrollTo(0, destinoY);
  });
  salvarEstadoNavegacao(destinoY);
}

function setupEvents() {
  document.addEventListener('click', e => {
    const abaBtn = e.target.closest('.aba');
    if (abaBtn) {
      const savedScrollY = window.scrollY;
      grupo = abaBtn.dataset.g;
      cat = 'Todas';
      if (busca) {
        busca = '';
        const sInput = $('#q');
        if (sInput) sInput.value = '';
        if (typeof atualizarBotaoLimpar === 'function') atualizarBotaoLimpar();
      }
      montaAbas();
      montaChips();
      render();
      sincronizarDestaquesCategoria(cat);
      preservarPosicaoAoFiltrar(savedScrollY);
      return;
    }
    const chipBtn = e.target.closest('.chip');
    if (chipBtn && chipBtn.dataset.c) {
      const savedScrollY = window.scrollY;
      cat = chipBtn.dataset.c;
      montaChips();
      render();
      sincronizarDestaquesCategoria(cat);
      preservarPosicaoAoFiltrar(savedScrollY);
    }
  });

  let scrollTicking = false;
  let scrollSaveTimer = null;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        atualizarVisibilidadeCarrinhoFlutuante();
        scrollTicking = false;
      });
      scrollTicking = true;
    }

    if (!isRestoringScroll) {
      clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => {
        salvarEstadoNavegacao(window.scrollY);
      }, 350);
    }
  }, { passive: true });

  window.addEventListener('beforeunload', () => {
    if (!isRestoringScroll) {
      salvarEstadoNavegacao(window.scrollY);
    }
  });

  const searchInput = $('#q');
  const btnLimparBusca = $('#busca-limpar');

  function atualizarBotaoLimpar() {
    if (btnLimparBusca) {
      btnLimparBusca.style.display = searchInput && searchInput.value.trim() ? 'flex' : 'none';
    }
  }

  window.limparBusca = function () {
    if (searchInput) {
      searchInput.value = '';
    }
    busca = '';
    cat = 'Todas';
    atualizarBotaoLimpar();
    montaChips();
    render();
    if (searchInput) searchInput.focus();
  };

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      busca = e.target.value;
      if (cat !== 'Todas') {
        cat = 'Todas';
      }
      atualizarBotaoLimpar();
      montaChips();
      render();
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        limparBusca();
      }
    });

    atualizarBotaoLimpar();
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      fecharCarrinho();
    }
  });

  // Atalho secreto: 4 cliques rápidos no título abrem o login
  let clicksTitulo = 0, timerClicks;
  const tituloEl = $('.titulo h1');
  if (tituloEl) {
    tituloEl.style.cursor = 'default';
    tituloEl.addEventListener('click', () => {
      clicksTitulo++;
      clearTimeout(timerClicks);
      if (clicksTitulo >= 4) {
        clicksTitulo = 0;
        abrirModalLogin();
      } else {
        timerClicks = setTimeout(() => clicksTitulo = 0, 1000);
      }
    });
  }

  // Atalho de teclado: Ctrl+Shift+A ou Cmd+Shift+A
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      abrirModalLogin();
    }
  });

  // Formulários principais
  $('#form-login').addEventListener('submit', submeterLogin);
  $('#form-senha').addEventListener('submit', submeterNovaSenha);
  $('#form-produto').addEventListener('submit', submitProduto);
  $('#prod-cat').addEventListener('change', () => {
    toggleCampoNovaCategoria();
    const val = $('#prod-cat').value;
    if (val && val !== '__nova__') {
      $('#prod-grupo').value = getGrupoDaCategoria(val);
    }
  });
  const prodNovaCatGrupo = $('#prod-nova-cat-grupo');
  if (prodNovaCatGrupo) {
    prodNovaCatGrupo.addEventListener('change', () => {
      if ($('#prod-grupo')) $('#prod-grupo').value = prodNovaCatGrupo.value;
    });
  }
  $('#prod-foto-arquivo').addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      processarFotoSelecionada(e.target.files[0]);
    }
  });
  $('#prod-foto-url').addEventListener('input', e => {
    const url = e.target.value.trim();
    if (url) {
      $('#prod-foto-preview').innerHTML = `<img src="${url}">`;
      atualizarPreviewModal();
    }
  });
  setupFotoPreviewDrag();
  $('#form-config').addEventListener('submit', salvarConfigLoja);

  // Formulários de Destaque, Blog e Galeria
  const formDest = $('#form-destaque');
  if (formDest) {
    formDest.addEventListener('submit', submitDestaque);
    $('#dest-foto-arquivo').addEventListener('change', async e => {
      if (e.target.files && e.target.files[0]) {
        const url = await uploadImagemArquivo(e.target.files[0]);
        $('#dest-foto-preview').innerHTML = `<img src="${url}">`;
        $('#dest-foto-url').value = url;
      }
    });
    $('#dest-foto-url').addEventListener('input', e => {
      const url = e.target.value.trim();
      if (url) $('#dest-foto-preview').innerHTML = `<img src="${url}">`;
    });
  }

  const formCasq = $('#form-casquinhas');
  if (formCasq) {
    formCasq.addEventListener('submit', submitCasquinhas);
    $('#casq-foto-arquivo').addEventListener('change', async e => {
      if (e.target.files && e.target.files[0]) {
        const url = await uploadImagemArquivo(e.target.files[0]);
        $('#casq-foto-preview').innerHTML = `<img src="${url}">`;
        $('#casq-foto-url').value = url;
      }
    });
    $('#casq-foto-url').addEventListener('input', e => {
      const url = e.target.value.trim();
      if (url) $('#casq-foto-preview').innerHTML = `<img src="${url}">`;
    });
  }

  const formBlog = $('#form-blog');
  if (formBlog) {
    formBlog.addEventListener('submit', submitBlog);
    $('#blog-foto-arquivo').addEventListener('change', async e => {
      if (e.target.files && e.target.files[0]) {
        const url = await uploadImagemArquivo(e.target.files[0]);
        $('#blog-foto-preview').innerHTML = `<img src="${url}">`;
        $('#blog-foto-url').value = url;
      }
    });
    $('#blog-foto-url').addEventListener('input', e => {
      const url = e.target.value.trim();
      if (url) $('#blog-foto-preview').innerHTML = `<img src="${url}">`;
    });
  }

  const formGal = $('#form-galeria');
  if (formGal) {
    formGal.addEventListener('submit', submitGaleria);
    $('#gal-foto-arquivo').addEventListener('change', async e => {
      if (e.target.files && e.target.files[0]) {
        const url = await uploadImagemArquivo(e.target.files[0]);
        $('#gal-foto-preview').innerHTML = `<img src="${url}">`;
        $('#gal-foto-url').value = url;
      }
    });
    $('#gal-foto-url').addEventListener('input', e => {
      const url = e.target.value.trim();
      if (url) $('#gal-foto-preview').innerHTML = `<img src="${url}">`;
    });
  }
}

async function init() {
  if (window.__CARDAPIO_DATA__ && !window.__CARDAPIO_DATA_DEFAULT__) {
    window.__CARDAPIO_DATA_DEFAULT__ = JSON.parse(JSON.stringify(window.__CARDAPIO_DATA__));
  }

  // 1. Tenta carregar da Nuvem Supabase Oficial primeiro (onde todos os PCs sincronizam em tempo real)
  let carregouNuvem = false;
  let nuvemPrecisaSemeadura = false;
  try {
    const resSupa = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?id=eq.principal&select=*`, {
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (resSupa.ok) {
      const rows = await resSupa.json();
      if (rows && rows.length > 0 && rows[0].data && Array.isArray(rows[0].data.itens)) {
        D = rows[0].data;
        carregouNuvem = true;
        // Mantém o cache local atualizado com o cardápio oficial da nuvem
        try {
          localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(D));
        } catch (e) {}
      } else if (rows && rows.length === 0) {
        nuvemPrecisaSemeadura = true;
      }
    }
  } catch (errSupa) {
    console.warn('Supabase offline ou inacessível no momento:', errSupa);
  }

  // 2. Verifica se o navegador atual tem dados no localStorage
  // Se tiver fotos locais que a nuvem ainda não tem (ex: no PC do trabalho onde você cadastrou hoje),
  // ele preserva as fotos locais para que você não perca nada!
  try {
    const local = localStorage.getItem(STORAGE_KEY_DATA);
    if (local) {
      const parsedLocal = JSON.parse(local);
      if (parsedLocal && Array.isArray(parsedLocal.itens)) {
        if (!D) {
          D = parsedLocal;
        } else {
          const fotosLocalCount = parsedLocal.itens.filter(it => it && it.img).length;
          const fotosNuvemCount = D.itens.filter(it => it && it.img).length;
          if (fotosLocalCount > fotosNuvemCount) {
            console.log(`Detectado localStorage com mais fotos (${fotosLocalCount} vs ${fotosNuvemCount}). Preservando dados deste computador!`);
            D = parsedLocal;
          }
        }
      }
    }
  } catch (e) {}

  // 3. Tenta carregar dados da API local (/api/cardapio) caso não tenha carregado
  if (!D) {
    try {
      const res = await fetch('/api/cardapio');
      if (res.ok) D = await res.json();
    } catch (err) {}
  }

  // 4. Fallback final: dados embutidos
  if (!D && window.__CARDAPIO_DATA__) {
    D = JSON.parse(JSON.stringify(window.__CARDAPIO_DATA__));
  }

  // Se a tabela Supabase acabou de ser criada e está vazia, envia os dados iniciais automaticamente
  if (nuvemPrecisaSemeadura && D) {
    salvarCardapio(false).catch(e => console.warn('Semeadura inicial:', e));
  }

  // Atualiza o indicador visual da nuvem
  const badgeNuvem = $('#status-sinc-nuvem');
  if (badgeNuvem) {
    if (carregouNuvem) {
      badgeNuvem.textContent = '☁️ Conectado à Nuvem';
      badgeNuvem.style.color = 'var(--verde)';
      badgeNuvem.style.background = '#E8F8ED';
    } else {
      badgeNuvem.textContent = '☁️ Nuvem Pronta para Salvar';
    }
  }

  // Verifica se o token de administrador é válido
  if (adminToken) {
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.authenticated) {
        isAdmin = true;
      } else {
        adminToken = '';
        sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    } catch (e) {}
  }

  atualizarEstadoAutenticacao();
  ensureExtraData();

  const estadoSalvo = carregarEstadoNavegacao();
  if (estadoSalvo) {
    if (estadoSalvo.grupo && GRUPOS.some(([id]) => id === estadoSalvo.grupo)) {
      grupo = estadoSalvo.grupo;
    }
    if (estadoSalvo.cat && (estadoSalvo.cat === 'Todas' || (D && Array.isArray(D.cats) && D.cats.includes(estadoSalvo.cat)))) {
      cat = estadoSalvo.cat;
    }
  }

  const tinhaConfigNoServidor = Boolean(D && D.config && D.config.whatsapp);
  carrinho = carregarCarrinho();
  montaAbas();
  montaChips();
  render();
  atualizarBadgeCarrinho();
  renderCarrinho();
  renderCategoriasIcones();
  sincronizarDestaquesCategoria(cat);
  setupEvents();

  if (estadoSalvo && typeof estadoSalvo.scrollY === 'number' && estadoSalvo.scrollY > 0) {
    const targetY = estadoSalvo.scrollY;
    const restaurar = () => window.scrollTo(0, targetY);
    restaurar();
    requestAnimationFrame(restaurar);
    setTimeout(restaurar, 80);
    setTimeout(restaurar, 250);
    setTimeout(restaurar, 600);
    setTimeout(() => {
      restaurar();
      isRestoringScroll = false;
    }, 1200);
  } else {
    isRestoringScroll = false;
  }

  if (isAdmin && !tinhaConfigNoServidor) {
    salvarCardapio(false);
  }

  if (window.location.pathname.includes('/admin') || window.location.search.includes('admin')) {
    if (!isAdmin) {
      abrirModalLogin();
    }
  }

  // Inicialização do Sistema Operacional (Status Loja, Eventos e Rotas)
  carregarStatusOperacaoLoja();
  iniciarEscutaEventos();
  verificarRotasIniciais();
}

/* ==========================================================
 * SISTEMA COMPLETO: CLIENTE, DONO, ENTREGADOR E GESTÃO DE COMANDAS
 * ========================================================== */

let donoToken = localStorage.getItem('lolla_dono_token') || sessionStorage.getItem('lolla_dono_token') || '';
let clienteToken = localStorage.getItem('lolla_cliente_token') || '';
let clienteAtual = null;
let motoboyToken = localStorage.getItem('lolla_motoboy_token') || '';
let motoboyAtual = null;
let operacaoConfig = null;
let pedidoRastreioAtual = null;
let somDonoAtivo = localStorage.getItem('lolla_som_dono') !== 'false';
let audioCtx = null;
let pollingEventosAtivo = false;
let ultimoTimestampEventos = Date.now();
let statusFiltroDono = 'TODOS';
let pedidosCacheDono = [];

// Síntese de Áudio com Web Audio API (Chime e Alertas Nativos Confiáveis)
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

window.tocarAlertaNovoPedido = function() {
  if (!somDonoAtivo) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Primeiro tom: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Segundo tom: A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.22);
    gain2.gain.setValueAtTime(0.4, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.85);
  } catch (e) {
    console.warn('Erro ao reproduzir alerta sonoro:', e);
  }
};

window.tocarAlertaChamada = function() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.16, 0.32].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750 + idx * 120, now + offset);
      gain.gain.setValueAtTime(0.3, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });
  } catch (e) {}
};

window.testarSomAudio = function() {
  getAudioContext();
  tocarAlertaNovoPedido();
  toast('🔔 Som de alerta testado com sucesso!');
};

window.toggleSomDono = function() {
  somDonoAtivo = !somDonoAtivo;
  localStorage.setItem('lolla_som_dono', somDonoAtivo ? 'true' : 'false');
  const icone = $('#icone-som-dono');
  const btn = $('#btn-toggle-som-dono');
  if (icone) icone.textContent = somDonoAtivo ? '🔔' : '🔕';
  if (btn) btn.querySelector('span:last-child').textContent = somDonoAtivo ? 'Som Ativo' : 'Silencioso';
  toast(somDonoAtivo ? '🔔 Alertas sonoros ativados!' : '🔕 Alertas sonoros silenciados.');
};

// 1. Carregamento de Status da Loja e Bairros
async function carregarStatusOperacaoLoja() {
  try {
    const res = await fetch('/api/config/operacao');
    if (!res.ok) return;
    operacaoConfig = await res.json();

    const statusEl = $('#status-loja-topo');
    const textoEl = $('#status-loja-texto');
    if (statusEl && textoEl) {
      if (operacaoConfig.lojaAberta) {
        statusEl.className = 'status-loja-topo aberta';
        textoEl.textContent = 'Aberta agora · Atendimento normal';
      } else {
        statusEl.className = 'status-loja-topo fechada';
        textoEl.textContent = operacaoConfig.lojaStatusTexto || 'Fechada no momento';
      }
    }
  } catch (e) {
    console.warn('Não foi possível obter dados operacionais:', e);
  }
}

// 2. Barramento de Eventos em Tempo Real (Long-Polling Contínuo)
async function iniciarEscutaEventos() {
  if (pollingEventosAtivo) return;
  pollingEventosAtivo = true;

  while (pollingEventosAtivo) {
    try {
      let role = 'cliente';
      let userId = '';
      if (donoToken) role = 'dono';
      else if (motoboyToken) {
        role = 'entregador';
        userId = motoboyAtual ? motoboyAtual.id : '';
      }

      const res = await fetch(`/api/events/poll?since=${ultimoTimestampEventos}&role=${role}&userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.timestamp) ultimoTimestampEventos = data.timestamp;
        if (Array.isArray(data.events) && data.events.length > 0) {
          for (const ev of data.events) {
            tratarEventoRecebido(ev);
          }
        }
      } else {
        await new Promise(r => setTimeout(r, 4000));
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 4000));
    }
  }
}

function tratarEventoRecebido(ev) {
  if (ev.type === 'novo_pedido') {
    tocarAlertaNovoPedido();
    const banner = $('#banner-novo-pedido-dono');
    const bannerTxt = $('#banner-novo-pedido-texto');
    if (banner && bannerTxt) {
      bannerTxt.textContent = `Comanda #${ev.data.numero} · ${ev.data.cliente_nome} (${ev.data.bairro}) · R$ ${brl(ev.data.total)}`;
      banner.style.display = 'flex';
      banner.dataset.pedidoId = ev.data.id;
    }
    toast(`🔔 Novo Pedido Recebido! Comanda #${ev.data.numero} - R$ ${brl(ev.data.total)}`);
    if ($('#painel-dono-overlay').classList.contains('aberto')) {
      carregarDashboardDono();
      carregarPedidosDono();
    }
  } else if (ev.type === 'pedido_status_atualizado' || ev.type === 'etapa_entrega_atualizada' || ev.type === 'pedido_cancelado') {
    if (pedidoRastreioAtual && (pedidoRastreioAtual.id === ev.data.id || pedidoRastreioAtual.id === ev.data.pedidoId)) {
      abrirRastreamentoPedido(pedidoRastreioAtual.id, pedidoRastreioAtual.codigo_rastreio, true);
    }
    if ($('#painel-dono-overlay').classList.contains('aberto')) {
      carregarPedidosDono();
      carregarDashboardDono();
    }
    if ($('#painel-entregador-overlay').classList.contains('aberto')) {
      carregarChamadasMotoboy();
    }
  } else if (ev.type === 'nova_chamada_entrega') {
    tocarAlertaChamada();
    toast(`🛵 Nova corrida disponível! Bairro: ${ev.data.bairro} · R$ ${brl(ev.data.valor_remuneracao)}`);
    if ($('#painel-entregador-overlay').classList.contains('aberto')) {
      carregarChamadasMotoboy();
    }
  } else if (ev.type === 'chamada_aceita' || ev.type === 'chamada_encerrada') {
    if ($('#painel-entregador-overlay').classList.contains('aberto')) {
      carregarChamadasMotoboy();
    }
    if ($('#painel-dono-overlay').classList.contains('aberto')) {
      carregarPedidosDono();
    }
  }
}

window.abrirComandaDoBanner = function() {
  const banner = $('#banner-novo-pedido-dono');
  if (!banner || !banner.dataset.pedidoId) return;
  banner.style.display = 'none';
  alternarAbaDono('pedidos');
};

// 3. Seletor de Acessos dos 4 Perfis
window.abrirSeletorAcesso = function() {
  $('#modal-seletor-acesso').classList.add('aberto');
};
window.fecharSeletorAcesso = function() {
  $('#modal-seletor-acesso').classList.remove('aberto');
};

// 4. Fluxo de Checkout Direto no Site para Clientes
window.iniciarCheckoutSite = function() {
  fecharCarrinho();

  if (operacaoConfig && !operacaoConfig.lojaAberta) {
    alert(`⚠️ A Sorveteria Lolla está fechada no momento (${operacaoConfig.lojaStatusTexto || ''}). Os pedidos imediatos ficam pausados.`);
    return;
  }

  const subtotal = valorTotalCarrinho();
  const pedidoMin = getPedidoMinimo();
  if (subtotal < pedidoMin) {
    const falta = pedidoMin - subtotal;
    alert(`⚠️ O pedido mínimo é de R$ ${brl(pedidoMin)}. Faltam R$ ${brl(falta)} em produtos no seu carrinho.`);
    abrirCarrinho();
    return;
  }

  // Preenche dados se cliente estiver logado
  if (clienteAtual) {
    $('#chk-nome').value = clienteAtual.nome || '';
    $('#chk-telefone').value = clienteAtual.telefone || '';
    if (clienteAtual.enderecos && clienteAtual.enderecos[0]) {
      const e = clienteAtual.enderecos[0];
      if ($('#chk-rua')) $('#chk-rua').value = e.rua || '';
      if ($('#chk-numero')) $('#chk-numero').value = e.numero || '';
      if ($('#chk-comp')) $('#chk-comp').value = e.complemento || '';
      if ($('#chk-ref')) $('#chk-ref').value = e.referencia || '';
      if ($('#chk-cep')) $('#chk-cep').value = e.cep || '';
    }
  }

  // Preenche select de bairros
  const selectBairro = $('#chk-bairro');
  if (selectBairro && operacaoConfig && Array.isArray(operacaoConfig.bairros)) {
    selectBairro.innerHTML = '<option value="">Selecione o seu bairro...</option>' +
      operacaoConfig.bairros.map(b => `<option value="${esc(b.nome)}" data-taxa="${b.taxa_cliente}" data-tempo="${esc(b.tempo_estimado || '')}">${esc(b.nome)} - R$ ${brl(b.taxa_cliente)} (${esc(b.tempo_estimado || '30-50 min')})</option>`).join('');
  }

  // Configuração das formas de pagamento disponíveis
  if (operacaoConfig && operacaoConfig.pagamento) {
    if (operacaoConfig.pagamento.pix && operacaoConfig.pagamento.pix.ativo) {
      $('#chk-pix-chave').textContent = operacaoConfig.pagamento.pix.chave || '5547974003728';
      $('#chk-pix-titular').textContent = operacaoConfig.pagamento.pix.titular || 'Sorveteria Lolla';
      $('#chk-pix-banco').textContent = operacaoConfig.pagamento.pix.instituicao || 'Banco Digital';
    }
    const cardCartao = $('#card-pag-cartao');
    if (cardCartao) {
      cardCartao.style.display = (operacaoConfig.pagamento.cartao_entrega && operacaoConfig.pagamento.cartao_entrega.ativo) ? 'flex' : 'none';
    }
  }

  selecionarFormaPagamento('pix');
  atualizarValoresResumoCheckout();
  $('#modal-checkout').classList.add('aberto');
};

window.fecharModalCheckout = function() {
  $('#modal-checkout').classList.remove('aberto');
};

let formaPagamentoCheckout = 'pix';
window.selecionarFormaPagamento = function(forma) {
  formaPagamentoCheckout = forma;
  const cards = document.querySelectorAll('.forma-pag-card');
  cards.forEach(c => c.classList.remove('ativo'));

  const cardAtivo = $(`#card-pag-${forma === 'cartao_entrega' ? 'cartao' : forma}`);
  if (cardAtivo) cardAtivo.classList.add('ativo');

  $('#box-pag-pix').style.display = forma === 'pix' ? 'flex' : 'none';
  $('#box-pag-dinheiro').style.display = forma === 'dinheiro' ? 'block' : 'none';
  $('#box-pag-cartao').style.display = forma === 'cartao_entrega' ? 'block' : 'none';
};

window.copiarChavePixCheckout = function() {
  const chave = $('#chk-pix-chave').textContent.trim();
  navigator.clipboard.writeText(chave).then(() => {
    toast('✅ Chave PIX copiada para a área de transferência!');
  }).catch(() => {
    toast('Chave PIX: ' + chave);
  });
};

window.toggleTrocoCheckout = function(precisa) {
  $('#wrap-campo-troco').style.display = precisa ? 'block' : 'none';
  if (!precisa) {
    $('#chk-troco-para').value = '';
    $('#chk-troco-aviso').textContent = '';
  }
};

window.calcularTrocoCheckout = function(valStr) {
  const val = parseFloat(valStr) || 0;
  const total = calcularTotalPedidoAtual();
  const aviso = $('#chk-troco-aviso');
  if (val > total) {
    aviso.textContent = `Troco a devolver: R$ ${brl(val - total)}`;
    aviso.style.color = '#008A45';
  } else if (val > 0) {
    aviso.textContent = `⚠️ O valor do troco deve ser maior que o total (R$ ${brl(total)})`;
    aviso.style.color = '#CF1322';
  } else {
    aviso.textContent = '';
  }
};

window.atualizarTaxaBairroCheckout = function() {
  const select = $('#chk-bairro');
  const opt = select.selectedOptions[0];
  const infoEl = $('#chk-bairro-info');
  if (opt && opt.dataset.taxa) {
    infoEl.textContent = `✓ Taxa de Entrega: R$ ${brl(parseFloat(opt.dataset.taxa))} · Estimativa: ${opt.dataset.tempo || '40 min'}`;
  } else {
    infoEl.textContent = '';
  }
  atualizarValoresResumoCheckout();
};

function calcularTotalPedidoAtual() {
  const subtotal = valorTotalCarrinho();
  const select = $('#chk-bairro');
  const opt = select ? select.selectedOptions[0] : null;
  const taxa = opt && opt.dataset.taxa ? parseFloat(opt.dataset.taxa) : 0;
  return subtotal + taxa;
}

function atualizarValoresResumoCheckout() {
  const subtotal = valorTotalCarrinho();
  const select = $('#chk-bairro');
  const opt = select ? select.selectedOptions[0] : null;
  const taxa = opt && opt.dataset.taxa ? parseFloat(opt.dataset.taxa) : 0;
  const bairroNome = opt && opt.value ? opt.value : 'Selecione';

  $('#chk-resumo-subtotal').textContent = `R$ ${brl(subtotal)}`;
  $('#chk-resumo-bairro-nome').textContent = bairroNome;
  $('#chk-resumo-taxa').textContent = `R$ ${brl(taxa)}`;
  $('#chk-resumo-total').textContent = `R$ ${brl(subtotal + taxa)}`;
}

window.buscarCepViaCep = async function() {
  const cep = ($('#chk-cep').value || '').replace(/\D/g, '');
  if (cep.length !== 8) {
    toast('⚠️ Digite um CEP válido com 8 números');
    return;
  }
  toast('🔍 Buscando endereço pelo CEP...');
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) {
      toast('CEP não encontrado. Preencha manualmente.');
      return;
    }
    if (data.logradouro) $('#chk-rua').value = data.logradouro;
    if (data.bairro) {
      const select = $('#chk-bairro');
      for (const opt of select.options) {
        if (opt.value.toLowerCase() === data.bairro.toLowerCase()) {
          select.value = opt.value;
          atualizarTaxaBairroCheckout();
          break;
        }
      }
    }
    toast('✅ Endereço preenchido com sucesso!');
  } catch (e) {
    toast('Não foi possível consultar o CEP automaticamente.');
  }
};

window.submitPedidoSite = async function(e) {
  e.preventDefault();
  const btn = $('#btn-confirmar-pedido-final');
  if (btn.disabled) return;

  const nome = $('#chk-nome').value.trim();
  const telefone = $('#chk-telefone').value.trim();
  const bairro = $('#chk-bairro').value;
  const rua = $('#chk-rua').value.trim();
  const numero = $('#chk-numero').value.trim();
  const complemento = $('#chk-comp').value.trim();
  const referencia = $('#chk-ref').value.trim();
  const cep = $('#chk-cep').value.trim();
  const obs = $('#chk-obs').value.trim();

  if (!bairro) {
    alert('Por favor, selecione o bairro de entrega.');
    return;
  }

  const precisaTroco = $('#chk-precisa-troco') && $('#chk-precisa-troco').checked;
  const trocoPara = precisaTroco ? parseFloat($('#chk-troco-para').value) : null;

  btn.disabled = true;
  btn.innerHTML = '<span>⏳ Enviando Pedido...</span>';

  try {
    const payload = {
      cliente_nome: nome,
      cliente_telefone: telefone,
      endereco: { rua, numero, complemento, bairro, referencia, cep },
      itens: carrinho.map(item => ({
        id: item.id || null,
        n: item.nome,
        preco: item.preco,
        qtd: item.qtd,
        opcoes: item.opcoes || null,
        obs: obs
      })),
      forma_pagamento: formaPagamentoCheckout,
      precisa_troco: precisaTroco,
      troco_para: trocoPara
    };

    const headers = { 'Content-Type': 'application/json' };
    if (clienteToken) headers['Authorization'] = `Bearer ${clienteToken}`;

    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ Não foi possível confirmar o pedido: ${data.error || 'Erro desconhecido'}`);
      btn.disabled = false;
      btn.innerHTML = '<span>✓ Confirmar e Enviar Pedido</span>';
      return;
    }

    // Sucesso!
    salvarUltimoPedidoLocalmente(data.pedido);
    carrinho = [];
    salvarCarrinho();
    atualizarBadgeCarrinho();
    renderCarrinho();
    fecharModalCheckout();

    toast(`🎉 Pedido #${data.pedido.numero} realizado com sucesso!`);
    abrirRastreamentoPedido(data.pedido.id, data.pedido.codigo_rastreio);
  } catch (err) {
    alert('Erro de conexão ao enviar o pedido. Verifique sua internet e tente novamente.');
    btn.disabled = false;
    btn.innerHTML = '<span>✓ Confirmar e Enviar Pedido</span>';
  }
};

function salvarUltimoPedidoLocalmente(pedido) {
  try {
    const salvos = JSON.parse(localStorage.getItem('lolla_cliente_ultimos_pedidos') || '[]');
    salvos.unshift(pedido);
    localStorage.setItem('lolla_cliente_ultimos_pedidos', JSON.stringify(salvos.slice(0, 15)));
  } catch (e) {}
}

// 5. Rastreamento do Pedido em Tempo Real
window.abrirModalBuscaRastreio = function() {
  $('#modal-busca-rastreio').classList.add('aberto');
};
window.fecharModalBuscaRastreio = function() {
  $('#modal-busca-rastreio').classList.remove('aberto');
};

window.submitBuscarRastreio = function(e) {
  e.preventDefault();
  const codigo = $('#input-codigo-rastreio').value.trim();
  fecharModalBuscaRastreio();
  abrirRastreamentoPedido(codigo, codigo);
};

window.abrirRastreamentoPedido = async function(pedidoIdOuNumero, codigoOpcional, silencioso = false) {
  if (!silencioso) toast('🔍 Localizando pedido...');
  try {
    const codigoParam = codigoOpcional ? `?codigo=${encodeURIComponent(codigoOpcional)}` : '';
    const headers = {};
    if (clienteToken) headers['Authorization'] = `Bearer ${clienteToken}`;
    else if (donoToken) headers['Authorization'] = `Bearer ${donoToken}`;

    const res = await fetch(`/api/pedidos/${pedidoIdOuNumero}/rastrear${codigoParam}`, { headers });
    if (!res.ok) {
      if (!silencioso) alert('Pedido não encontrado ou código de acesso inválido.');
      return;
    }

    const pedido = await res.json();
    pedidoRastreioAtual = pedido;
    renderizarTelaRastreamento(pedido);
    $('#modal-rastreamento-pedido').classList.add('aberto');
  } catch (e) {
    if (!silencioso) alert('Erro ao consultar o rastreamento.');
  }
};

window.fecharModalRastreamento = function() {
  $('#modal-rastreamento-pedido').classList.remove('aberto');
  pedidoRastreioAtual = null;
};

function renderizarTelaRastreamento(p) {
  $('#rastreio-numero-comanda').textContent = `Comanda #${p.numero || '----'}`;
  $('#rastreio-cliente-info').textContent = `Cliente: ${p.cliente_nome || ''}`;
  $('#rastreio-endereco-info').textContent = p.endereco ? `${p.endereco.rua}, ${p.endereco.numero} - ${p.endereco.bairro}` : '';
  $('#rastreio-total-info').textContent = `R$ ${brl(p.total)}`;
  $('#rastreio-pagamento-info').textContent = (p.forma_pagamento || '').toUpperCase() + (p.troco_valor ? ` (Troco: R$ ${brl(p.troco_valor)})` : '');
  $('#rastreio-codigo-chave').textContent = p.codigo_rastreio || '----';

  const badgeTopo = $('#rastreio-badge-status-topo');
  if (badgeTopo) {
    badgeTopo.className = `comanda-status-badge ${p.status}`;
    badgeTopo.textContent = p.status.replace(/_/g, ' ');
  }

  // Cancelamento
  const boxCanc = $('#rastreio-alerta-cancelado');
  if (p.status === 'CANCELADO') {
    boxCanc.style.display = 'block';
    $('#rastreio-motivo-cancelado').textContent = p.motivo_cancelamento || 'Cancelado pela sorveteria.';
  } else {
    boxCanc.style.display = 'none';
  }

  // Atualização da Timeline dos 7 Passos
  const ordem = [
    'RECEBIDO',
    'ACEITO',
    'EM_PREPARACAO',
    'AGUARDANDO_ENTREGADOR',
    'ENTREGADOR_A_CAMINHO',
    'SAIU_ENTREGA',
    'ENTREGUE'
  ];

  const idxAtual = ordem.indexOf(p.status);
  ordem.forEach((st, idx) => {
    const el = $(`#passo-${st}`);
    if (!el) return;
    el.classList.remove('concluido', 'ativo', 'cancelado');
    if (p.status === 'CANCELADO') {
      if (idx === 0) el.classList.add('cancelado');
    } else if (idx < idxAtual) {
      el.classList.add('concluido');
    } else if (idx === idxAtual) {
      el.classList.add('ativo');
    }
  });

  if (p.entregador_nome) {
    $('#rastreio-motoboy-nome').textContent = `Motoboy: ${p.entregador_nome}`;
  }

  // Lista de produtos
  const listaProd = $('#rastreio-produtos-lista');
  if (listaProd && Array.isArray(p.itens)) {
    listaProd.innerHTML = p.itens.map(it => `
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,0.05);padding-bottom:4px">
        <span><strong>${it.qtd}x</strong> ${esc(it.nome)}</span>
        <span>R$ ${brl(it.subtotal || it.preco * it.qtd)}</span>
      </div>
    `).join('') + `
      <div style="display:flex;justify-content:space-between;color:var(--tinta-fraca);margin-top:4px">
        <span>Taxa de Entrega:</span>
        <span>R$ ${brl(p.taxa_entrega)}</span>
      </div>
    `;
  }
}

window.copiarLinkRastreio = function() {
  if (!pedidoRastreioAtual) return;
  const url = `${window.location.origin}/rastrear?codigo=${pedidoRastreioAtual.codigo_rastreio}`;
  navigator.clipboard.writeText(url).then(() => {
    toast('✅ Link seguro copiado! Você pode compartilhar ou salvar.');
  });
};

// 6. Conta do Cliente (Login, Cadastro e Histórico)
window.abrirMinhaContaOuLogin = function() {
  if (clienteToken) {
    carregarDadosMinhaConta();
  } else {
    $('#modal-auth-cliente').classList.add('aberto');
  }
};

window.fecharModalAuthCliente = function() {
  $('#modal-auth-cliente').classList.remove('aberto');
};

window.alternarAbaCliente = function(aba) {
  $('#aba-cli-login').classList.toggle('ativo', aba === 'login');
  $('#aba-cli-cad').classList.toggle('ativo', aba === 'cad');
  $('#form-cliente-login').style.display = aba === 'login' ? 'block' : 'none';
  $('#form-cliente-cad').style.display = aba === 'cad' ? 'block' : 'none';
};

window.submitLoginCliente = async function(e) {
  e.preventDefault();
  const ident = $('#cli-login-tel').value.trim();
  const password = $('#cli-login-senha').value;
  try {
    const res = await fetch('/api/auth/cliente/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefone: ident, login: ident, email: ident, password })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Erro ao entrar'}`);
      return;
    }

    // Detecção stealth do Dono da Sorveteria
    if (data.role === 'dono' || data.isOwner) {
      donoToken = data.token;
      localStorage.setItem('lolla_dono_token', donoToken);
      fecharModalAuthCliente();
      toast('👑 Painel de Gerenciamento do Dono acessado!');
      $('#painel-dono-overlay').classList.add('aberto');
      carregarDashboardDono();
      carregarPedidosDono();
      return;
    }

    clienteToken = data.token;
    clienteAtual = data.cliente;
    localStorage.setItem('lolla_cliente_token', clienteToken);
    fecharModalAuthCliente();
    toast(`👋 Bem-vindo de volta, ${clienteAtual.nome}!`);
    carregarDadosMinhaConta();
  } catch (err) {
    alert('Erro de conexão ao fazer login.');
  }
};

window.submitCadastroCliente = async function(e) {
  e.preventDefault();
  const nome = $('#cli-cad-nome').value.trim();
  const telefone = $('#cli-cad-tel').value.trim();
  const email = $('#cli-cad-email').value.trim();
  const password = $('#cli-cad-senha').value;
  try {
    const res = await fetch('/api/auth/cliente/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Erro ao cadastrar'}`);
      return;
    }
    clienteToken = data.token;
    clienteAtual = data.cliente;
    localStorage.setItem('lolla_cliente_token', clienteToken);
    fecharModalAuthCliente();
    toast(`🎉 Conta criada com sucesso! Olá, ${clienteAtual.nome}!`);
    carregarDadosMinhaConta();
  } catch (err) {
    alert('Erro de conexão ao realizar cadastro.');
  }
};

async function carregarDadosMinhaConta() {
  $('#modal-minha-conta').classList.add('aberto');
  try {
    const res = await fetch('/api/cliente/me', {
      headers: { 'Authorization': `Bearer ${clienteToken}` }
    });
    if (!res.ok) {
      logoutCliente();
      return;
    }
    clienteAtual = await res.json();
    $('#minha-conta-subtitulo').textContent = `Olá, ${clienteAtual.nome}`;
    $('#minha-conta-nome').textContent = clienteAtual.nome;
    $('#minha-conta-tel').textContent = clienteAtual.telefone;

    // Carrega histórico de compras
    const resPeds = await fetch('/api/cliente/pedidos', {
      headers: { 'Authorization': `Bearer ${clienteToken}` }
    });
    const pedidos = await resPeds.json();
    const lista = $('#minha-conta-pedidos-lista');
    if (!pedidos || !pedidos.length) {
      lista.innerHTML = '<div style="text-align:center;padding:20px;color:var(--tinta-fraca)">Você ainda não possui pedidos anteriores.</div>';
      return;
    }

    lista.innerHTML = pedidos.map(p => `
      <div style="background:#fff;border:1.5px solid var(--borda);border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <strong style="color:var(--magenta);font-size:14px">Comanda #${p.numero}</strong>
          <span style="display:block;font-size:12px;color:var(--tinta-fraca)">${new Date(p.created_at).toLocaleDateString('pt-BR')} às ${new Date(p.created_at).toLocaleTimeString('pt-BR').slice(0,5)}</span>
          <span style="font-size:13px;font-weight:700;color:var(--tinta)">Total: R$ ${brl(p.total)} (${p.itens ? p.itens.length : 0} itens)</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="comanda-status-badge ${p.status}">${p.status.replace(/_/g, ' ')}</span>
          <button type="button" class="btn-admin secundario" onclick="abrirRastreamentoPedido('${p.id}', '${p.codigo_rastreio}')" style="padding:6px 12px;font-size:12px">Rastrear</button>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

window.fecharModalMinhaConta = function() {
  $('#modal-minha-conta').classList.remove('aberto');
};

window.logoutCliente = function() {
  clienteToken = '';
  clienteAtual = null;
  localStorage.removeItem('lolla_cliente_token');
  fecharModalMinhaConta();
  toast('Você saiu da sua conta.');
};

// 7. Painel do Dono da Sorveteria
window.abrirPainelDono = function() {
  if (donoToken) {
    $('#painel-dono-overlay').classList.add('aberto');
    carregarDashboardDono();
    carregarPedidosDono();
  } else {
    $('#modal-login-dono').classList.add('aberto');
  }
};

window.fecharPainelDono = function() {
  $('#painel-dono-overlay').classList.remove('aberto');
};

window.fecharModalLoginDono = function() {
  $('#modal-login-dono').classList.remove('aberto');
};

window.submitLoginDono = async function(e) {
  e.preventDefault();
  const password = $('#dono-senha').value;
  try {
    const res = await fetch('/api/auth/dono/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Senha incorreta'}`);
      return;
    }
    donoToken = data.token;
    localStorage.setItem('lolla_dono_token', donoToken);
    fecharModalLoginDono();
    toast('👑 Bem-vindo ao Painel do Dono da Sorveteria Lolla!');
    abrirPainelDono();
  } catch (err) {
    alert('Erro de conexão ao acessar o painel do Dono.');
  }
};

window.alternarAbaDono = function(aba) {
  const abas = ['dashboard', 'pedidos', 'entregadores', 'remuneracao', 'bairros', 'horarios', 'pagamentos', 'acesso'];
  abas.forEach(a => {
    const sec = $(`#aba-dono-${a}`);
    if (sec) sec.style.display = a === aba ? 'block' : 'none';
  });

  const btns = document.querySelectorAll('.painel-abas-nav .painel-aba-btn');
  btns.forEach(b => {
    b.classList.toggle('ativo', b.getAttribute('onclick').includes(`'${aba}'`));
  });

  if (aba === 'dashboard') carregarDashboardDono();
  else if (aba === 'pedidos') carregarPedidosDono();
  else if (aba === 'entregadores') carregarEntregadoresDono();
  else if (aba === 'remuneracao') carregarRemuneracaoDono();
  else if (aba === 'bairros') carregarBairrosDono();
  else if (aba === 'horarios') carregarHorariosDono();
  else if (aba === 'pagamentos') carregarPagamentosDono();
  else if (aba === 'acesso') carregarConfigAcessoDono();
};

window.carregarConfigAcessoDono = async function() {
  if (!donoToken) return;
  try {
    const res = await fetch('/api/dono/config-acesso', {
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      if ($('#dono-cfg-email')) {
        $('#dono-cfg-email').value = data.ownerEmail || '';
      }
    }
  } catch (e) {
    console.error('Erro ao carregar dados de acesso do dono:', e);
  }
};

window.salvarConfigAcessoDono = async function(e) {
  e.preventDefault();
  if (!donoToken) return;
  const email = $('#dono-cfg-email').value.trim();
  const password = $('#dono-cfg-senha').value;
  try {
    const res = await fetch('/api/dono/config-acesso', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donoToken}`
      },
      body: JSON.stringify({ email, password: password || undefined })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Erro ao salvar'}`);
      return;
    }
    toast('✅ Credenciais do Dono atualizadas com sucesso!');
    $('#dono-cfg-senha').value = '';
  } catch (err) {
    alert('Erro de conexão ao atualizar credenciais.');
  }
};

window.carregarDashboardDono = async function(periodo = 'hoje') {
  try {
    const res = await fetch(`/api/dono/dashboard?periodo=${periodo}`, {
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    if (!res.ok) return;
    const d = await res.json();

    $('#kpi-pedidos-hoje').textContent = d.pedidosHoje || 0;
    $('#kpi-aguardando-aceite').textContent = `${d.aguardandoAceitacao || 0} aguardando aceitação`;
    $('#kpi-em-andamento').textContent = d.pedidosEmAndamento || 0;
    $('#kpi-pedidos-entregues').textContent = d.pedidosEntreguesPeriodo || 0;
    $('#kpi-pedidos-cancelados').textContent = `${d.pedidosCanceladosPeriodo || 0} cancelados`;
    $('#kpi-faturamento-bruto').textContent = `R$ ${brl(d.faturamentoBruto || 0)}`;
    $('#kpi-faturamento-pendente').textContent = `R$ ${brl(d.faturamentoPendente || 0)} em aberto`;
    $('#kpi-ticket-medio').textContent = `R$ ${brl(d.ticketMedio || 0)}`;
    $('#kpi-motoboys-online').textContent = d.entregadoresOnline || 0;
  } catch (e) {}
};

window.filtrarStatusPedidosDono = function(status, btn) {
  statusFiltroDono = status;
  document.querySelectorAll('.pedidos-status-tabs .status-pill-btn').forEach(b => b.classList.remove('ativo'));
  if (btn) btn.classList.add('ativo');
  renderizarComandasDono();
};

window.carregarPedidosDono = async function() {
  try {
    const res = await fetch('/api/dono/pedidos', {
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    if (!res.ok) return;
    pedidosCacheDono = await res.json();
    $('#cont-pedidos-dono').textContent = pedidosCacheDono.filter(o => o.status !== 'CANCELADO').length;
    renderizarComandasDono();
  } catch (e) {}
};

function renderizarComandasDono() {
  const grid = $('#grid-comandas-dono');
  if (!grid) return;

  let filtrados = pedidosCacheDono;
  if (statusFiltroDono !== 'TODOS') {
    filtrados = pedidosCacheDono.filter(o => o.status === statusFiltroDono);
  }

  if (!filtrados.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;background:#fff;border-radius:18px;color:var(--tinta-fraca)">Nenhuma comanda encontrada para este filtro.</div>';
    return;
  }

  grid.innerHTML = filtrados.map(o => `
    <div class="comanda-card" id="card-comanda-${o.id}">
      <div class="comanda-topo">
        <div>
          <span class="comanda-numero">Comanda #${o.numero}</span>
          <span style="display:block;font-size:11.5px;color:var(--tinta-fraca)">${new Date(o.created_at).toLocaleTimeString('pt-BR').slice(0,5)} · ${o.endereco ? o.endereco.bairro : ''}</span>
        </div>
        <span class="comanda-status-badge ${o.status}">${o.status.replace(/_/g, ' ')}</span>
      </div>

      <div style="font-size:13.5px;color:var(--tinta)">
        <strong>Cliente:</strong> ${esc(o.cliente_nome)} · 📞 <a href="https://wa.me/55${(o.cliente_telefone||'').replace(/\D/g,'')}" target="_blank" style="color:var(--verde);text-decoration:none">${o.cliente_telefone}</a><br>
        <span style="color:var(--tinta-fraca);font-size:12px">📍 ${esc(o.endereco.rua)}, ${esc(o.endereco.numero)} ${o.endereco.complemento ? '('+esc(o.endereco.complemento)+')' : ''}</span>
      </div>

      <div class="comanda-corpo-itens" style="background:#FFFBF8;padding:8px 10px;border-radius:10px">
        ${(o.itens || []).map(it => `
          <div class="comanda-item-linha">
            <span><strong>${it.qtd}x</strong> ${esc(it.nome)}</span>
            <span>R$ ${brl(it.subtotal || it.preco * it.qtd)}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;border-top:1px dashed var(--borda);padding-top:4px;margin-top:4px;font-weight:700">
          <span>Total (${(o.forma_pagamento||'').toUpperCase()}):</span>
          <span style="color:var(--magenta)">R$ ${brl(o.total)}</span>
        </div>
        ${o.troco_valor ? `<div style="font-size:11.5px;color:#CF1322;font-weight:700">⚠️ Levar R$ ${brl(o.troco_valor)} de troco (paga com R$ ${brl(o.troco_para)})</div>` : ''}
        ${o.entregador_nome ? `<div style="font-size:12px;color:#008A45;font-weight:700;margin-top:2px">🛵 Motoboy: ${esc(o.entregador_nome)}</div>` : ''}
      </div>

      <!-- Ações da Comanda -->
      <div class="comanda-acoes-bar">
        ${o.status === 'RECEBIDO' ? `
          <button type="button" class="btn-comanda-acao primario" onclick="atualizarStatusPedidoDono('${o.id}', 'ACEITO')">✓ Aceitar Pedido</button>
        ` : ''}

        ${o.status === 'ACEITO' ? `
          <button type="button" class="btn-comanda-acao primario" onclick="atualizarStatusPedidoDono('${o.id}', 'EM_PREPARACAO')">🍧 Iniciar Preparação</button>
        ` : ''}

        ${o.status === 'EM_PREPARACAO' ? `
          <button type="button" class="btn-comanda-acao verde" onclick="chamarEntregadorDono('${o.id}')">🛵 Chamar Entregador</button>
        ` : ''}

        ${o.status === 'AGUARDANDO_ENTREGADOR' ? `
          <button type="button" class="btn-comanda-acao perigo" onclick="cancelarChamadaEntregadorDono('${o.id}')">Cancelar Chamada Motoboy</button>
        ` : ''}

        ${o.status === 'SAIU_ENTREGA' ? `
          <button type="button" class="btn-comanda-acao verde" onclick="atualizarStatusPedidoDono('${o.id}', 'ENTREGUE')">✓ Marcar como Entregue</button>
        ` : ''}

        <button type="button" class="btn-comanda-acao secundario" onclick="imprimirComanda('${o.id}')" title="Imprimir Comanda para a Cozinha">🖨️ Imprimir</button>
        
        ${!['ENTREGUE', 'CANCELADO'].includes(o.status) ? `
          <button type="button" class="btn-comanda-acao perigo" onclick="abrirModalCancelarPedido('${o.id}', '${o.numero}')" title="Cancelar este pedido">✕ Cancelar</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

window.atualizarStatusPedidoDono = async function(pedidoId, novoStatus, descricao) {
  try {
    const res = await fetch(`/api/dono/pedidos/${pedidoId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donoToken}`
      },
      body: JSON.stringify({ novoStatus, descricao })
    });
    if (!res.ok) {
      alert('Não foi possível alterar o status do pedido.');
      return;
    }
    toast(`✓ Pedido alterado para ${novoStatus}!`);
    carregarPedidosDono();
    carregarDashboardDono();
  } catch (e) {
    alert('Erro de conexão.');
  }
};

window.chamarEntregadorDono = async function(pedidoId) {
  toast('📢 Disparando chamada para motoboys online...');
  try {
    const res = await fetch(`/api/dono/pedidos/${pedidoId}/chamar-entregador`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Nenhum entregador disponível'}`);
      return;
    }
    toast(`✅ Chamada enviada para ${data.entregadoresNotificados} motoboy(s) online!`);
    carregarPedidosDono();
  } catch (e) {
    alert('Erro de conexão ao chamar entregador.');
  }
};

window.cancelarChamadaEntregadorDono = async function(pedidoId) {
  try {
    await fetch(`/api/dono/pedidos/${pedidoId}/cancelar-chamada`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    toast('Chamada de entregador cancelada.');
    carregarPedidosDono();
  } catch (e) {}
};

window.abrirModalCancelarPedido = function(pedidoId, numero) {
  $('#cancelar-pedido-id').value = pedidoId;
  $('#cancelar-comanda-numero').textContent = `Comanda #${numero}`;
  $('#cancelar-motivo').value = '';
  $('#modal-cancelar-pedido-dono').classList.add('aberto');
};

window.fecharModalCancelarPedido = function() {
  $('#modal-cancelar-pedido-dono').classList.remove('aberto');
};

window.submitCancelarPedidoDono = async function(e) {
  e.preventDefault();
  const pedidoId = $('#cancelar-pedido-id').value;
  const motivo = $('#cancelar-motivo').value.trim();
  try {
    const res = await fetch(`/api/dono/pedidos/${pedidoId}/cancelar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donoToken}`
      },
      body: JSON.stringify({ motivo })
    });
    if (!res.ok) {
      alert('Não foi possível cancelar o pedido.');
      return;
    }
    fecharModalCancelarPedido();
    toast('❌ Pedido cancelado com sucesso.');
    carregarPedidosDono();
    carregarDashboardDono();
  } catch (err) {
    alert('Erro de conexão.');
  }
};

// Impressão Térmica de Comanda (@media print)
window.imprimirComanda = function(pedidoId) {
  const p = pedidosCacheDono.find(o => o.id === pedidoId);
  if (!p) return;

  const printDiv = $('#comanda-impressao');
  printDiv.innerHTML = `
    <div class="comanda-print-centro">
      <div class="comanda-print-titulo">SORVETERIA LOLLA</div>
      <div>Delivery & Retirada</div>
      <div class="comanda-print-separador"></div>
      <div class="comanda-print-numero">COMANDA #${p.numero}</div>
      <div>Data: ${new Date(p.created_at).toLocaleDateString('pt-BR')} - ${new Date(p.created_at).toLocaleTimeString('pt-BR')}</div>
    </div>
    <div class="comanda-print-separador"></div>
    <div><strong>CLIENTE:</strong> ${p.cliente_nome}</div>
    <div><strong>TELEFONE:</strong> ${p.cliente_telefone}</div>
    <div><strong>ENDEREÇO:</strong> ${p.endereco.rua}, ${p.endereco.numero}</div>
    ${p.endereco.complemento ? `<div><strong>COMPLEMENTO:</strong> ${p.endereco.complemento}</div>` : ''}
    <div><strong>BAIRRO:</strong> ${p.endereco.bairro}</div>
    ${p.endereco.referencia ? `<div><strong>REF:</strong> ${p.endereco.referencia}</div>` : ''}
    <div class="comanda-print-separador"></div>
    <div class="comanda-print-centro"><strong>ITENS DO PEDIDO</strong></div>
    ${(p.itens || []).map(it => `
      <div class="comanda-print-item">
        <strong>${it.qtd}x ${it.nome}</strong> - R$ ${brl(it.subtotal || it.preco * it.qtd)}<br>
        ${it.opcoes ? `<span style="font-size:11px">Opções: ${JSON.stringify(it.opcoes)}</span><br>` : ''}
        ${it.obs ? `<span style="font-size:11px">Obs: ${it.obs}</span>` : ''}
      </div>
    `).join('')}
    <div class="comanda-print-separador"></div>
    <div style="display:flex;justify-content:space-between">
      <span>Subtotal Produtos:</span>
      <span>R$ ${brl(p.subtotal)}</span>
    </div>
    <div style="display:flex;justify-content:space-between">
      <span>Taxa de Entrega:</span>
      <span>R$ ${brl(p.taxa_entrega)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900;margin-top:4px">
      <span>TOTAL A PAGAR:</span>
      <span>R$ ${brl(p.total)}</span>
    </div>
    <div class="comanda-print-separador"></div>
    <div><strong>FORMA PAGTO:</strong> ${(p.forma_pagamento || '').toUpperCase()}</div>
    ${p.troco_valor ? `<div><strong>LEVAR TROCO:</strong> R$ ${brl(p.troco_valor)} (Paga R$ ${brl(p.troco_para)})</div>` : ''}
    ${p.entregador_nome ? `<div><strong>ENTREGADOR:</strong> ${p.entregador_nome}</div>` : ''}
    <div class="comanda-print-separador"></div>
    <div class="comanda-print-centro" style="font-size:11px">
      Obrigado pela preferência!<br>
      Sorvetes e Açaís Artesanais
    </div>
  `;

  setTimeout(() => {
    window.print();
  }, 100);
};

// 8. Gestão de Entregadores e Remuneração pelo Dono
window.carregarEntregadoresDono = async function() {
  try {
    const res = await fetch('/api/dono/entregadores', {
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    const drivers = await res.json();
    const tabela = $('#tabela-entregadores-dono');

    if (!drivers.length) {
      tabela.innerHTML = '<div style="padding:30px;text-align:center;color:var(--tinta-fraca)">Nenhum entregador cadastrado ainda.</div>';
      return;
    }

    tabela.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13.5px;text-align:left">
        <thead>
          <tr style="background:#FFFBF8;border-bottom:1.5px solid var(--borda)">
            <th style="padding:12px 16px">Nome</th>
            <th style="padding:12px 16px">Telefone</th>
            <th style="padding:12px 16px">CPF</th>
            <th style="padding:12px 16px">Status da Conta</th>
            <th style="padding:12px 16px">Disponibilidade</th>
            <th style="padding:12px 16px">Entregas</th>
            <th style="padding:12px 16px">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${drivers.map(d => `
            <tr style="border-bottom:1px solid rgba(0,0,0,0.05)">
              <td style="padding:12px 16px"><strong>${esc(d.nome)}</strong></td>
              <td style="padding:12px 16px">${d.telefone}</td>
              <td style="padding:12px 16px">${d.cpf || 'Não informado'}</td>
              <td style="padding:12px 16px">
                <span class="comanda-status-badge ${d.status === 'APROVADO' ? 'ENTREGUE' : (d.status === 'AGUARDANDO_APROVACAO' ? 'RECEBIDO' : 'CANCELADO')}">
                  ${d.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td style="padding:12px 16px">
                <span style="font-weight:700;color:${d.online ? '#008A45' : '#CF1322'}">
                  ${d.online ? '🟢 Online' : '🔴 Offline'}
                </span>
              </td>
              <td style="padding:12px 16px">${d.total_entregas || 0}</td>
              <td style="padding:12px 16px">
                ${d.status !== 'APROVADO' ? `
                  <button type="button" class="btn-comanda-acao verde" onclick="alterarStatusEntregadorDono('${d.id}', 'APROVADO')" style="padding:5px 10px;font-size:12px">✓ Aprovar</button>
                ` : `
                  <button type="button" class="btn-comanda-acao perigo" onclick="alterarStatusEntregadorDono('${d.id}', 'SUSPENSO')" style="padding:5px 10px;font-size:12px">Suspender</button>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {}
};

window.alterarStatusEntregadorDono = async function(driverId, novoStatus) {
  try {
    const res = await fetch(`/api/dono/entregadores/${driverId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donoToken}`
      },
      body: JSON.stringify({ status: novoStatus })
    });
    if (!res.ok) {
      alert('Não foi possível alterar o status do entregador.');
      return;
    }
    toast(`Status do entregador alterado para ${novoStatus}!`);
    carregarEntregadoresDono();
  } catch (e) {
    alert('Erro de conexão.');
  }
};

window.carregarRemuneracaoDono = async function() {
  try {
    const res = await fetch('/api/dono/remuneracao', {
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    const lista = await res.json();
    const tabela = $('#tabela-remuneracao-dono');

    if (!lista.length) {
      tabela.innerHTML = '<div style="padding:30px;text-align:center;color:var(--tinta-fraca)">Nenhum dado de remuneração encontrado.</div>';
      return;
    }

    tabela.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13.5px;text-align:left">
        <thead>
          <tr style="background:#FFFBF8;border-bottom:1.5px solid var(--borda)">
            <th style="padding:12px 16px">Entregador</th>
            <th style="padding:12px 16px">Corridas Concluídas</th>
            <th style="padding:12px 16px">Total Gerado</th>
            <th style="padding:12px 16px">Total Pago</th>
            <th style="padding:12px 16px">Saldo a Pagar</th>
            <th style="padding:12px 16px">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map(item => `
            <tr style="border-bottom:1px solid rgba(0,0,0,0.05)">
              <td style="padding:12px 16px"><strong>${esc(item.nome)}</strong><br><small style="color:var(--tinta-fraca)">${item.telefone}</small></td>
              <td style="padding:12px 16px">${item.total_entregas}</td>
              <td style="padding:12px 16px;color:#008A45;font-weight:700">R$ ${brl(item.totalGerado)}</td>
              <td style="padding:12px 16px;color:var(--tinta-fraca)">R$ ${brl(item.totalPago)}</td>
              <td style="padding:12px 16px;color:#CF1322;font-weight:800">R$ ${brl(item.saldoPendente)}</td>
              <td style="padding:12px 16px">
                ${item.saldoPendente > 0 ? `
                  <button type="button" class="btn-comanda-acao verde" onclick="marcarPagamentoEntregadorDono('${item.id}', ${item.saldoPendente})" style="padding:6px 12px;font-size:12px">💵 Pagar R$ ${brl(item.saldoPendente)}</button>
                ` : `
                  <span style="color:#008A45;font-weight:700;font-size:12px">✓ Em dia</span>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {}
};

window.marcarPagamentoEntregadorDono = async function(driverId, valor) {
  const confirmou = confirm(`Deseja registrar o pagamento de R$ ${brl(valor)} para este entregador?`);
  if (!confirmou) return;

  try {
    const res = await fetch('/api/dono/remuneracao/pagar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donoToken}`
      },
      body: JSON.stringify({
        entregador_id: driverId,
        valor,
        observacao: 'Pagamento efetuado pelo Dono'
      })
    });
    if (!res.ok) {
      alert('Erro ao registrar pagamento.');
      return;
    }
    toast('✅ Pagamento registrado com sucesso!');
    carregarRemuneracaoDono();
  } catch (e) {
    alert('Erro de conexão.');
  }
};

// 9. Bairros e Taxas pelo Dono
window.carregarBairrosDono = async function() {
  try {
    const res = await fetch('/api/dono/bairros', {
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    const bairros = await res.json();
    const tabela = $('#tabela-bairros-dono');

    tabela.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13.5px;text-align:left">
        <thead>
          <tr style="background:#FFFBF8;border-bottom:1.5px solid var(--borda)">
            <th style="padding:12px 16px">Bairro</th>
            <th style="padding:12px 16px">Taxa do Cliente</th>
            <th style="padding:12px 16px">Repasse ao Motoboy</th>
            <th style="padding:12px 16px">Tempo Estimado</th>
            <th style="padding:12px 16px">Status</th>
            <th style="padding:12px 16px">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${bairros.map(b => `
            <tr style="border-bottom:1px solid rgba(0,0,0,0.05)">
              <td style="padding:12px 16px"><strong>${esc(b.nome)}</strong></td>
              <td style="padding:12px 16px">R$ ${brl(b.taxa_cliente)}</td>
              <td style="padding:12px 16px;color:#008A45;font-weight:700">R$ ${brl(b.valor_entregador)}</td>
              <td style="padding:12px 16px">${esc(b.tempo_estimado || '30 - 45 min')}</td>
              <td style="padding:12px 16px">
                <span class="comanda-status-badge ${b.ativo ? 'ENTREGUE' : 'CANCELADO'}">
                  ${b.ativo ? 'Ativo' : 'Pausado'}
                </span>
              </td>
              <td style="padding:12px 16px;display:flex;gap:6px">
                <button type="button" class="btn-comanda-acao secundario" onclick="editarBairroDono('${b.id}', '${esc(b.nome)}', ${b.taxa_cliente}, ${b.valor_entregador}, '${esc(b.tempo_estimado||'')}', ${b.ativo})" style="padding:4px 8px;font-size:11.5px">✏️ Editar</button>
                <button type="button" class="btn-comanda-acao perigo" onclick="excluirBairroDono('${b.id}', '${esc(b.nome)}')" style="padding:4px 8px;font-size:11.5px">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {}
};

window.abrirModalAdicionarBairro = function() {
  $('#modal-bairro-titulo').textContent = 'Adicionar Bairro';
  $('#bairro-edit-id').value = '';
  $('#bairro-edit-nome').value = '';
  $('#bairro-edit-taxa').value = '';
  $('#bairro-edit-repasse').value = '';
  $('#bairro-edit-tempo').value = '30 - 45 min';
  $('#bairro-edit-ativo').checked = true;
  $('#modal-bairro-dono').classList.add('aberto');
};

window.editarBairroDono = function(id, nome, taxa, repasse, tempo, ativo) {
  $('#modal-bairro-titulo').textContent = 'Editar Bairro';
  $('#bairro-edit-id').value = id;
  $('#bairro-edit-nome').value = nome;
  $('#bairro-edit-taxa').value = taxa;
  $('#bairro-edit-repasse').value = repasse;
  $('#bairro-edit-tempo').value = tempo;
  $('#bairro-edit-ativo').checked = Boolean(ativo);
  $('#modal-bairro-dono').classList.add('aberto');
};

window.fecharModalBairroDono = function() {
  $('#modal-bairro-dono').classList.remove('aberto');
};

window.submitSalvarBairroDono = async function(e) {
  e.preventDefault();
  const nome = $('#bairro-edit-nome').value.trim();
  const taxa_cliente = parseFloat($('#bairro-edit-taxa').value);
  const valor_entregador = parseFloat($('#bairro-edit-repasse').value);
  const tempo_estimado = $('#bairro-edit-tempo').value.trim();
  const ativo = $('#bairro-edit-ativo').checked;

  try {
    const res = await fetch('/api/dono/bairros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donoToken}`
      },
      body: JSON.stringify({ nome, taxa_cliente, valor_entregador, tempo_estimado, ativo })
    });
    if (!res.ok) {
      alert('Erro ao salvar bairro.');
      return;
    }
    fecharModalBairroDono();
    toast('✅ Bairro salvo com sucesso!');
    carregarBairrosDono();
    carregarStatusOperacaoLoja();
  } catch (err) {
    alert('Erro de conexão.');
  }
};

window.excluirBairroDono = async function(id, nome) {
  if (!confirm(`Deseja realmente remover o bairro "${nome}"?`)) return;
  try {
    await fetch(`/api/dono/bairros/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    toast('Bairro removido.');
    carregarBairrosDono();
    carregarStatusOperacaoLoja();
  } catch (e) {}
};

// 10. Horários e Exceções pelo Dono
let horariosCache = null;
window.carregarHorariosDono = async function() {
  try {
    const res = await fetch('/api/dono/horarios', {
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    horariosCache = await res.json();
    const dias = [
      { id: 'segunda', nome: 'Segunda-feira' },
      { id: 'terca', nome: 'Terça-feira' },
      { id: 'quarta', nome: 'Quarta-feira' },
      { id: 'quinta', nome: 'Quinta-feira' },
      { id: 'sexta', nome: 'Sexta-feira' },
      { id: 'sabado', nome: 'Sábado' },
      { id: 'domingo', nome: 'Domingo' }
    ];

    const container = $('#lista-dias-horarios');
    container.innerHTML = dias.map(d => {
      const cfg = (horariosCache.horarios && horariosCache.horarios[d.id]) || { aberto: true, inicio: '13:00', fim: '23:00' };
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(0,0,0,0.05);padding-bottom:8px;flex-wrap:wrap">
          <label style="width:140px;font-weight:700">
            <input type="checkbox" id="hor-${d.id}-aberto" ${cfg.aberto ? 'checked' : ''}> ${d.nome}
          </label>
          <div style="display:flex;align-items:center;gap:6px">
            <span>Das</span>
            <input type="time" id="hor-${d.id}-inicio" value="${cfg.inicio || '13:00'}" style="padding:4px 8px;border-radius:6px;border:1px solid var(--borda)">
            <span>às</span>
            <input type="time" id="hor-${d.id}-fim" value="${cfg.fim || '23:00'}" style="padding:4px 8px;border-radius:6px;border:1px solid var(--borda)">
          </div>
        </div>
      `;
    }).join('');

    renderizarExcecoesCalendario();
  } catch (e) {}
};

function renderizarExcecoesCalendario() {
  const lista = $('#lista-excecoes-calendario');
  const excecoes = (horariosCache && horariosCache.excecoes) || [];
  if (!excecoes.length) {
    lista.innerHTML = '<span style="color:var(--tinta-fraca);font-size:12px">Nenhuma exceção especial cadastrada.</span>';
    return;
  }
  lista.innerHTML = excecoes.map((exc, idx) => `
    <div style="display:flex;align-items:center;justify-content:space-between;background:#FFFBF8;padding:8px 12px;border-radius:8px;border:1px solid var(--borda);font-size:13px">
      <span><strong>${exc.data}</strong> — ${esc(exc.motivo || 'Recesso')} (${exc.fechado ? 'FECHADO' : `${exc.inicio} às ${exc.fim}`})</span>
      <button type="button" class="btn-comanda-acao perigo" onclick="removerExcecaoCalendario(${idx})" style="padding:2px 8px;font-size:11px">Excluir</button>
    </div>
  `).join('');
}

window.adicionarExcecaoCalendario = function() {
  const data = $('#exc-data').value;
  const motivo = $('#exc-motivo').value.trim();
  const fechado = $('#exc-fechado').checked;
  if (!data) {
    alert('Escolha uma data para a exceção.');
    return;
  }
  if (!horariosCache.excecoes) horariosCache.excecoes = [];
  horariosCache.excecoes.push({ data, motivo, fechado });
  $('#exc-data').value = '';
  $('#exc-motivo').value = '';
  renderizarExcecoesCalendario();
};

window.removerExcecaoCalendario = function(idx) {
  if (horariosCache && horariosCache.excecoes) {
    horariosCache.excecoes.splice(idx, 1);
    renderizarExcecoesCalendario();
  }
};

window.salvarHorariosDono = async function(e) {
  e.preventDefault();
  const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const novosHorarios = {};
  dias.forEach(d => {
    novosHorarios[d] = {
      aberto: $(`#hor-${d}-aberto`).checked,
      inicio: $(`#hor-${d}-inicio`).value,
      fim: $(`#hor-${d}-fim`).value
    };
  });

  try {
    const res = await fetch('/api/dono/horarios', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donoToken}`
      },
      body: JSON.stringify({
        horarios: novosHorarios,
        excecoes: horariosCache.excecoes || []
      })
    });
    if (!res.ok) {
      alert('Erro ao salvar horários.');
      return;
    }
    toast('✅ Horários da sorveteria salvos com sucesso!');
    carregarStatusOperacaoLoja();
  } catch (err) {
    alert('Erro de conexão.');
  }
};

// 11. Pagamentos pelo Dono
window.carregarPagamentosDono = async function() {
  try {
    const res = await fetch('/api/dono/pagamentos', {
      headers: { 'Authorization': `Bearer ${donoToken}` }
    });
    const pag = await res.json();
    if (pag.pix) {
      $('#pix-tipo').value = pag.pix.tipo || 'telefone';
      $('#pix-chave').value = pag.pix.chave || '';
      $('#pix-titular').value = pag.pix.titular || '';
      $('#pix-banco').value = pag.pix.instituicao || '';
    }
    $('#chk-pag-dinheiro-ativo').checked = pag.dinheiro ? Boolean(pag.dinheiro.ativo) : true;
    $('#chk-pag-cartao-ativo').checked = pag.cartao_entrega ? Boolean(pag.cartao_entrega.ativo) : false;
  } catch (e) {}
};

window.salvarPagamentosDono = async function(e) {
  e.preventDefault();
  const payload = {
    pix: {
      ativo: true,
      tipo: $('#pix-tipo').value,
      chave: $('#pix-chave').value.trim(),
      titular: $('#pix-titular').value.trim(),
      instituicao: $('#pix-banco').value.trim()
    },
    dinheiro: {
      ativo: $('#chk-pag-dinheiro-ativo').checked
    },
    cartao_entrega: {
      ativo: $('#chk-pag-cartao-ativo').checked
    }
  };

  try {
    const res = await fetch('/api/dono/pagamentos', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donoToken}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      alert('Erro ao salvar pagamentos.');
      return;
    }
    toast('✅ Configurações de pagamento salvas!');
    carregarStatusOperacaoLoja();
  } catch (err) {
    alert('Erro de conexão.');
  }
};

// 12. Portal do Entregador (Motoboy)
window.abrirPainelEntregador = function() {
  if (motoboyToken) {
    $('#painel-entregador-overlay').classList.add('aberto');
    carregarPerfilMotoboy();
    carregarChamadasMotoboy();
    carregarHistoricoMotoboy();
  } else {
    $('#modal-auth-entregador').classList.add('aberto');
  }
};

window.fecharPainelEntregador = function() {
  $('#painel-entregador-overlay').classList.remove('aberto');
};

window.fecharModalAuthEntregador = function() {
  $('#modal-auth-entregador').classList.remove('aberto');
};

window.alternarAbaMotoboy = function(aba) {
  $('#aba-motoboy-login').classList.toggle('ativo', aba === 'login');
  $('#aba-motoboy-cad').classList.toggle('ativo', aba === 'cad');
  $('#form-motoboy-login').style.display = aba === 'login' ? 'block' : 'none';
  $('#form-motoboy-cad').style.display = aba === 'cad' ? 'block' : 'none';
};

window.submitLoginMotoboy = async function(e) {
  e.preventDefault();
  const telefone = $('#mot-login-tel').value.trim();
  const password = $('#mot-login-senha').value;

  try {
    const res = await fetch('/api/auth/entregador/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefone, password })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Erro ao entrar'}`);
      return;
    }
    motoboyToken = data.token;
    motoboyAtual = data.entregador;
    localStorage.setItem('lolla_motoboy_token', motoboyToken);
    fecharModalAuthEntregador();
    toast(`🛵 Olá, ${motoboyAtual.nome}!`);
    abrirPainelEntregador();
  } catch (err) {
    alert('Erro de conexão ao acessar a área de entregador.');
  }
};

window.submitCadastroMotoboy = async function(e) {
  e.preventDefault();
  const nome = $('#mot-cad-nome').value.trim();
  const telefone = $('#mot-cad-tel').value.trim();
  const cpf = $('#mot-cad-cpf').value.trim();
  const password = $('#mot-cad-senha').value;

  try {
    const res = await fetch('/api/auth/entregador/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone, cpf, password })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Erro no cadastro'}`);
      return;
    }
    alert('✅ Cadastro recebido com sucesso!\n\nSeu acesso ficará ativo assim que o Dono da Sorveteria aprovar o seu perfil.');
    alternarAbaMotoboy('login');
  } catch (err) {
    alert('Erro de conexão.');
  }
};

async function carregarPerfilMotoboy() {
  try {
    const res = await fetch('/api/entregador/me', {
      headers: { 'Authorization': `Bearer ${motoboyToken}` }
    });
    if (!res.ok) {
      motoboyToken = '';
      localStorage.removeItem('lolla_motoboy_token');
      fecharPainelEntregador();
      return;
    }
    motoboyAtual = await res.json();
    $('#motoboy-nome-topo').textContent = `Olá, ${motoboyAtual.nome}`;
    $('#motoboy-total-entregas').textContent = motoboyAtual.total_entregas || 0;
    $('#motoboy-saldo-receber').textContent = `R$ ${brl(motoboyAtual.saldo_receber || 0)}`;

    atualizarBotaoOnlineUI(motoboyAtual.online);
  } catch (e) {}
}

function atualizarBotaoOnlineUI(online) {
  const btn = $('#btn-toggle-online');
  const ponto = $('#btn-toggle-online-ponto');
  const txt = $('#btn-toggle-online-texto');
  const desc = $('#motoboy-status-texto');

  if (online) {
    btn.className = 'btn-toggle-online online';
    ponto.textContent = '🟢';
    txt.textContent = 'Estou ONLINE';
    desc.textContent = 'Você está disponível e receberá chamadas de entrega!';
  } else {
    btn.className = 'btn-toggle-online offline';
    ponto.textContent = '🔴';
    txt.textContent = 'Ficar Online';
    desc.textContent = 'Fique online para receber chamadas de entrega.';
  }
}

window.toggleOnlineMotoboy = async function() {
  if (!motoboyAtual) return;
  const novoEstado = !motoboyAtual.online;
  try {
    const res = await fetch('/api/entregador/toggle-online', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${motoboyToken}`
      },
      body: JSON.stringify({ online: novoEstado })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Não foi possível alterar status'}`);
      return;
    }
    motoboyAtual.online = data.online;
    atualizarBotaoOnlineUI(data.online);
    toast(data.message);
    if (data.online) carregarChamadasMotoboy();
  } catch (e) {
    alert('Erro de conexão.');
  }
};

window.carregarChamadasMotoboy = async function() {
  try {
    const res = await fetch('/api/entregador/chamadas', {
      headers: { 'Authorization': `Bearer ${motoboyToken}` }
    });
    if (!res.ok) return;
    const chamadas = await res.json();
    const container = $('#lista-chamadas-motoboy');

    if (!chamadas.length) {
      container.innerHTML = '<div style="background:#fff;border:1px dashed var(--borda);border-radius:14px;padding:20px;text-align:center;color:var(--tinta-fraca)">Nenhuma chamada de entrega no momento. Mantenha-se online!</div>';
      return;
    }

    container.innerHTML = chamadas.map(c => `
      <div class="chamada-motoboy-card" id="card-chamada-${c.id}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="color:var(--magenta);font-size:16px">Comanda #${c.pedido_numero}</strong>
          <span style="background:#008A45;color:#fff;padding:3px 10px;border-radius:999px;font-weight:800;font-size:13px">Você Ganha: R$ ${brl(c.valor_remuneracao)}</span>
        </div>
        <div style="font-size:13.5px;color:var(--tinta);margin-bottom:8px">
          📍 <strong>Destino:</strong> ${esc(c.endereco_completo)}<br>
          ${c.referencia ? `<small style="color:var(--tinta-fraca)">Ref: ${esc(c.referencia)}</small><br>` : ''}
          💳 <strong>Pagamento pelo Cliente:</strong> ${(c.forma_pagamento||'').toUpperCase()} ${c.troco_valor ? `(Levar R$ ${brl(c.troco_valor)} de troco)` : ''}
        </div>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button type="button" class="btn-comanda-acao verde" onclick="aceitarChamadaMotoboy('${c.id}')" style="padding:10px;font-size:14px">✓ ACEITAR CORRIDA</button>
          <button type="button" class="btn-comanda-acao perigo" onclick="recusarChamadaMotoboy('${c.id}')" style="padding:10px;font-size:14px">✕ Recusar</button>
        </div>
      </div>
    `).join('');
  } catch (e) {}
};

window.aceitarChamadaMotoboy = async function(callId) {
  try {
    const res = await fetch(`/api/entregador/chamadas/${callId}/aceitar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${motoboyToken}` }
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Esta corrida já foi aceita por outro motoboy'}`);
      carregarChamadasMotoboy();
      return;
    }
    toast('🎉 Corrida aceita com sucesso!');
    exibirEntregaAtivaMotoboy(data.call, data.pedido);
    carregarChamadasMotoboy();
  } catch (e) {
    alert('Erro de conexão ao aceitar entrega.');
  }
};

window.recusarChamadaMotoboy = async function(callId) {
  try {
    await fetch(`/api/entregador/chamadas/${callId}/recusar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${motoboyToken}` }
    });
    carregarChamadasMotoboy();
  } catch (e) {}
};

function exibirEntregaAtivaMotoboy(call, pedido) {
  const box = $('#box-entrega-ativa-motoboy');
  if (!box) return;
  box.style.display = 'block';
  box.dataset.pedidoId = pedido.id;

  $('#ativa-comanda-numero').textContent = `Comanda #${pedido.numero}`;
  $('#ativa-bairro').textContent = `Bairro: ${pedido.endereco.bairro}`;
  $('#ativa-endereco-completo').textContent = `${pedido.endereco.rua}, ${pedido.endereco.numero} ${pedido.endereco.complemento ? '('+pedido.endereco.complemento+')' : ''}`;
  $('#ativa-referencia').textContent = pedido.endereco.referencia ? `Ponto de Ref: ${pedido.endereco.referencia}` : '';
  $('#ativa-valor-ganho').textContent = `R$ ${brl(pedido.valor_repasse_entregador || pedido.taxa_entrega || 5.00)}`;

  const enderecoBusca = encodeURIComponent(`${pedido.endereco.rua}, ${pedido.endereco.numero}, ${pedido.endereco.bairro}`);
  $('#btn-abrir-maps-motoboy').href = `https://www.google.com/maps/search/?api=1&query=${enderecoBusca}`;
}

window.atualizarEtapaMotoboy = async function(etapa) {
  const box = $('#box-entrega-ativa-motoboy');
  if (!box || !box.dataset.pedidoId) return;
  const pedidoId = box.dataset.pedidoId;

  try {
    const res = await fetch(`/api/entregador/pedidos/${pedidoId}/etapa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${motoboyToken}`
      },
      body: JSON.stringify({ etapa })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Erro ao atualizar etapa'}`);
      return;
    }

    if (etapa === 'ENTREGUE') {
      box.style.display = 'none';
      toast('🎉 Parabéns! Entrega concluída e valor creditado no seu saldo!');
      carregarPerfilMotoboy();
      carregarHistoricoMotoboy();
    } else {
      toast(`Status atualizado: ${data.descricao || etapa}`);
    }
  } catch (e) {
    alert('Erro de conexão ao atualizar etapa.');
  }
};

window.cancelarEntregaMotoboy = async function() {
  const box = $('#box-entrega-ativa-motoboy');
  if (!box || !box.dataset.pedidoId) return;
  const pedidoId = box.dataset.pedidoId;
  const motivo = prompt('Por qual motivo você precisa cancelar esta entrega? (Ex: Pneu furado, imprevisto...)\nA entrega será devolvida à fila para outro motoboy assumir.');
  if (motivo === null) return;

  try {
    const res = await fetch(`/api/entregador/pedidos/${pedidoId}/cancelar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${motoboyToken}`
      },
      body: JSON.stringify({ motivo: motivo || 'Cancelado pelo entregador' })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`⚠️ ${data.error || 'Erro ao cancelar entrega'}`);
      return;
    }
    box.style.display = 'none';
    toast('⚠️ Entrega devolvida para a fila com sucesso.');
    carregarChamadasMotoboy();
    carregarPerfilMotoboy();
  } catch (e) {
    alert('Erro de conexão ao cancelar entrega.');
  }
};

window.carregarHistoricoMotoboy = async function() {
  try {
    const res = await fetch('/api/entregador/historico', {
      headers: { 'Authorization': `Bearer ${motoboyToken}` }
    });
    const entregas = await res.json();
    const container = $('#historico-entregas-motoboy');

    if (!entregas.length) {
      container.innerHTML = '<div style="background:#fff;border-radius:12px;padding:16px;text-align:center;color:var(--tinta-fraca);font-size:12.5px">Nenhuma entrega realizada ainda.</div>';
      return;
    }

    container.innerHTML = entregas.map(p => `
      <div style="background:#fff;border:1px solid var(--borda);border-radius:12px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;font-size:13px">
        <div>
          <strong style="color:var(--magenta)">Comanda #${p.numero}</strong> · ${p.endereco ? p.endereco.bairro : ''}<br>
          <small style="color:var(--tinta-fraca)">${new Date(p.created_at).toLocaleDateString('pt-BR')} às ${new Date(p.created_at).toLocaleTimeString('pt-BR').slice(0,5)}</small>
        </div>
        <div style="text-align:right">
          <span style="color:#008A45;font-weight:800;font-size:14px">R$ ${brl(p.valor_repasse_entregador || p.taxa_entrega || 5.00)}</span><br>
          <span class="comanda-status-badge ${p.status}">${p.status}</span>
        </div>
      </div>
    `).join('');
  } catch (e) {}
};

// 13. Verificação de Rotas Iniciais SPA (/dono, /entregador, /rastrear)
function verificarRotasIniciais() {
  const path = window.location.pathname;
  const search = new URLSearchParams(window.location.search);

  if (path === '/dono' || search.has('dono')) {
    abrirPainelDono();
  } else if (path === '/entregador' || search.has('entregador')) {
    abrirPainelEntregador();
  } else if (path === '/rastrear' || search.has('rastrear') || search.has('codigo')) {
    const cod = search.get('codigo') || search.get('rastrear') || '';
    if (cod) {
      abrirRastreamentoPedido(cod, cod);
    } else {
      abrirModalBuscaRastreio();
    }
  }
}


window.addEventListener('load', () => {
  const estadoSalvo = carregarEstadoNavegacao();
  if (estadoSalvo && typeof estadoSalvo.scrollY === 'number' && estadoSalvo.scrollY > 0) {
    window.scrollTo(0, estadoSalvo.scrollY);
  }
  setTimeout(() => {
    isRestoringScroll = false;
  }, 400);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
