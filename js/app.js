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
  fotosBaseUrl: 'https://lolla-maringa.vercel.app/cardapios/fotos-v1/'
};

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
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(CONFIG));
    } catch (e) {}
  } else {
    D.config = { nome: CONFIG.nome, whatsapp: CONFIG.whatsapp };
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

function resolveImageTag(it, i) {
  if (it.img) {
    return `<img src="${it.img}" alt="${esc(it.n)}" width="400" height="400"
                 loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async"
                 fetchpriority="${i < 4 ? 'high' : 'auto'}">`;
  }
  if (it.w4) {
    return `<picture>
      <source type="image/webp" sizes="(min-width:880px) 250px, (min-width:560px) 32vw, 47vw"
              srcset="${CONFIG.fotosBaseUrl}${it.w4} 400w, ${CONFIG.fotosBaseUrl}${it.w6} 600w, ${CONFIG.fotosBaseUrl}${it.w8} 800w">
      <img src="${CONFIG.fotosBaseUrl}${it.j}" alt="${esc(it.n)}" width="400" height="400"
           loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async"
           fetchpriority="${i < 4 ? 'high' : 'auto'}">
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

  return `<article class="card ${oculto ? 'card-oculto' : ''}" data-idx="${itemIndex}" style="animation-delay:${Math.min(i, 11) * 28}ms">
    <div class="foto">
      ${imgHtml}
      ${off ? `<span class="off">-${off}%</span>` : ''}
      <div class="card-admin-actions">
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
        <button type="button" class="btn-card-txt editar" onclick="abrirModalEditar(${itemIndex})">✏️ Editar</button>
        <button type="button" class="btn-card-txt duplicar" onclick="duplicarProduto(${itemIndex})" title="Criar cópia deste produto nesta categoria">📋 Duplicar</button>
        <button type="button" class="btn-card-txt ocultar" onclick="alternarOcultarProduto(${itemIndex})">${oculto ? '👁️ Mostrar' : '🙈 Ocultar'}</button>
        <button type="button" class="btn-card-txt excluir" onclick="removerProduto(${itemIndex})">🗑️</button>
      </div>

      <div class="rodape-card">
        <div class="precos">
          <span class="preco-atual"><small>R$</small> ${brl(p)}</span>
          ${off ? `<span class="preco-antigo">R$ ${brl(po)}</span>` : ''}
        </div>
        <div class="card-acoes-dupla">
          <a class="btn-pedir-zap" href="${link(it)}" target="_blank" rel="noopener"
             aria-label="Pedir ${esc(it.n)} pelo WhatsApp">
             ${ZAP_ICON} Pedir no WhatsApp
          </a>
          <button type="button" class="btn-pedir-add" onclick="adicionarAoPedido(${itemIndex}, event)" title="Adicionar ao pedido">
            🛒 Adicionar ao pedido
          </button>
        </div>
      </div>
    </div>
  </article>`;
}

function renderDestaquesMomento() {
  const el = $('#grade-destaques-momento');
  if (!el || !D || !D.itens) return;

  // Busca 3 produtos de destaque (preferência Açaí Monte o Seu ou itens em oferta)
  let destaques = D.itens.filter(it => it.c === 'Açaí Monte o Seu!!!').slice(0, 3);
  if (destaques.length < 3) {
    const comOff = D.itens.filter(it => it.po > it.p);
    destaques = comOff.slice(0, 3);
  }
  if (!destaques.length) destaques = D.itens.slice(0, 3);

  el.innerHTML = destaques.map((it, idx) => {
    const itemIndex = D.itens.indexOf(it);
    const p = parseFloat(it.p) || 0;
    const po = parseFloat(it.po) || 0;
    const off = po > p ? Math.round((1 - p / po) * 100) : 0;
    const { title, size, desc } = formatProduct(it);
    const imgHtml = resolveImageTag(it, idx);

    return `
      <div class="destaque-momento-card">
        <div class="destaque-momento-foto">
          ${imgHtml}
          ${off ? `<span class="off">-${off}%</span>` : ''}
        </div>
        <div class="destaque-momento-info">
          <h3 class="destaque-momento-nome">${esc(title)}</h3>
          ${size ? `<span class="destaque-momento-tamanho">${esc(size)}</span>` : ''}
          <p class="destaque-momento-desc">${esc(desc)}</p>
          <div class="destaque-momento-precos">
            <span class="preco-atual"><small>R$</small> ${brl(p)}</span>
            ${off ? `<span class="preco-antigo">R$ ${brl(po)}</span>` : ''}
          </div>
          <div class="destaque-momento-botoes">
            <a class="btn-pedir-zap" href="${link(it)}" target="_blank" rel="noopener">
              ${ZAP_ICON} Pedir no WhatsApp
            </a>
            <button type="button" class="btn-pedir-add" onclick="adicionarAoPedido(${itemIndex}, event)">
              🛒 Adicionar ao pedido
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================
 * ANIMAÇÃO E-COMMERCE: PRODUTO VOANDO ATÉ O CARRINHO
 * ========================================================== */

function animarProdutoAteCarrinho(imgOriginal, it, btnClicked, onComplete) {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof document.createElement !== 'function') {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // 1. Determina posição e medidas de partida
  const startRect = imgOriginal ? imgOriginal.getBoundingClientRect() : (btnClicked ? btnClicked.getBoundingClientRect() : null);
  if (!startRect || startRect.width === 0 || startRect.height === 0) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Efeito tátil de saída na imagem do card
  if (imgOriginal) {
    imgOriginal.classList.add('img-produto-decolando');
    setTimeout(() => {
      imgOriginal.classList.remove('img-produto-decolando');
    }, 450);
  }

  // 2. Extrai a imagem real utilizada pelo produto
  let imgSrc = '';
  if (imgOriginal) {
    imgSrc = imgOriginal.currentSrc || imgOriginal.src || '';
  }
  if (!imgSrc && it) {
    imgSrc = it.img || (it.j ? CONFIG.fotosBaseUrl + it.j : '');
  }

  // 3. Cria a cópia temporária com proporções reais
  const flyEl = document.createElement('div');
  flyEl.className = 'produto-voando-clone';
  flyEl.setAttribute('aria-hidden', 'true');

  const startW = Math.round(startRect.width);
  const startH = Math.round(startRect.height);
  const startX = Math.round(startRect.left);
  const startY = Math.round(startRect.top);

  flyEl.style.width = `${startW}px`;
  flyEl.style.height = `${startH}px`;
  flyEl.style.left = `${startX}px`;
  flyEl.style.top = `${startY}px`;

  if (imgSrc) {
    const flyImg = document.createElement('img');
    flyImg.src = imgSrc;
    flyImg.alt = (it && it.n) || 'Produto Lolla';
    flyEl.appendChild(flyImg);
  } else {
    flyEl.innerHTML = '<span style="font-size:36px">🍨</span>';
  }

  document.body.appendChild(flyEl);

  // 4. Determina as coordenadas dinâmicas do carrinho (flutuante ou fixo no topo)
  const btnFlut = document.querySelector('#btn-meu-pedido-flutuante');
  const flutVisivel = btnFlut && btnFlut.classList.contains('visivel');
  const cartBtn = flutVisivel
    ? btnFlut
    : (document.querySelector('.btn-meu-pedido-topo') || document.querySelector('#hero-nav-zap'));
  const badgeEl = flutVisivel
    ? document.querySelector('#badge-carrinho-flutuante-qtd')
    : document.querySelector('#badge-carrinho-qtd');
  const targetEl = (cartBtn && cartBtn.querySelector('.icone-carrinho')) || badgeEl || cartBtn;

  let targetX, targetY;
  if (targetEl) {
    const tRect = targetEl.getBoundingClientRect();
    if (tRect.bottom > 0 && tRect.top < window.innerHeight) {
      targetX = tRect.left + tRect.width / 2;
      targetY = tRect.top + tRect.height / 2;
    } else {
      // Quando o topo está acima do scroll atual
      targetX = tRect.left >= 0 && tRect.left <= window.innerWidth
        ? (tRect.left + tRect.width / 2)
        : (window.innerWidth - 55);
      targetY = Math.max(16, tRect.top + tRect.height / 2);
    }
  } else {
    targetX = window.innerWidth - 55;
    targetY = 24;
  }

  const startCenterX = startX + startW / 2;
  const startCenterY = startY + startH / 2;
  const dx = targetX - startCenterX;
  const dy = targetY - startCenterY;

  // Curva parabólica (Bézier quadrática) com elevação no ar
  const p1x = dx * 0.28;
  const arcLift = Math.max(75, Math.min(190, Math.abs(dx) * 0.22));
  const p1y = Math.min(0, dy) - arcLift;

  // 5. Gera 24 keyframes fluidos acelerados pela GPU
  const keyframes = [];
  const totalSteps = 24;

  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const u2t = 2 * u * t;

    const curX = uu * 0 + u2t * p1x + tt * dx;
    const curY = uu * 0 + u2t * p1y + tt * dy;

    // Escala: leve impulso no início e redução gradual até sumir suavemente
    let curScale;
    if (t <= 0.14) {
      curScale = 1.0 + 0.06 * (t / 0.14);
    } else {
      curScale = 1.06 - 0.98 * Math.pow((t - 0.14) / 0.86, 1.35);
    }

    // Rotação sutil durante o voo
    const curRotate = Math.sin(t * Math.PI) * 14;

    // Opacidade: 100% até 82% do percurso, depois fade-out suave ao entrar no carrinho
    const curOpacity = t < 0.82 ? 1 : Math.max(0, 1 - (t - 0.82) / 0.18);

    keyframes.push({
      transform: `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) scale(${curScale.toFixed(3)}) rotate(${curRotate.toFixed(2)}deg)`,
      opacity: curOpacity
    });
  }

  const durationMs = 720;
  let finalizado = false;

  const finalizar = () => {
    if (finalizado) return;
    finalizado = true;
    try { flyEl.remove(); } catch (e) {}
    if (typeof onComplete === 'function') onComplete();
  };

  if (typeof flyEl.animate === 'function') {
    const anim = flyEl.animate(keyframes, {
      duration: durationMs,
      easing: 'cubic-bezier(0.22, 0.9, 0.35, 1)',
      fill: 'forwards'
    });
    anim.onfinish = finalizar;
    anim.oncancel = finalizar;
  }

  setTimeout(finalizar, durationMs + 100);
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

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', atualizarVisibilidadeCarrinhoFlutuante, { passive: true });
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
  if (!corpo) return;

  atualizarBadgeCarrinho();

  const totalVal = valorTotalCarrinho();
  const totalQtd = totalItensCarrinho();

  if (totalEl) totalEl.textContent = `R$ ${brl(totalVal)}`;
  if (resumoQtdEl) resumoQtdEl.textContent = totalQtd === 1 ? '1 item' : `${totalQtd} itens`;

  if (!carrinho || carrinho.length === 0) {
    if (btnZap) {
      btnZap.disabled = true;
      btnZap.style.opacity = '0.5';
      btnZap.style.pointerEvents = 'none';
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
    btnZap.disabled = false;
    btnZap.style.opacity = '1';
    btnZap.style.pointerEvents = 'auto';
  }

  corpo.innerHTML = carrinho.map((item, idx) => {
    const subtotal = (parseFloat(item.preco) || 0) * (parseInt(item.qtd, 10) || 1);
    const imgTag = item.img
      ? `<img src="${esc(item.img)}" alt="${esc(item.nome)}">`
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
        <div class="carrinho-item-foto">
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

function adicionarAoPedido(itemIndex, ev) {
  const it = D && D.itens && D.itens[itemIndex];
  if (!it) return;

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
      qtd: 1
    });
  }

  salvarCarrinho();

  const badgeEl = $('#badge-carrinho-qtd');
  const cartBtn = document.querySelector('.btn-meu-pedido-topo') || document.querySelector('#hero-nav-zap');

  const onChegadaNoCarrinho = () => {
    atualizarBadgeCarrinho();

    const badgeEl = $('#badge-carrinho-qtd');
    const badgeFlut = $('#badge-carrinho-flutuante-qtd');
    const cartBtn = document.querySelector('.btn-meu-pedido-topo') || document.querySelector('#hero-nav-zap');
    const btnFlut = document.querySelector('#btn-meu-pedido-flutuante');

    [badgeEl, badgeFlut].forEach(el => {
      if (el) {
        el.classList.remove('badge-pop');
        void el.offsetWidth;
        el.classList.add('badge-pop');
      }
    });

    [cartBtn, btnFlut].forEach(el => {
      if (el) {
        el.classList.remove('carrinho-pulse');
        void el.offsetWidth;
        el.classList.add('carrinho-pulse');
      }
    });

    toast(`🛒 ${title} adicionado ao pedido!`);

    const drawer = $('#drawer-carrinho');
    if (drawer && drawer.classList.contains('aberto')) {
      renderCarrinho();
    }
  };

  animarProdutoAteCarrinho(imgOriginal, it, btn, onChegadaNoCarrinho);
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
    if (catAlvo !== 'Todas' && (catAlvo.includes(nomeBtn) || nomeBtn.includes(catAlvo))) {
      btn.classList.add('ativo');
    } else {
      btn.classList.remove('ativo');
    }
  });
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

    html += `<section class="bloco-categoria">
               <div class="secao">
                 <div class="secao-titulo-wrap">
                   <h2>${esc(c)}</h2>
                   ${RAIOS_DOODLE}
                 </div>
                 <span class="qtd">${grupoItens.length}</span>
                 <div class="secao-admin-bar">
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
               <div class="grade ${oculta ? 'grade-oculta' : ''}">${grupoItens.map(({ it, idx }) => card(it, i++, idx)).join('')}${cardAddHtml}</div>
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
 * UPLOAD HELPER GENÉRICO
 * ========================================================== */

async function uploadImagemArquivo(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = async e => {
      const dataUrl = e.target.result;
      if (isAdmin && adminToken) {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ dataUrl, filename: file.name })
          });
          if (res.ok) {
            const json = await res.json();
            if (json.url) {
              toast('📸 Foto enviada com sucesso!');
              resolve(json.url);
              return;
            }
          }
        } catch (err) {}
      }
      resolve(dataUrl);
    };
    reader.readAsDataURL(file);
  });
}

/* ==========================================================
 * OPERAÇÕES DE PRODUTOS (ADMIN)
 * ========================================================== */

async function salvarCardapio(notificar = true) {
  if (!D) return;
  const savedScrollY = window.scrollY;
  D.config = { nome: CONFIG.nome, whatsapp: CONFIG.whatsapp };

  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(D));
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(CONFIG));
  } catch (e) {}

  if (isAdmin && adminToken) {
    try {
      const res = await fetch('/api/cardapio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(D)
      });
      if (res.ok) {
        if (notificar) toast('✅ Alterações salvas com sucesso!');
      } else {
        const errJson = await res.json();
        console.error('Falha ao salvar no servidor:', errJson);
      }
    } catch (err) {
      console.warn('Servidor indisponível:', err);
    }
  }

  montaAbas();
  montaChips();
  render();
  window.scrollTo(0, savedScrollY);
  salvarEstadoNavegacao(savedScrollY);
}

function descobrirGrupoDaCategoria(nomeCat) {
  return getGrupoDaCategoria(nomeCat);
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
  } else {
    $('#prod-foto-preview').innerHTML = '<span>Sem foto</span>';
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
  $('#prod-foto-url').value = it.img || '';
  $('#prod-foto-arquivo').value = '';

  const previewEl = $('#prod-foto-preview');
  previewEl.innerHTML = resolveImageTag(it, 0);

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

  const itemObj = {
    n: nome,
    d: desc,
    c: categoria,
    g: grupoSel,
    p: preco,
    po: precoAntigo
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
  await salvarCardapio(false);
}

window.alternarOcultarProduto = async function (index) {
  if (!isAdmin) return;
  const it = D.itens[index];
  if (!it) return;
  it.oculto = !it.oculto;
  toast(it.oculto ? `🙈 "${it.n}" ocultado para clientes (continua salvo).` : `👁️ "${it.n}" visível novamente para os clientes!`);
  await salvarCardapio(false);
};

window.removerProduto = async function (index) {
  if (!isAdmin) return;
  const it = D.itens[index];
  if (!it) return;

  if (confirm(`Deseja realmente remover o produto "${it.n}" do seu cardápio?`)) {
    D.itens.splice(index, 1);
    toast(`Produto removido.`);
    await salvarCardapio(false);
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
  $('#modal-config').classList.add('aberto');
};

window.fecharModalConfig = function () {
  $('#modal-config').classList.remove('aberto');
};

window.salvarConfigLoja = async function (e) {
  e.preventDefault();
  CONFIG.nome = $('#cfg-nome').value.trim() || 'Sorveteria Lolla';
  CONFIG.whatsapp = $('#cfg-zap').value.replace(/\D/g, '') || '5544999432158';

  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(CONFIG));
  localStorage.setItem('lolla_store_config_v2', JSON.stringify(CONFIG));
  if (D) {
    D.config = { nome: CONFIG.nome, whatsapp: CONFIG.whatsapp };
  }
  fecharModalConfig();
  await salvarCardapio(false);
  toast('⚙️ Dados da loja e WhatsApp salvos permanentemente!');
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

  let scrollTimer;
  window.addEventListener('scroll', () => {
    if (isRestoringScroll) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      salvarEstadoNavegacao(window.scrollY);
    }, 80);
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
    if (url) $('#prod-foto-preview').innerHTML = `<img src="${url}">`;
  });
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

  // Tenta carregar dados da API
  try {
    const res = await fetch('/api/cardapio');
    if (res.ok) D = await res.json();
  } catch (err) {}

  if (!D) {
    try {
      const local = localStorage.getItem(STORAGE_KEY_DATA);
      if (local) D = JSON.parse(local);
    } catch (e) {}
  }

  if (!D && window.__CARDAPIO_DATA__) {
    D = JSON.parse(JSON.stringify(window.__CARDAPIO_DATA__));
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
