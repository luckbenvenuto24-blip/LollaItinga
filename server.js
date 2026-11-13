const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = process.cwd();

// Arquivos de dados
const AUTH_FILE = path.join(ROOT_DIR, 'data/auth.json');
const CARDAPIO_FILE = path.join(ROOT_DIR, 'data/cardapio.json');
const ORDERS_FILE = path.join(ROOT_DIR, 'data/orders.json');
const SETTINGS_FILE = path.join(ROOT_DIR, 'data/settings.json');
const BAIRROS_FILE = path.join(ROOT_DIR, 'data/bairros.json');
const DRIVERS_FILE = path.join(ROOT_DIR, 'data/drivers.json');
const CUSTOMERS_FILE = path.join(ROOT_DIR, 'data/customers.json');
const CALLS_FILE = path.join(ROOT_DIR, 'data/delivery_calls.json');
const PUSH_SUBS_FILE = path.join(ROOT_DIR, 'data/push_subscriptions.json');

// Supabase oficial da Sorveteria Lolla (Projeto: lolla / bpxqanowjvlzifxkyypj)
const SUPABASE_CONFIG = {
  url: 'https://bpxqanowjvlzifxkyypj.supabase.co',
  anonKey: 'sb_publishable_sDqZJ29prJ2mjQ6MLdrpPA_z8lVbmPQ',
  legacyAnon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHFhbm93anZsemlmeGt5eXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNjcxNDMsImV4cCI6MjA5NTc0MzE0M30.9wEYk9SZGXHb4fWglNuHyyeKlV3dsd51d40HKFBuHrI'
};

// Funções utilitárias de leitura e escrita seguras
function readJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Erro ao ler ${filePath}:`, err.message);
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Erro ao salvar ${filePath}:`, err.message);
    return false;
  }
}

// Sincronização assíncrona em background com o Supabase
async function syncToSupabase(recordId, payload) {
  try {
    const authKey = SUPABASE_CONFIG.legacyAnon || SUPABASE_CONFIG.anonKey;
    fetch(`${SUPABASE_CONFIG.url}/rest/v1/lolla_cardapio_online`, {
      method: 'POST',
      headers: {
        'apikey': authKey,
        'Authorization': `Bearer ${authKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: recordId,
        data: payload,
        updated_at: new Date().toISOString()
      })
    }).catch(() => {});
  } catch (e) {}
}

// Envio de Notificações Push para Dispositivos Registrados
function enviarNotificacaoPush(titulo, mensagem, roleFiltro = null, url = '/entregador') {
  try {
    const subs = readJson(PUSH_SUBS_FILE, []);
    const destinatarios = subs.filter(s => !roleFiltro || s.role === roleFiltro);
    if (!destinatarios.length) return;

    destinatarios.forEach(sub => {
      if (sub.endpoint && sub.endpoint.startsWith('http')) {
        fetch(sub.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titulo,
            body: mensagem,
            url
          })
        }).catch(() => {});
      }
    });
  } catch (e) {}
}

// Inicialização das credenciais de Dono / Admin
function getAuthData() {
  const defaultHash = crypto.createHash('sha256').update('lolla123').digest('hex');
  const initial = {
    passwordHash: defaultHash,
    ownerPasswordHash: defaultHash,
    defaultChanged: false
  };
  const data = readJson(AUTH_FILE, initial);
  if (!data.ownerPasswordHash) {
    data.ownerPasswordHash = data.passwordHash || defaultHash;
    writeJson(AUTH_FILE, data);
  }
  return data;
}

// Barramento de eventos em tempo real em memória
const eventBus = {
  events: [],
  maxEvents: 300,
  listeners: new Set(),
  emit(type, data, targetRole = null, targetUserId = null) {
    const event = {
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      type,
      data,
      targetRole,
      targetUserId,
      timestamp: Date.now(),
      iso: new Date().toISOString()
    };
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    // Notifica listeners de long-polling / SSE
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {}
    }
    return event;
  }
};

// Tokens e Criptografia
const SECRET_KEY = 'lolla-secret-sorveteria-salt-key-2026';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SECRET_KEY).digest('hex');
}

function createToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) {
    // Compatibilidade com token legado do admin
    const auth = getAuthData();
    const legacyAdminToken = crypto.createHmac('sha256', auth.passwordHash).update('lolla-admin-persistent-token').digest('hex');
    if (token === legacyAdminToken) {
      return { role: 'admin', userId: 'admin_principal' };
    }
    return null;
  }
  const [body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(body).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function getUserFromReq(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return verifyToken(token);
}

// Helpers de Fuso Horário de Brasília (America/Sao_Paulo)
function getBrasiliaDate() {
  const now = new Date();
  const spString = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const spDate = new Date(spString);
  const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const diaSemana = dias[spDate.getDay()];
  const hh = String(spDate.getHours()).padStart(2, '0');
  const mm = String(spDate.getMinutes()).padStart(2, '0');
  const yyyy = spDate.getFullYear();
  const mes = String(spDate.getMonth() + 1).padStart(2, '0');
  const dia = String(spDate.getDate()).padStart(2, '0');
  return { diaSemana, horaAtual: `${hh}:${mm}`, dataStr: `${yyyy}-${mes}-${dia}`, spDate };
}

function checkStoreOpen(settings) {
  const { diaSemana, horaAtual, dataStr } = getBrasiliaDate();
  
  // 1. Verifica exceções específicas de calendário (feriados, folgas, horários especiais)
  if (Array.isArray(settings.excecoes)) {
    const exc = settings.excecoes.find(e => e.data === dataStr);
    if (exc) {
      if (exc.fechado) {
        return {
          aberto: false,
          motivo: `Fechado excepcionalmente hoje (${exc.motivo || 'Feriado/Recesso'})`,
          proximaAbertura: exc.proximaAbertura || 'Consulte nosso horário regular.'
        };
      }
      if (exc.inicio && exc.fim) {
        const isOpen = horaAtual >= exc.inicio && horaAtual <= exc.fim;
        return {
          aberto: isOpen,
          motivo: isOpen ? 'Horário especial de hoje' : `Horário especial: ${exc.inicio} às ${exc.fim}`,
          horarioHoje: `${exc.inicio} às ${exc.fim}`
        };
      }
    }
  }

  // 2. Verifica horário regular do dia da semana
  const horarioDia = (settings.horarios && settings.horarios[diaSemana]) || { aberto: true, inicio: '13:00', fim: '23:00' };
  if (!horarioDia.aberto) {
    return {
      aberto: false,
      motivo: 'A sorveteria não abre às ' + diaSemana + 's.',
      proximaAbertura: 'Abre no próximo dia útil.'
    };
  }

  const isOpen = horaAtual >= horarioDia.inicio && horaAtual <= horarioDia.fim;
  return {
    aberto: isOpen,
    motivo: isOpen ? 'Sorveteria aberta!' : `Fechada no momento. Atendimento das ${horarioDia.inicio} às ${horarioDia.fim}.`,
    horarioHoje: `${horarioDia.inicio} às ${horarioDia.fim}`
  };
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Criação do Servidor HTTP
const server = http.createServer(async (req, res) => {
  const [urlPath, queryString] = (req.url || '/').split('?');
  const params = new URLSearchParams(queryString || '');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  /* ==========================================================
   * 1. ROTAS DE AUTENTICAÇÃO E PERFIS (RBAC)
   * ========================================================== */

  // Login Administrador (Legado compatível)
  if (urlPath === '/api/auth/login' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { password } = JSON.parse(raw);
      const hash = crypto.createHash('sha256').update(password || '').digest('hex');
      const auth = getAuthData();

      if (hash === auth.passwordHash || hash === auth.ownerPasswordHash) {
        const token = createToken({
          userId: 'admin_principal',
          role: 'admin',
          exp: Date.now() + 30 * 24 * 3600 * 1000
        });
        sendJson(res, 200, {
          success: true,
          token,
          role: 'admin',
          defaultChanged: auth.defaultChanged,
          message: 'Autenticado com sucesso como Administrador'
        });
      } else {
        sendJson(res, 401, { error: 'Senha incorreta' });
      }
    } catch (err) {
      sendJson(res, 400, { error: 'Requisição inválida' });
    }
    return;
  }

  // Login Dono (Painel Operacional)
  if (urlPath === '/api/auth/dono/login' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { password } = JSON.parse(raw);
      const hash = crypto.createHash('sha256').update(password || '').digest('hex');
      const auth = getAuthData();

      if (hash === auth.ownerPasswordHash || hash === auth.passwordHash) {
        const token = createToken({
          userId: 'dono_principal',
          role: 'dono',
          exp: Date.now() + 30 * 24 * 3600 * 1000
        });
        sendJson(res, 200, {
          success: true,
          token,
          role: 'dono',
          message: 'Autenticado com sucesso no Painel do Dono'
        });
      } else {
        sendJson(res, 401, { error: 'Senha do Dono incorreta' });
      }
    } catch (err) {
      sendJson(res, 400, { error: 'Requisição inválida' });
    }
    return;
  }

  // Verificar Token Geral
  if (urlPath === '/api/auth/verify' && req.method === 'GET') {
    const user = getUserFromReq(req);
    sendJson(res, 200, {
      authenticated: Boolean(user),
      user: user || null
    });
    return;
  }

  // Alterar Senha de Admin / Dono
  if (urlPath === '/api/auth/change-password' && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'admin' && user.role !== 'dono')) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    try {
      const raw = await readBody(req);
      const { currentPassword, newPassword, target } = JSON.parse(raw);
      if (!newPassword || newPassword.length < 6) {
        sendJson(res, 400, { error: 'A nova senha deve ter no mínimo 6 caracteres' });
        return;
      }
      const auth = getAuthData();
      const currentHash = crypto.createHash('sha256').update(currentPassword || '').digest('hex');
      if (currentHash !== auth.passwordHash && currentHash !== auth.ownerPasswordHash) {
        sendJson(res, 400, { error: 'Senha atual incorreta' });
        return;
      }

      const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
      if (target === 'dono') {
        auth.ownerPasswordHash = newHash;
      } else {
        auth.passwordHash = newHash;
        auth.ownerPasswordHash = newHash;
      }
      auth.defaultChanged = true;
      writeJson(AUTH_FILE, auth);

      sendJson(res, 200, { success: true, message: 'Senha atualizada com sucesso!' });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // Cadastro de Cliente
  if (urlPath === '/api/auth/cliente/register' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { nome, telefone, email, password, endereco } = JSON.parse(raw);
      if (!nome || !telefone || !password) {
        sendJson(res, 400, { error: 'Nome, telefone e senha são obrigatórios' });
        return;
      }
      const telClean = telefone.replace(/\D/g, '');
      const customers = readJson(CUSTOMERS_FILE, []);
      if (customers.some(c => c.telefone === telClean)) {
        sendJson(res, 400, { error: 'Já existe um cliente cadastrado com este telefone' });
        return;
      }

      const newCustomer = {
        id: 'cli_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        nome: nome.trim(),
        telefone: telClean,
        email: (email || '').trim().toLowerCase(),
        passwordHash: hashPassword(password),
        enderecos: endereco ? [endereco] : [],
        createdAt: new Date().toISOString()
      };
      customers.push(newCustomer);
      writeJson(CUSTOMERS_FILE, customers);
      syncToSupabase('usuarios_clientes', customers);

      const token = createToken({
        userId: newCustomer.id,
        role: 'cliente',
        nome: newCustomer.nome,
        telefone: newCustomer.telefone,
        exp: Date.now() + 60 * 24 * 3600 * 1000
      });

      sendJson(res, 201, {
        success: true,
        token,
        cliente: { id: newCustomer.id, nome: newCustomer.nome, telefone: newCustomer.telefone, enderecos: newCustomer.enderecos },
        message: 'Cadastro de cliente realizado com sucesso!'
      });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Login de Cliente
  if (urlPath === '/api/auth/cliente/login' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { telefone, password } = JSON.parse(raw);
      const telClean = (telefone || '').replace(/\D/g, '');
      const customers = readJson(CUSTOMERS_FILE, []);
      const customer = customers.find(c => c.telefone === telClean);

      if (!customer || customer.passwordHash !== hashPassword(password)) {
        sendJson(res, 401, { error: 'Telefone ou senha incorretos' });
        return;
      }

      const token = createToken({
        userId: customer.id,
        role: 'cliente',
        nome: customer.nome,
        telefone: customer.telefone,
        exp: Date.now() + 60 * 24 * 3600 * 1000
      });

      sendJson(res, 200, {
        success: true,
        token,
        cliente: { id: customer.id, nome: customer.nome, telefone: customer.telefone, enderecos: customer.enderecos || [] }
      });
    } catch (err) {
      sendJson(res, 400, { error: 'Requisição inválida' });
    }
    return;
  }

  // Meus dados (Cliente)
  if (urlPath === '/api/cliente/me' && req.method === 'GET') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'cliente') {
      sendJson(res, 401, { error: 'Não autenticado como cliente' });
      return;
    }
    const customers = readJson(CUSTOMERS_FILE, []);
    const customer = customers.find(c => c.id === user.userId);
    if (!customer) {
      sendJson(res, 404, { error: 'Cliente não encontrado' });
      return;
    }
    sendJson(res, 200, {
      id: customer.id,
      nome: customer.nome,
      telefone: customer.telefone,
      email: customer.email,
      enderecos: customer.enderecos || []
    });
    return;
  }

  // Histórico de pedidos do Cliente
  if (urlPath === '/api/cliente/pedidos' && req.method === 'GET') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'cliente') {
      sendJson(res, 401, { error: 'Não autenticado como cliente' });
      return;
    }
    const orders = readJson(ORDERS_FILE, []);
    const meusPedidos = orders.filter(o => o.cliente_id === user.userId || o.cliente_telefone === user.telefone);
    meusPedidos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    sendJson(res, 200, meusPedidos);
    return;
  }

  // Cadastro de Entregador
  if (urlPath === '/api/auth/entregador/register' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { nome, telefone, cpf, password } = JSON.parse(raw);
      if (!nome || !telefone || !password) {
        sendJson(res, 400, { error: 'Nome, telefone e senha são obrigatórios' });
        return;
      }
      const telClean = telefone.replace(/\D/g, '');
      const cpfClean = (cpf || '').replace(/\D/g, '');
      const drivers = readJson(DRIVERS_FILE, []);
      if (drivers.some(d => d.telefone === telClean)) {
        sendJson(res, 400, { error: 'Já existe um entregador cadastrado com este telefone' });
        return;
      }

      const newDriver = {
        id: 'mot_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        nome: nome.trim(),
        telefone: telClean,
        cpf: cpfClean,
        passwordHash: hashPassword(password),
        status: 'AGUARDANDO_APROVACAO', // AGUARDANDO_APROVACAO, APROVADO, SUSPENSO, RECUSADO
        online: false,
        total_entregas: 0,
        saldo_receber: 0.00,
        historico_pagamentos: [],
        createdAt: new Date().toISOString()
      };
      drivers.push(newDriver);
      writeJson(DRIVERS_FILE, drivers);
      syncToSupabase('entregadores', drivers);

      // Notifica o dono sobre o novo entregador
      eventBus.emit('novo_entregador_cadastro', {
        id: newDriver.id,
        nome: newDriver.nome,
        telefone: newDriver.telefone
      }, 'dono');

      sendJson(res, 201, {
        success: true,
        entregador: {
          id: newDriver.id,
          nome: newDriver.nome,
          telefone: newDriver.telefone,
          status: newDriver.status
        },
        status: 'AGUARDANDO_APROVACAO',
        message: 'Cadastro recebido com sucesso! Aguarde a aprovação do Dono da sorveteria para começar a receber chamadas.'
      });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Login de Entregador
  if (urlPath === '/api/auth/entregador/login' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { telefone, password } = JSON.parse(raw);
      const telClean = (telefone || '').replace(/\D/g, '');
      const drivers = readJson(DRIVERS_FILE, []);
      const driver = drivers.find(d => d.telefone === telClean);

      if (!driver || driver.passwordHash !== hashPassword(password)) {
        sendJson(res, 401, { error: 'Telefone ou senha incorretos' });
        return;
      }

      if (driver.status === 'AGUARDANDO_APROVACAO') {
        sendJson(res, 403, {
          error: 'Seu cadastro ainda está em análise pelo Dono da Sorveteria. Assim que aprovado, seu acesso será liberado!',
          status: 'AGUARDANDO_APROVACAO'
        });
        return;
      }

      if (driver.status === 'SUSPENSO' || driver.status === 'RECUSADO') {
        sendJson(res, 403, {
          error: 'Seu acesso como entregador está temporariamente desativado ou suspenso. Converse com o Dono.',
          status: driver.status
        });
        return;
      }

      const token = createToken({
        userId: driver.id,
        role: 'entregador',
        nome: driver.nome,
        telefone: driver.telefone,
        exp: Date.now() + 30 * 24 * 3600 * 1000
      });

      sendJson(res, 200, {
        success: true,
        token,
        entregador: {
          id: driver.id,
          nome: driver.nome,
          telefone: driver.telefone,
          status: driver.status,
          online: driver.online,
          total_entregas: driver.total_entregas,
          saldo_receber: driver.saldo_receber
        }
      });
    } catch (err) {
      sendJson(res, 400, { error: 'Requisição inválida' });
    }
    return;
  }

  // Dados do Entregador Autenticado
  if (urlPath === '/api/entregador/me' && req.method === 'GET') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'entregador') {
      sendJson(res, 401, { error: 'Não autenticado como entregador' });
      return;
    }
    const drivers = readJson(DRIVERS_FILE, []);
    const driver = drivers.find(d => d.id === user.userId);
    if (!driver) {
      sendJson(res, 404, { error: 'Entregador não encontrado' });
      return;
    }
    sendJson(res, 200, {
      id: driver.id,
      nome: driver.nome,
      telefone: driver.telefone,
      status: driver.status,
      online: driver.online,
      total_entregas: driver.total_entregas,
      saldo_receber: driver.saldo_receber,
      activeDeliveryId: driver.activeDeliveryId || null
    });
    return;
  }

  // Entregador: Alternar Online / Offline
  if (urlPath === '/api/entregador/toggle-online' && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'entregador') {
      sendJson(res, 401, { error: 'Não autenticado como entregador' });
      return;
    }
    const drivers = readJson(DRIVERS_FILE, []);
    const driver = drivers.find(d => d.id === user.userId);
    if (!driver || driver.status !== 'APROVADO') {
      sendJson(res, 403, { error: 'Entregador precisa estar aprovado para ficar online' });
      return;
    }

    try {
      const raw = await readBody(req);
      const { online } = JSON.parse(raw);
      driver.online = Boolean(online);
      writeJson(DRIVERS_FILE, drivers);

      eventBus.emit('entregador_status_online', {
        id: driver.id,
        nome: driver.nome,
        online: driver.online
      }, 'dono');

      sendJson(res, 200, {
        success: true,
        online: driver.online,
        message: driver.online ? 'Você agora está ONLINE e pode receber chamadas de entrega!' : 'Você agora está OFFLINE.'
      });
    } catch (e) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  /* ==========================================================
   * 2. OPERAÇÃO PÚBLICA (HORÁRIOS, BAIRROS E STATUS DA LOJA)
   * ========================================================== */

  if (urlPath === '/api/config/operacao' && req.method === 'GET') {
    const settings = readJson(SETTINGS_FILE, {});
    const bairros = readJson(BAIRROS_FILE, []);
    const statusLoja = checkStoreOpen(settings);

    sendJson(res, 200, {
      lojaAberta: statusLoja.aberto,
      lojaStatusTexto: statusLoja.motivo,
      proximaAbertura: statusLoja.proximaAbertura || null,
      horarioHoje: statusLoja.horarioHoje || null,
      pedidoMinimo: settings.pedido_minimo || 30.00,
      tempoMedioEntrega: settings.tempo_medio_entrega || '40 - 60 min',
      bairros: bairros.filter(b => b.ativo),
      pagamento: {
        pix: settings.pagamento && settings.pagamento.pix ? {
          ativo: settings.pagamento.pix.ativo,
          chave: settings.pagamento.pix.chave,
          tipo: settings.pagamento.pix.tipo,
          titular: settings.pagamento.pix.titular,
          instituicao: settings.pagamento.pix.instituicao
        } : null,
        dinheiro: settings.pagamento ? settings.pagamento.dinheiro : { ativo: true },
        cartao_entrega: settings.pagamento ? settings.pagamento.cartao_entrega : { ativo: false }
      }
    });
    return;
  }

  /* ==========================================================
   * 3. CHECKOUT E CRIAÇÃO DE PEDIDOS (CLIENTE)
   * ========================================================== */

  if (urlPath === '/api/pedidos' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw);
      const settings = readJson(SETTINGS_FILE, {});
      const statusLoja = checkStoreOpen(settings);

      // Validação de horário
      if (!statusLoja.aberto && !data.agendado) {
        sendJson(res, 400, {
          error: `A Sorveteria Lolla está fechada no momento (${statusLoja.motivo}). Não é possível realizar pedidos para entrega imediata agora.`
        });
        return;
      }

      // Validação de contato
      const clienteNome = (data.cliente_nome || '').trim();
      const clienteTel = (data.cliente_telefone || '').replace(/\D/g, '');
      if (!clienteNome || clienteTel.length < 8) {
        sendJson(res, 400, { error: 'Nome completo e telefone válido são obrigatórios' });
        return;
      }

      // Validação de endereço
      const end = data.endereco || {};
      if (!end.bairro || !end.rua || !end.numero) {
        sendJson(res, 400, { error: 'Endereço completo (Rua, Número e Bairro) é obrigatório' });
        return;
      }

      // Validação do Bairro e Taxa
      const bairros = readJson(BAIRROS_FILE, []);
      const bairroObj = bairros.find(b => b.nome.toLowerCase() === end.bairro.toLowerCase() && b.ativo);
      if (!bairroObj) {
        sendJson(res, 400, {
          error: `No momento não realizamos entregas no bairro "${end.bairro}". Escolha outro endereço ou retire no local.`
        });
        return;
      }

      const taxaEntrega = Number(bairroObj.taxa_cliente) || 0;
      const valorRepasseEntregador = Number(bairroObj.valor_entregador) || taxaEntrega;

      // Validação e cálculo seguro dos itens no servidor
      const itens = Array.isArray(data.itens) ? data.itens : [];
      if (!itens.length) {
        sendJson(res, 400, { error: 'O carrinho está vazio' });
        return;
      }

      // Validação de Disponibilidade dos Itens (Regra 5 - Disponível, Temporariamente Indisponível, Esgotado)
      const cardapioData = readJson(CARDAPIO_FILE, { itens: [] });
      const itensCatalogo = Array.isArray(cardapioData.itens) ? cardapioData.itens : [];
      for (const item of itens) {
        const nomeItem = (item.n || item.nome || '').trim();
        const prodCatalogo = itensCatalogo.find(p => (p.n || p.nome || '').trim().toLowerCase() === nomeItem.toLowerCase() || (item.id && p.id === item.id));
        if (prodCatalogo) {
          const disp = prodCatalogo.disponibilidade || (prodCatalogo.esgotado ? 'esgotado' : (prodCatalogo.oculto ? 'esgotado' : 'disponivel'));
          if (disp === 'esgotado') {
            sendJson(res, 400, {
              error: `O produto "${nomeItem}" está ESGOTADO no momento. Remova-o do carrinho para prosseguir com o pedido.`
            });
            return;
          } else if (disp === 'temporariamente_indisponivel') {
            sendJson(res, 400, {
              error: `O produto "${nomeItem}" está TEMPORARIAMENTE INDISPONÍVEL. Remova-o do carrinho para prosseguir com o pedido.`
            });
            return;
          }
        }
      }

      let subtotal = 0;
      const itensValidados = itens.map(item => {
        const qtd = Math.max(1, parseInt(item.qtd || 1, 10));
        const precoUnit = Number(item.preco) || 0;
        const sub = qtd * precoUnit;
        subtotal += sub;
        return {
          id: item.id || null,
          nome: item.n || item.nome || 'Produto',
          preco: precoUnit,
          qtd,
          subtotal: sub,
          opcoes: item.opcoes || null,
          observacao: item.obs || item.observacao || ''
        };
      });

      // Validação do Pedido Mínimo
      const pedidoMinimo = Number(settings.pedido_minimo) || 30.00;
      if (subtotal < pedidoMinimo) {
        const falta = pedidoMinimo - subtotal;
        sendJson(res, 400, {
          error: `O pedido mínimo para entrega é de R$ ${pedidoMinimo.toFixed(2)}. Faltam R$ ${falta.toFixed(2)} em produtos.`
        });
        return;
      }

      const desconto = Number(data.desconto) || 0;
      const total = Number((subtotal + taxaEntrega - desconto).toFixed(2));

      // Validação do Pagamento
      const formaPag = data.forma_pagamento || 'pix';
      if (formaPag === 'cartao_entrega' && !settings.pagamento?.cartao_entrega?.ativo) {
        sendJson(res, 400, { error: 'O pagamento em cartão na maquininha está temporariamente desativado. Escolha PIX ou Dinheiro.' });
        return;
      }

      let trocoPara = null;
      let trocoValor = null;

      if (formaPag === 'dinheiro' && data.precisa_troco) {
        trocoPara = Number(data.troco_para) || 0;
        if (trocoPara < total) {
          sendJson(res, 400, { error: `O valor do troco (R$ ${trocoPara.toFixed(2)}) não pode ser menor que o total (R$ ${total.toFixed(2)})` });
          return;
        }
        trocoValor = Number((trocoPara - total).toFixed(2));
      }

      // Geração de Comanda e Código de Rastreamento Seguro
      const orders = readJson(ORDERS_FILE, []);
      const proximoNumero = orders.length ? Math.max(...orders.map(o => o.numero || 1000)) + 1 : 1001;
      const pedidoId = 'ped_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const codigoRastreio = 'L-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const user = getUserFromReq(req);
      const clienteId = (user && user.role === 'cliente') ? user.userId : (data.cliente_id || null);

      const statusPagamentoInicial = formaPag === 'pix' ? 'AGUARDANDO_CONFIRMACAO' : 'PENDENTE';

      const novoPedido = {
        id: pedidoId,
        numero: proximoNumero,
        codigo_rastreio: codigoRastreio,
        cliente_id: clienteId,
        cliente_nome: clienteNome,
        cliente_telefone: clienteTel,
        endereco: {
          rua: end.rua.trim(),
          numero: end.numero.trim(),
          complemento: (end.complemento || '').trim(),
          bairro: bairroObj.nome,
          referencia: (end.referencia || '').trim(),
          cep: (end.cep || '').trim()
        },
        itens: itensValidados,
        subtotal: Number(subtotal.toFixed(2)),
        taxa_entrega: taxaEntrega,
        valor_repasse_entregador: valorRepasseEntregador,
        desconto,
        total,
        forma_pagamento: formaPag,
        status_pagamento: statusPagamentoInicial,
        pagamento_historico: [
          {
            status: statusPagamentoInicial,
            timestamp: new Date().toISOString(),
            responsavel: 'Sistema',
            observacao: formaPag === 'pix' ? 'Aguardando comprovante/confirmação PIX' : 'Pagamento na entrega'
          }
        ],
        troco_para: trocoPara,
        troco_valor: trocoValor,
        status: 'RECEBIDO', // RECEBIDO, ACEITO, EM_PREPARACAO, AGUARDANDO_ENTREGADOR, ENTREGADOR_A_CAMINHO, SAIU_ENTREGA, ENTREGUE, CANCELADO
        status_historico: [
          {
            status: 'RECEBIDO',
            timestamp: new Date().toISOString(),
            descricao: 'Pedido recebido pelo sistema da Sorveteria Lolla.'
          }
        ],
        historico_entregadores: [],
        entregador_id: null,
        entregador_nome: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      orders.unshift(novoPedido);
      writeJson(ORDERS_FILE, orders);
      syncToSupabase('pedidos', orders);

      // Emite evento sonoro e visual imediato para o Dono
      eventBus.emit('novo_pedido', {
        id: novoPedido.id,
        numero: novoPedido.numero,
        cliente_nome: novoPedido.cliente_nome,
        bairro: novoPedido.endereco.bairro,
        total: novoPedido.total,
        forma_pagamento: novoPedido.forma_pagamento,
        itensCount: novoPedido.itens.length,
        created_at: novoPedido.created_at
      }, 'dono');

      sendJson(res, 201, {
        success: true,
        pedido: novoPedido,
        mensagem: 'Pedido realizado com sucesso!'
      });
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      sendJson(res, 500, { error: 'Erro ao processar pedido: ' + err.message });
    }
    return;
  }

  // Rastreamento Seguro de Pedido (Público via Código direto ou ID + Código)
  if ((urlPath.startsWith('/api/pedidos/rastreio/') || (urlPath.startsWith('/api/pedidos/') && urlPath.endsWith('/rastrear'))) && req.method === 'GET') {
    const orders = readJson(ORDERS_FILE, []);
    let pedido = null;

    if (urlPath.startsWith('/api/pedidos/rastreio/')) {
      const codigoOuId = urlPath.split('/')[4];
      pedido = orders.find(o =>
        (o.codigo_rastreio && o.codigo_rastreio.toUpperCase() === codigoOuId.toUpperCase()) ||
        o.id === codigoOuId ||
        String(o.numero) === codigoOuId
      );
    } else {
      const parts = urlPath.split('/');
      const pedidoId = parts[3];
      const codigo = params.get('codigo') || '';
      pedido = orders.find(o => o.id === pedidoId || String(o.numero) === pedidoId);

      const user = getUserFromReq(req);
      const isOwner = user && (user.role === 'dono' || user.role === 'admin');
      const isOwnerOfOrder = user && user.userId === pedido?.cliente_id;
      const isCodeMatch = codigo && pedido && pedido.codigo_rastreio && codigo.toUpperCase() === pedido.codigo_rastreio.toUpperCase();

      if (!isOwner && !isOwnerOfOrder && !isCodeMatch) {
        sendJson(res, 403, { error: 'Acesso não autorizado para rastrear este pedido.' });
        return;
      }
    }

    if (!pedido) {
      sendJson(res, 404, { error: 'Pedido não encontrado' });
      return;
    }

    sendJson(res, 200, {
      id: pedido.id,
      numero: pedido.numero,
      codigo_rastreio: pedido.codigo_rastreio,
      cliente_nome: pedido.cliente_nome,
      endereco: pedido.endereco,
      itens: pedido.itens,
      subtotal: pedido.subtotal,
      taxa_entrega: pedido.taxa_entrega,
      total: pedido.total,
      forma_pagamento: pedido.forma_pagamento,
      troco_valor: pedido.troco_valor,
      status: pedido.status,
      status_historico: pedido.status_historico,
      motivo_cancelamento: pedido.motivo_cancelamento || null,
      entregador_nome: pedido.entregador_nome || null,
      created_at: pedido.created_at,
      updated_at: pedido.updated_at
    });
    return;
  }

  /* ==========================================================
   * 4. PAINEL DO DONO — DASHBOARD, PEDIDOS E GESTÃO
   * ========================================================== */

  // Middleware simples para validar Dono / Admin
  function requireOwnerAuth() {
    const user = getUserFromReq(req);
    return user && (user.role === 'dono' || user.role === 'admin');
  }

  // Dashboard com KPIs Reais
  if (urlPath === '/api/dono/dashboard' && req.method === 'GET') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }

    const orders = readJson(ORDERS_FILE, []);
    const drivers = readJson(DRIVERS_FILE, []);
    const { dataStr } = getBrasiliaDate();

    // Filtros de período
    const periodo = params.get('periodo') || 'hoje';
    const dataInicioParam = params.get('dataInicio');
    const dataFimParam = params.get('dataFim');

    const agora = new Date();
    let dataInicio = new Date();
    dataInicio.setHours(0, 0, 0, 0);
    let dataFim = new Date();
    dataFim.setHours(23, 59, 59, 999);

    if (periodo === 'ontem') {
      dataInicio.setDate(dataInicio.getDate() - 1);
      dataFim.setDate(dataFim.getDate() - 1);
    } else if (periodo === '7dias') {
      dataInicio.setDate(dataInicio.getDate() - 7);
    } else if (periodo === '30dias') {
      dataInicio.setDate(dataInicio.getDate() - 30);
    } else if (periodo === 'esta_semana') {
      const diaDaSemana = dataInicio.getDay() || 7;
      dataInicio.setDate(dataInicio.getDate() - diaDaSemana + 1);
    } else if (periodo === 'este_mes') {
      dataInicio.setDate(1);
    } else if (periodo === 'mes_anterior') {
      dataInicio.setMonth(dataInicio.getMonth() - 1, 1);
      dataFim = new Date(dataInicio.getFullYear(), dataInicio.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodo === 'personalizado' && dataInicioParam && dataFimParam) {
      dataInicio = new Date(dataInicioParam + 'T00:00:00');
      dataFim = new Date(dataFimParam + 'T23:59:59');
    }

    const pedidosNoPeriodo = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= dataInicio && d <= dataFim;
    });

    const pedidosHoje = orders.filter(o => o.created_at && o.created_at.startsWith(dataStr));
    const emAndamento = orders.filter(o => !['ENTREGUE', 'CANCELADO'].includes(o.status));
    const entreguesNoPeriodo = pedidosNoPeriodo.filter(o => o.status === 'ENTREGUE');
    const canceladosNoPeriodo = pedidosNoPeriodo.filter(o => o.status === 'CANCELADO');
    const concluidosValidos = pedidosNoPeriodo.filter(o => o.status !== 'CANCELADO');

    const faturamentoBruto = concluidosValidos.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const faturamentoConfirmado = entreguesNoPeriodo.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const faturamentoPendente = concluidosValidos.filter(o => o.status !== 'ENTREGUE').reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    const ticketMedio = concluidosValidos.length > 0 ? (faturamentoBruto / concluidosValidos.length) : 0;
    const aguardandoAceitacao = orders.filter(o => o.status === 'RECEBIDO').length;
    const entregadoresOnline = drivers.filter(d => d.online && d.status === 'APROVADO').length;

    sendJson(res, 200, {
      periodoSelecionado: periodo,
      pedidosHoje: pedidosHoje.length,
      pedidosEmAndamento: emAndamento.length,
      pedidosEntreguesPeriodo: entreguesNoPeriodo.length,
      pedidosCanceladosPeriodo: canceladosNoPeriodo.length,
      faturamentoBruto: Number(faturamentoBruto.toFixed(2)),
      faturamentoConfirmado: Number(faturamentoConfirmado.toFixed(2)),
      faturamentoPendente: Number(faturamentoPendente.toFixed(2)),
      ticketMedio: Number(ticketMedio.toFixed(2)),
      aguardandoAceitacao,
      entregadoresOnline,
      totalGeralPedidos: orders.length
    });
    return;
  }

  // Lista de Pedidos para o Dono
  if (urlPath === '/api/dono/pedidos' && req.method === 'GET') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const orders = readJson(ORDERS_FILE, []);
    const statusFilter = params.get('status');
    let filtered = orders;
    if (statusFilter && statusFilter !== 'TODOS') {
      filtered = orders.filter(o => o.status === statusFilter);
    }
    sendJson(res, 200, filtered);
    return;
  }

  // Atualizar Status do Pedido pelo Dono
  if (urlPath.startsWith('/api/dono/pedidos/') && urlPath.endsWith('/status') && req.method === 'PUT') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const pedidoId = urlPath.split('/')[4];
    const orders = readJson(ORDERS_FILE, []);
    const pedido = orders.find(o => o.id === pedidoId);
    if (!pedido) {
      sendJson(res, 404, { error: 'Pedido não encontrado' });
      return;
    }

    try {
      const raw = await readBody(req);
      const { novoStatus, descricao } = JSON.parse(raw);
      const statusPermitidos = [
        'RECEBIDO', 'ACEITO', 'EM_PREPARACAO', 'AGUARDANDO_ENTREGADOR',
        'ENTREGADOR_A_CAMINHO', 'SAIU_ENTREGA', 'ENTREGUE', 'CANCELADO'
      ];
      if (!statusPermitidos.includes(novoStatus)) {
        sendJson(res, 400, { error: 'Status inválido' });
        return;
      }

      pedido.status = novoStatus;
      pedido.updated_at = new Date().toISOString();
      if (!Array.isArray(pedido.status_historico)) pedido.status_historico = [];
      pedido.status_historico.push({
        status: novoStatus,
        timestamp: new Date().toISOString(),
        descricao: descricao || `Status alterado para ${novoStatus} pelo Dono.`
      });

      writeJson(ORDERS_FILE, orders);
      syncToSupabase('pedidos', orders);

      // Emite evento em tempo real para o Cliente e Entregadores
      eventBus.emit('pedido_status_atualizado', {
        id: pedido.id,
        numero: pedido.numero,
        status: pedido.status,
        updated_at: pedido.updated_at,
        descricao: descricao || ''
      });

      sendJson(res, 200, { success: true, pedido });
    } catch (err) {
      sendJson(res, 400, { error: 'Requisição inválida' });
    }
    return;
  }

  // Cancelar Pedido com Motivo pelo Dono
  if (urlPath.startsWith('/api/dono/pedidos/') && urlPath.endsWith('/cancelar') && req.method === 'POST') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const pedidoId = urlPath.split('/')[4];
    const orders = readJson(ORDERS_FILE, []);
    const pedido = orders.find(o => o.id === pedidoId);
    if (!pedido) {
      sendJson(res, 404, { error: 'Pedido não encontrado' });
      return;
    }

    try {
      const raw = await readBody(req);
      const { motivo } = JSON.parse(raw);
      if (!motivo || !motivo.trim()) {
        sendJson(res, 400, { error: 'O motivo do cancelamento é obrigatório' });
        return;
      }

      pedido.status = 'CANCELADO';
      pedido.motivo_cancelamento = motivo.trim();
      pedido.cancelado_por = 'Dono';
      pedido.cancelado_em = new Date().toISOString();
      pedido.updated_at = new Date().toISOString();

      if (!Array.isArray(pedido.status_historico)) pedido.status_historico = [];
      pedido.status_historico.push({
        status: 'CANCELADO',
        timestamp: new Date().toISOString(),
        descricao: `Pedido cancelado pelo Dono. Motivo: ${pedido.motivo_cancelamento}`
      });

      // Se o pedido foi pago via PIX ou estava confirmado, registra necessidade de reembolso
      if (pedido.forma_pagamento === 'pix' && ['CONFIRMADO', 'AGUARDANDO_CONFIRMACAO'].includes(pedido.status_pagamento)) {
        pedido.status_pagamento = 'REEMBOLSO_NECESSARIO';
        if (!Array.isArray(pedido.pagamento_historico)) pedido.pagamento_historico = [];
        pedido.pagamento_historico.push({
          status: 'REEMBOLSO_NECESSARIO',
          timestamp: new Date().toISOString(),
          responsavel: 'Dono',
          observacao: 'Pedido cancelado após pagamento. Reembolso pendente ao cliente.'
        });
      }

      // Se havia chamada aberta de entrega, encerra
      const calls = readJson(CALLS_FILE, []);
      const activeCall = calls.find(c => c.pedido_id === pedido.id && c.status === 'PENDENTE');
      if (activeCall) {
        activeCall.status = 'CANCELADA';
        writeJson(CALLS_FILE, calls);
      }

      writeJson(ORDERS_FILE, orders);
      syncToSupabase('pedidos', orders);

      eventBus.emit('pedido_cancelado', {
        id: pedido.id,
        numero: pedido.numero,
        motivo: pedido.motivo_cancelamento
      });

      sendJson(res, 200, { success: true, pedido });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Chamar Entregador (Disparo de Corrida pelo Dono - Regra 15: Enviada para TODOS os entregadores aprovados, online ou offline)
  if (urlPath.startsWith('/api/dono/pedidos/') && urlPath.endsWith('/chamar-entregador') && req.method === 'POST') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const pedidoId = urlPath.split('/')[4];
    const orders = readJson(ORDERS_FILE, []);
    const pedido = orders.find(o => o.id === pedidoId);
    if (!pedido) {
      sendJson(res, 404, { error: 'Pedido não encontrado' });
      return;
    }

    // Regra 15: Notifica TODOS os entregadores cadastrados e aprovados (independente de online ou offline)
    const drivers = readJson(DRIVERS_FILE, []);
    const entregadoresAprovados = drivers.filter(d => d.status === 'APROVADO');

    if (!entregadoresAprovados.length) {
      sendJson(res, 400, {
        error: 'Nenhum entregador aprovado está cadastrado no sistema. Cadastre e aprove ao menos um entregador.'
      });
      return;
    }

    // Atualiza status do pedido
    pedido.status = 'AGUARDANDO_ENTREGADOR';
    pedido.updated_at = new Date().toISOString();
    if (!Array.isArray(pedido.status_historico)) pedido.status_historico = [];
    pedido.status_historico.push({
      status: 'AGUARDANDO_ENTREGADOR',
      timestamp: new Date().toISOString(),
      descricao: `Chamada de entrega enviada para ${entregadoresAprovados.length} entregador(es) aprovados (online e offline).`
    });
    writeJson(ORDERS_FILE, orders);

    // Registra chamada
    const calls = readJson(CALLS_FILE, []);
    // Cancela chamadas anteriores do mesmo pedido se houver
    calls.forEach(c => {
      if (c.pedido_id === pedido.id && c.status === 'PENDENTE') c.status = 'CANCELADA';
    });

    const novaChamada = {
      id: 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      pedido_id: pedido.id,
      pedido_numero: pedido.numero,
      bairro: pedido.endereco.bairro,
      endereco_completo: `${pedido.endereco.rua}, ${pedido.endereco.numero} - ${pedido.endereco.bairro}`,
      referencia: pedido.endereco.referencia || '',
      valor_remuneracao: pedido.valor_repasse_entregador || pedido.taxa_entrega || 5.00,
      forma_pagamento: pedido.forma_pagamento,
      troco_valor: pedido.troco_valor || null,
      status: 'PENDENTE', // PENDENTE, ACEITA, RECUSADA, CANCELADA, EXPIRADA
      recusado_por: [],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };

    calls.push(novaChamada);
    writeJson(CALLS_FILE, calls);

    // Notifica instantaneamente todos os entregadores aprovados via barramento de eventos
    eventBus.emit('nova_chamada_entrega', novaChamada, 'entregador');

    // Dispara Notificações Web Push para motoboys mesmo com o app em segundo plano
    enviarNotificacaoPush(
      `🍦 Nova Entrega #${pedido.numero}!`,
      `Bairro: ${pedido.endereco.bairro} | Remuneração: R$ ${(novaChamada.valor_remuneracao || 5).toFixed(2)}. Toque para aceitar!`,
      'entregador',
      '/entregador'
    );

    sendJson(res, 200, {
      success: true,
      chamadaId: novaChamada.id,
      entregadoresNotificados: entregadoresAprovados.length,
      message: `Chamada enviada com sucesso para ${entregadoresAprovados.length} entregador(es) cadastrado(s) e aprovado(s)!`
    });
    return;
  }

  // Cancelar Chamada de Entregador
  if (urlPath.startsWith('/api/dono/pedidos/') && urlPath.endsWith('/cancelar-chamada') && req.method === 'POST') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const pedidoId = urlPath.split('/')[4];
    const calls = readJson(CALLS_FILE, []);
    const call = calls.find(c => c.pedido_id === pedidoId && c.status === 'PENDENTE');
    if (call) {
      call.status = 'CANCELADA';
      writeJson(CALLS_FILE, calls);
      eventBus.emit('chamada_encerrada', { id: call.id, motivo: 'Cancelada pelo Dono' }, 'entregador');
    }
    sendJson(res, 200, { success: true, message: 'Chamada de entregador cancelada' });
    return;
  }

  /* ==========================================================
   * 5. GESTÃO DE ENTREGADORES E REMUNERAÇÃO (DONO)
   * ========================================================== */

  // Listar entregadores
  if (urlPath === '/api/dono/entregadores' && req.method === 'GET') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const drivers = readJson(DRIVERS_FILE, []);
    sendJson(res, 200, drivers.map(d => ({
      id: d.id,
      nome: d.nome,
      telefone: d.telefone,
      cpf: d.cpf,
      status: d.status,
      online: d.online,
      total_entregas: d.total_entregas || 0,
      saldo_receber: d.saldo_receber || 0,
      createdAt: d.createdAt
    })));
    return;
  }

  // Alterar Status do Entregador (Aprovar / Recusar / Suspender)
  if (urlPath.startsWith('/api/dono/entregadores/') && urlPath.endsWith('/status') && req.method === 'PUT') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const driverId = urlPath.split('/')[4];
    const drivers = readJson(DRIVERS_FILE, []);
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      sendJson(res, 404, { error: 'Entregador não encontrado' });
      return;
    }

    try {
      const raw = await readBody(req);
      const { status } = JSON.parse(raw);
      const permitidos = ['AGUARDANDO_APROVACAO', 'APROVADO', 'SUSPENSO', 'RECUSADO'];
      if (!permitidos.includes(status)) {
        sendJson(res, 400, { error: 'Status de entregador inválido' });
        return;
      }

      driver.status = status;
      if (status !== 'APROVADO') driver.online = false;
      writeJson(DRIVERS_FILE, drivers);
      syncToSupabase('entregadores', drivers);

      eventBus.emit('entregador_aprovacao_atualizada', {
        id: driver.id,
        status: driver.status
      }, 'entregador', driver.id);

      sendJson(res, 200, {
        success: true,
        driver: { id: driver.id, nome: driver.nome, status: driver.status },
        message: `Status do entregador alterado para ${status}`
      });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Relatório de Remuneração e Entregas
  if (urlPath === '/api/dono/remuneracao' && req.method === 'GET') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const drivers = readJson(DRIVERS_FILE, []);
    const orders = readJson(ORDERS_FILE, []);
    const entregasConcluidas = orders.filter(o => o.status === 'ENTREGUE' && o.entregador_id);

    const relatorio = drivers.map(d => {
      const entregasDoDriver = entregasConcluidas.filter(o => o.entregador_id === d.id);
      const totalGerado = entregasDoDriver.reduce((acc, o) => acc + (Number(o.valor_repasse_entregador) || 0), 0);
      const historicoPag = d.historico_pagamentos || [];
      const totalPago = historicoPag.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
      const saldoPendente = Math.max(0, totalGerado - totalPago);

      return {
        id: d.id,
        nome: d.nome,
        telefone: d.telefone,
        status: d.status,
        online: d.online,
        total_entregas: entregasDoDriver.length,
        totalGerado: Number(totalGerado.toFixed(2)),
        totalPago: Number(totalPago.toFixed(2)),
        saldoPendente: Number(saldoPendente.toFixed(2)),
        historico_pagamentos: historicoPag
      };
    });

    sendJson(res, 200, relatorio);
    return;
  }

  // Marcar Pagamento de Remuneração ao Entregador
  if (urlPath === '/api/dono/remuneracao/pagar' && req.method === 'POST') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    try {
      const raw = await readBody(req);
      const { entregador_id, valor, observacao } = JSON.parse(raw);
      const drivers = readJson(DRIVERS_FILE, []);
      const driver = drivers.find(d => d.id === entregador_id);
      if (!driver) {
        sendJson(res, 404, { error: 'Entregador não encontrado' });
        return;
      }
      const valNum = Number(valor);
      if (isNaN(valNum) || valNum <= 0) {
        sendJson(res, 400, { error: 'Valor de pagamento inválido' });
        return;
      }

      if (!Array.isArray(driver.historico_pagamentos)) driver.historico_pagamentos = [];
      const registro = {
        id: 'pag_' + Date.now(),
        valor: valNum,
        observacao: observacao || 'Pagamento de corridas pelo Dono',
        data: new Date().toISOString(),
        responsavel: 'Dono'
      };
      driver.historico_pagamentos.push(registro);
      driver.saldo_receber = Math.max(0, (driver.saldo_receber || 0) - valNum);
      writeJson(DRIVERS_FILE, drivers);

      sendJson(res, 200, {
        success: true,
        message: `Pagamento de R$ ${valNum.toFixed(2)} registrado para ${driver.nome}!`,
        registro
      });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  /* ==========================================================
   * 6. ROTAS DE ENTREGADOR — CHAMADAS E ETAPAS DA ENTREGA
   * ========================================================== */

  function requireDriverAuth() {
    const user = getUserFromReq(req);
    return user && user.role === 'entregador';
  }

  // Entregador: Listar chamadas disponíveis
  if (urlPath === '/api/entregador/chamadas' && req.method === 'GET') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'entregador') {
      sendJson(res, 401, { error: 'Acesso restrito a entregadores' });
      return;
    }
    const calls = readJson(CALLS_FILE, []);
    const agora = Date.now();
    const chamadasAtivas = calls.filter(c => {
      if (c.status !== 'PENDENTE') return false;
      if (c.expires_at && new Date(c.expires_at).getTime() < agora) return false;
      if (Array.isArray(c.recusado_por) && c.recusado_por.includes(user.userId)) return false;
      return true;
    });
    sendJson(res, 200, chamadasAtivas);
    return;
  }

  // Entregador: Aceitar Chamada (Atribuição Atômica)
  if (urlPath.startsWith('/api/entregador/chamadas/') && urlPath.endsWith('/aceitar') && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'entregador') {
      sendJson(res, 401, { error: 'Acesso restrito a entregadores' });
      return;
    }

    const callId = urlPath.split('/')[4];
    const calls = readJson(CALLS_FILE, []);
    const call = calls.find(c => c.id === callId);

    if (!call) {
      sendJson(res, 404, { error: 'Chamada de entrega não encontrada' });
      return;
    }

    // ATOMICIDADE: Se já foi aceita por outro motoboy, encerra imediatamente
    if (call.status !== 'PENDENTE') {
      sendJson(res, 409, {
        error: 'Esta entrega já foi aceita por outro motoboy ou foi cancelada pelo Dono.',
        status: call.status
      });
      return;
    }

    const drivers = readJson(DRIVERS_FILE, []);
    const driver = drivers.find(d => d.id === user.userId);
    if (!driver || driver.status !== 'APROVADO') {
      sendJson(res, 403, { error: 'Entregador precisa estar aprovado pelo Dono' });
      return;
    }

    // Atribuição atômica
    call.status = 'ACEITA';
    call.entregador_id = driver.id;
    call.entregador_nome = driver.nome;
    call.aceito_em = new Date().toISOString();
    writeJson(CALLS_FILE, calls);

    // Atualiza pedido
    const orders = readJson(ORDERS_FILE, []);
    const pedido = orders.find(o => o.id === call.pedido_id);
    if (pedido) {
      pedido.status = 'ENTREGADOR_A_CAMINHO';
      pedido.entregador_id = driver.id;
      pedido.entregador_nome = driver.nome;
      pedido.updated_at = new Date().toISOString();
      if (!Array.isArray(pedido.status_historico)) pedido.status_historico = [];
      pedido.status_historico.push({
        status: 'ENTREGADOR_A_CAMINHO',
        timestamp: new Date().toISOString(),
        descricao: `Chamada aceita pelo entregador ${driver.nome}. Indo retirar na loja.`
      });
      writeJson(ORDERS_FILE, orders);
      syncToSupabase('pedidos', orders);
    }

    driver.activeDeliveryId = call.pedido_id;
    writeJson(DRIVERS_FILE, drivers);

    // Notifica o Dono, o Cliente e os outros entregadores
    eventBus.emit('chamada_aceita', {
      callId: call.id,
      pedidoId: call.pedido_id,
      entregador_nome: driver.nome,
      entregador_telefone: driver.telefone
    });

    sendJson(res, 200, {
      success: true,
      call,
      pedido,
      message: 'Entrega aceita com sucesso! Dirija-se à sorveteria para retirar os produtos.'
    });
    return;
  }

  // Entregador: Recusar Chamada
  if (urlPath.startsWith('/api/entregador/chamadas/') && urlPath.endsWith('/recusar') && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'entregador') {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    const callId = urlPath.split('/')[4];
    const calls = readJson(CALLS_FILE, []);
    const call = calls.find(c => c.id === callId);
    if (call && call.status === 'PENDENTE') {
      if (!Array.isArray(call.recusado_por)) call.recusado_por = [];
      if (!call.recusado_por.includes(user.userId)) {
        call.recusado_por.push(user.userId);
        writeJson(CALLS_FILE, calls);
      }
    }
    sendJson(res, 200, { success: true, message: 'Chamada recusada' });
    return;
  }

  // Entregador: Atualizar Etapa da Corrida
  if (urlPath.startsWith('/api/entregador/pedidos/') && urlPath.endsWith('/etapa') && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'entregador') {
      sendJson(res, 401, { error: 'Acesso restrito a entregadores' });
      return;
    }
    const pedidoId = urlPath.split('/')[4];
    const orders = readJson(ORDERS_FILE, []);
    const pedido = orders.find(o => o.id === pedidoId);
    if (!pedido || pedido.entregador_id !== user.userId) {
      sendJson(res, 403, { error: 'Este pedido não está atribuído a você' });
      return;
    }

    try {
      const raw = await readBody(req);
      const { etapa } = JSON.parse(raw);
      // Etapas: INDO_BUSCAR, CHEGOU_SORVETERIA, RETIRADO, SAIU_ENTREGA, ENTREGUE
      const etapasPermitidas = ['INDO_BUSCAR', 'CHEGOU_SORVETERIA', 'RETIRADO', 'SAIU_ENTREGA', 'ENTREGUE'];
      if (!etapasPermitidas.includes(etapa)) {
        sendJson(res, 400, { error: 'Etapa de entrega inválida' });
        return;
      }

      let statusFormatado = pedido.status;
      let descricao = '';

      if (etapa === 'INDO_BUSCAR') {
        statusFormatado = 'ENTREGADOR_A_CAMINHO';
        descricao = 'Entregador está a caminho da sorveteria para retirar o pedido.';
      } else if (etapa === 'CHEGOU_SORVETERIA') {
        statusFormatado = 'ENTREGADOR_A_CAMINHO';
        descricao = 'Entregador chegou à sorveteria e aguarda a embalagem.';
      } else if (etapa === 'RETIRADO' || etapa === 'SAIU_ENTREGA') {
        statusFormatado = 'SAIU_ENTREGA';
        descricao = 'Pedido retirado na sorveteria e a caminho do endereço de entrega!';
      } else if (etapa === 'ENTREGUE') {
        statusFormatado = 'ENTREGUE';
        descricao = 'Pedido entregue com sucesso ao cliente!';
      }

      pedido.status = statusFormatado;
      pedido.updated_at = new Date().toISOString();
      if (!Array.isArray(pedido.status_historico)) pedido.status_historico = [];
      pedido.status_historico.push({
        status: statusFormatado,
        etapa_entregador: etapa,
        timestamp: new Date().toISOString(),
        descricao
      });

      // Se concluiu a entrega, credita saldo e desocupa motoboy
      if (etapa === 'ENTREGUE') {
        const drivers = readJson(DRIVERS_FILE, []);
        const driver = drivers.find(d => d.id === user.userId);
        if (driver) {
          driver.total_entregas = (driver.total_entregas || 0) + 1;
          const valorGanho = Number(pedido.valor_repasse_entregador) || Number(pedido.taxa_entrega) || 5.00;
          driver.saldo_receber = Number(((driver.saldo_receber || 0) + valorGanho).toFixed(2));
          driver.activeDeliveryId = null;
          writeJson(DRIVERS_FILE, drivers);
        }
      }

      writeJson(ORDERS_FILE, orders);
      syncToSupabase('pedidos', orders);

      eventBus.emit('etapa_entrega_atualizada', {
        pedidoId: pedido.id,
        numero: pedido.numero,
        etapa,
        status: pedido.status,
        descricao
      });

      sendJson(res, 200, { success: true, pedido, etapa, status: pedido.status });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Entregador: Cancelar Entrega Aceita (Regra Especial 16 - Devolve para a fila e chama outros entregadores)
  if (urlPath.startsWith('/api/entregador/pedidos/') && urlPath.endsWith('/cancelar') && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'entregador') {
      sendJson(res, 401, { error: 'Acesso restrito a entregadores' });
      return;
    }
    const pedidoId = urlPath.split('/')[4];
    const orders = readJson(ORDERS_FILE, []);
    const pedido = orders.find(o => o.id === pedidoId);
    if (!pedido || pedido.entregador_id !== user.userId) {
      sendJson(res, 403, { error: 'Este pedido não está sob sua responsabilidade' });
      return;
    }

    try {
      const raw = await readBody(req);
      const { motivo } = raw ? JSON.parse(raw) : { motivo: 'Imprevisto com o entregador' };

      const drivers = readJson(DRIVERS_FILE, []);
      const driver = drivers.find(d => d.id === user.userId);
      const driverNome = driver ? driver.nome : 'Entregador';

      // 1. Registra no histórico de entregadores
      if (!Array.isArray(pedido.historico_entregadores)) pedido.historico_entregadores = [];
      pedido.historico_entregadores.push({
        entregador_id: user.userId,
        entregador_nome: driverNome,
        aceito_em: pedido.updated_at,
        cancelado_em: new Date().toISOString(),
        motivo: motivo || 'Cancelado pelo entregador'
      });

      // 2. Libera entregador anterior da responsabilidade e retira vínculo
      pedido.status = 'AGUARDANDO_ENTREGADOR';
      pedido.entregador_id = null;
      pedido.entregador_nome = null;
      pedido.updated_at = new Date().toISOString();
      if (!Array.isArray(pedido.status_historico)) pedido.status_historico = [];
      pedido.status_historico.push({
        status: 'AGUARDANDO_ENTREGADOR',
        timestamp: new Date().toISOString(),
        descricao: `O entregador ${driverNome} cancelou o aceite (${motivo || 'Sem motivo informado'}). Pedido retornado para a fila de entregas.`
      });

      if (driver) {
        driver.activeDeliveryId = null;
        writeJson(DRIVERS_FILE, drivers);
      }
      writeJson(ORDERS_FILE, orders);
      syncToSupabase('pedidos', orders);

      // 3. Atualiza chamada anterior e cria NOVA chamada para TODOS os demais entregadores aprovados
      const calls = readJson(CALLS_FILE, []);
      const callAntiga = calls.find(c => c.pedido_id === pedido.id && c.status === 'ACEITA');
      if (callAntiga) {
        callAntiga.status = 'CANCELADA_ENTREGADOR';
        callAntiga.motivo_cancelamento = motivo;
      }

      const novaChamada = {
        id: 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        pedido_id: pedido.id,
        pedido_numero: pedido.numero,
        bairro: pedido.endereco.bairro,
        endereco_completo: `${pedido.endereco.rua}, ${pedido.endereco.numero} - ${pedido.endereco.bairro}`,
        referencia: pedido.endereco.referencia || '',
        valor_remuneracao: pedido.valor_repasse_entregador || pedido.taxa_entrega || 5.00,
        forma_pagamento: pedido.forma_pagamento,
        troco_valor: pedido.troco_valor || null,
        status: 'PENDENTE',
        recusado_por: [user.userId], // Não mostra para quem acabou de cancelar
        tentativa: ((callAntiga && callAntiga.tentativa) || 1) + 1,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      };
      calls.push(novaChamada);
      writeJson(CALLS_FILE, calls);

      // 4. Notifica TODOS os demais entregadores aprovados e notifica o Dono
      eventBus.emit('nova_chamada_entrega', novaChamada, 'entregador');
      eventBus.emit('entregador_cancelou_entrega', {
        pedidoId: pedido.id,
        numero: pedido.numero,
        entregador_id: user.userId,
        entregador_nome: driverNome,
        motivo
      });

      enviarNotificacaoPush(
        `🚨 Entrega #${pedido.numero} redistribuída!`,
        `Corrida para ${pedido.endereco.bairro} disponível novamente (R$ ${(novaChamada.valor_remuneracao || 5).toFixed(2)}).`,
        'entregador',
        '/entregador'
      );

      sendJson(res, 200, {
        success: true,
        message: 'Entrega cancelada e devolvida à fila com sucesso. Nova chamada enviada aos outros entregadores.',
        novaChamadaId: novaChamada.id
      });
    } catch (err) {
      sendJson(res, 400, { error: 'Erro ao cancelar entrega' });
    }
    return;
  }

  // Histórico de Entregas do Entregador
  if (urlPath === '/api/entregador/historico' && req.method === 'GET') {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'entregador') {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    const orders = readJson(ORDERS_FILE, []);
    const minhasEntregas = orders.filter(o => o.entregador_id === user.userId);
    minhasEntregas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    sendJson(res, 200, minhasEntregas);
    return;
  }

  // Dono: Atualizar Situação do Pagamento (PIX confirmado, Recusado, Estornado, Reembolso)
  if (urlPath.startsWith('/api/dono/pedidos/') && urlPath.endsWith('/pagamento') && req.method === 'PUT') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito ao Dono' });
      return;
    }
    const pedidoId = urlPath.split('/')[4];
    const orders = readJson(ORDERS_FILE, []);
    const pedido = orders.find(o => o.id === pedidoId);
    if (!pedido) {
      sendJson(res, 404, { error: 'Pedido não encontrado' });
      return;
    }

    try {
      const raw = await readBody(req);
      const { statusPagamento, observacao } = JSON.parse(raw);
      const statusPermitidos = ['PENDENTE', 'AGUARDANDO_CONFIRMACAO', 'CONFIRMADO', 'RECUSADO', 'ESTORNADO', 'REEMBOLSO_NECESSARIO'];
      if (!statusPermitidos.includes(statusPagamento)) {
        sendJson(res, 400, { error: 'Status de pagamento inválido' });
        return;
      }
      pedido.status_pagamento = statusPagamento;
      pedido.updated_at = new Date().toISOString();
      if (!Array.isArray(pedido.pagamento_historico)) pedido.pagamento_historico = [];
      pedido.pagamento_historico.push({
        status: statusPagamento,
        timestamp: new Date().toISOString(),
        responsavel: 'Dono',
        observacao: observacao || ''
      });
      writeJson(ORDERS_FILE, orders);
      syncToSupabase('pedidos', orders);

      eventBus.emit('pagamento_atualizado', {
        pedidoId: pedido.id,
        numero: pedido.numero,
        statusPagamento
      });

      sendJson(res, 200, { success: true, pedido, statusPagamento });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Web Push: Registrar Inscrição de Dispositivo
  if (urlPath === '/api/push/subscribe' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const subData = JSON.parse(raw);
      if (!subData || !subData.endpoint) {
        sendJson(res, 400, { error: 'Inscrição push inválida' });
        return;
      }

      const user = getUserFromReq(req);
      const subs = readJson(PUSH_SUBS_FILE, []);
      const index = subs.findIndex(s => s.endpoint === subData.endpoint);

      const novoSub = {
        endpoint: subData.endpoint,
        keys: subData.keys || {},
        role: (user && user.role) || subData.role || 'cliente',
        userId: (user && user.userId) || subData.userId || null,
        updated_at: new Date().toISOString()
      };

      if (index >= 0) {
        subs[index] = novoSub;
      } else {
        subs.push(novoSub);
      }

      writeJson(PUSH_SUBS_FILE, subs);
      sendJson(res, 200, { success: true, message: 'Inscrição Web Push registrada com sucesso!' });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // ADM / Dono: Atualizar Item de Produto (Preço, Preço Antigo e Disponibilidade)
  if (urlPath === '/api/admin/produtos/item' && req.method === 'PUT') {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'admin' && user.role !== 'dono')) {
      sendJson(res, 401, { error: 'Acesso restrito ao Administrador ou Dono' });
      return;
    }

    try {
      const raw = await readBody(req);
      const { nome, preco, precoAntigo, disponibilidade } = JSON.parse(raw);

      if (!nome) {
        sendJson(res, 400, { error: 'Nome do produto é obrigatório' });
        return;
      }

      const cardapioData = readJson(CARDAPIO_FILE, { itens: [] });
      const itens = Array.isArray(cardapioData.itens) ? cardapioData.itens : [];
      const prod = itens.find(p => (p.n || p.nome || '').trim().toLowerCase() === nome.trim().toLowerCase());

      if (!prod) {
        sendJson(res, 404, { error: 'Produto não encontrado no cardápio' });
        return;
      }

      if (preco !== undefined) prod.p = Number(preco);
      if (precoAntigo !== undefined) prod.po = Number(precoAntigo);
      if (disponibilidade !== undefined) {
        prod.disponibilidade = disponibilidade; // 'disponivel', 'temporariamente_indisponivel', 'esgotado'
        prod.esgotado = (disponibilidade === 'esgotado');
        prod.oculto = (disponibilidade === 'temporariamente_indisponivel');
      }

      writeJson(CARDAPIO_FILE, cardapioData);
      syncToSupabase('principal', cardapioData);

      eventBus.emit('produto_atualizado', {
        nome: prod.n,
        preco: prod.p,
        disponibilidade: prod.disponibilidade
      });

      sendJson(res, 200, { success: true, produto: prod });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  /* ==========================================================
   * 7. CONFIGURAÇÕES DO DONO (BAIRROS, HORÁRIOS, PAGAMENTOS)
   * ========================================================== */

  // Bairros: Obter todos (Dono)
  if (urlPath === '/api/dono/bairros' && req.method === 'GET') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    const bairros = readJson(BAIRROS_FILE, []);
    sendJson(res, 200, bairros);
    return;
  }

  // Bairros: Adicionar ou Atualizar (Dono)
  if (urlPath === '/api/dono/bairros' && req.method === 'POST') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    try {
      const raw = await readBody(req);
      const { nome, taxa_cliente, valor_entregador, tempo_estimado, observacao, ativo } = JSON.parse(raw);
      if (!nome || typeof taxa_cliente === 'undefined') {
        sendJson(res, 400, { error: 'Nome do bairro e taxa do cliente são obrigatórios' });
        return;
      }
      const bairros = readJson(BAIRROS_FILE, []);
      const index = bairros.findIndex(b => b.nome.toLowerCase() === nome.trim().toLowerCase());

      const itemBairro = {
        id: index >= 0 ? bairros[index].id : ('b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5)),
        nome: nome.trim(),
        taxa_cliente: Number(taxa_cliente),
        valor_entregador: typeof valor_entregador !== 'undefined' ? Number(valor_entregador) : Number(taxa_cliente),
        tempo_estimado: tempo_estimado || '30 - 50 min',
        observacao: observacao || '',
        ativo: typeof ativo === 'boolean' ? ativo : true
      };

      if (index >= 0) {
        bairros[index] = itemBairro;
      } else {
        bairros.push(itemBairro);
      }
      writeJson(BAIRROS_FILE, bairros);
      sendJson(res, 200, { success: true, bairro: itemBairro, message: 'Bairro salvo com sucesso!' });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Bairros: Excluir Bairro
  if (urlPath.startsWith('/api/dono/bairros/') && req.method === 'DELETE') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    const bairroId = urlPath.split('/')[4];
    const bairros = readJson(BAIRROS_FILE, []);
    const filtered = bairros.filter(b => b.id !== bairroId);
    writeJson(BAIRROS_FILE, filtered);
    sendJson(res, 200, { success: true, message: 'Bairro excluído!' });
    return;
  }

  // Horários e Exceções: Obter (Dono)
  if (urlPath === '/api/dono/horarios' && req.method === 'GET') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    const settings = readJson(SETTINGS_FILE, {});
    sendJson(res, 200, {
      horarios: settings.horarios || {},
      excecoes: settings.excecoes || []
    });
    return;
  }

  // Horários e Exceções: Salvar (Dono)
  if (urlPath === '/api/dono/horarios' && req.method === 'PUT') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    try {
      const raw = await readBody(req);
      const { horarios, excecoes } = JSON.parse(raw);
      const settings = readJson(SETTINGS_FILE, {});
      if (horarios) settings.horarios = horarios;
      if (Array.isArray(excecoes)) settings.excecoes = excecoes;
      writeJson(SETTINGS_FILE, settings);
      syncToSupabase('config_operacao', settings);
      sendJson(res, 200, { success: true, message: 'Horários e exceções salvos com sucesso!' });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Pagamentos e PIX: Obter (Dono)
  if (urlPath === '/api/dono/pagamentos' && req.method === 'GET') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    const settings = readJson(SETTINGS_FILE, {});
    sendJson(res, 200, settings.pagamento || {});
    return;
  }

  // Pagamentos e PIX: Salvar (Dono)
  if (urlPath === '/api/dono/pagamentos' && req.method === 'PUT') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    try {
      const raw = await readBody(req);
      const pagamento = JSON.parse(raw);
      const settings = readJson(SETTINGS_FILE, {});
      settings.pagamento = pagamento;
      writeJson(SETTINGS_FILE, settings);
      syncToSupabase('config_operacao', settings);
      sendJson(res, 200, { success: true, message: 'Configurações de pagamento salvas!' });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  // Pedido Mínimo: Atualizar (Dono - Regra 4)
  if (urlPath === '/api/dono/pedido-minimo' && req.method === 'PUT') {
    if (!requireOwnerAuth()) {
      sendJson(res, 401, { error: 'Acesso restrito' });
      return;
    }
    try {
      const raw = await readBody(req);
      const { pedidoMinimo } = JSON.parse(raw);
      const settings = readJson(SETTINGS_FILE, {});
      settings.pedido_minimo = Number(pedidoMinimo) || 0;
      writeJson(SETTINGS_FILE, settings);
      syncToSupabase('config_operacao', settings);
      eventBus.emit('pedido_minimo_atualizado', { pedidoMinimo: settings.pedido_minimo });
      sendJson(res, 200, { success: true, pedidoMinimo: settings.pedido_minimo });
    } catch (err) {
      sendJson(res, 400, { error: 'Dados inválidos' });
    }
    return;
  }

  /* ==========================================================
   * 8. EVENTOS EM TEMPO REAL (LONG-POLLING ROBUSTO)
   * ========================================================== */

  if (urlPath === '/api/events/poll' && req.method === 'GET') {
    const since = parseInt(params.get('since') || '0', 10);
    const role = params.get('role') || 'cliente';
    const userId = params.get('userId') || null;

    // Filtra eventos já existentes desde o timestamp
    const novosEventos = eventBus.events.filter(ev => {
      if (ev.timestamp <= since) return false;
      if (ev.targetRole && ev.targetRole !== role && role !== 'admin') return false;
      if (ev.targetUserId && ev.targetUserId !== userId) return false;
      return true;
    });

    if (novosEventos.length > 0) {
      sendJson(res, 200, { events: novosEventos, timestamp: Date.now() });
      return;
    }

    // Se não há eventos imediatos, aguarda até 15s em long polling
    let responded = false;
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        eventBus.listeners.delete(listener);
        sendJson(res, 200, { events: [], timestamp: Date.now() });
      }
    }, 15000);

    const listener = (event) => {
      if (responded) return;
      if (event.targetRole && event.targetRole !== role && role !== 'admin') return;
      if (event.targetUserId && event.targetUserId !== userId) return;

      responded = true;
      clearTimeout(timeout);
      eventBus.listeners.delete(listener);
      sendJson(res, 200, { events: [event], timestamp: Date.now() });
    };

    eventBus.listeners.add(listener);

    req.on('close', () => {
      responded = true;
      clearTimeout(timeout);
      eventBus.listeners.delete(listener);
    });
    return;
  }

  /* ==========================================================
   * 9. ROTAS LEGADAS (CARDÁPIO E ADMINISTRAÇÃO EXISTENTE)
   * ========================================================== */

  // API: Ler cardápio
  if (urlPath === '/api/cardapio' && req.method === 'GET') {
    try {
      let targetFile = CARDAPIO_FILE;
      if (!fs.existsSync(targetFile)) {
        targetFile = path.join(__dirname, 'data/cardapio.json');
      }
      const data = fs.readFileSync(targetFile, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } catch (err) {
      sendJson(res, 500, { error: 'Erro ao ler data/cardapio.json' });
    }
    return;
  }

  // API: Salvar cardápio (Admin)
  if (urlPath === '/api/cardapio' && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'admin' && user.role !== 'dono')) {
      sendJson(res, 401, { error: 'Acesso negado' });
      return;
    }

    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.itens)) {
        sendJson(res, 400, { error: 'Estrutura de dados inválida' });
        return;
      }

      fs.writeFileSync(CARDAPIO_FILE, JSON.stringify(data, null, 2), 'utf8');
      syncToSupabase('principal', data);

      sendJson(res, 200, { success: true, totalItens: data.itens.length });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // Rotas de Páginas Especiais (SPA)
  const rotasEspeciais = ['/admin', '/gerenciar', '/dono', '/entregador', '/rastrear'];
  if (rotasEspeciais.includes(urlPath)) {
    let indexPath = path.join(ROOT_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) indexPath = path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  /* ==========================================================
   * 10. SERVIR ARQUIVOS ESTÁTICOS
   * ========================================================== */

  let safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  let filePath = path.join(ROOT_DIR, safePath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, safePath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (!path.extname(safePath)) {
        let fallbackIndex = path.join(ROOT_DIR, 'index.html');
        if (!fs.existsSync(fallbackIndex)) fallbackIndex = path.join(__dirname, 'index.html');
        if (fs.existsSync(fallbackIndex)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(fallbackIndex).pipe(res);
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Não Encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': (ext === '.html' || ext === '.json' || ext === '.js' || ext === '.css') ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n🍦 Sistema Completo da Sorveteria Lolla rodando!`);
    console.log(`➡️  Clientes: http://localhost:${PORT}`);
    console.log(`📊 Painel do Dono: http://localhost:${PORT}/dono`);
    console.log(`🛵 Painel do Entregador: http://localhost:${PORT}/entregador`);
    console.log(`🔒 Administrador: http://localhost:${PORT}/admin\n`);
  });
}

module.exports = server;
