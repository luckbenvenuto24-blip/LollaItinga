const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = process.cwd();
const AUTH_FILE = path.join(ROOT_DIR, 'data/auth.json');
const CARDAPIO_FILE = path.join(ROOT_DIR, 'data/cardapio.json');

// Garante que data/auth.json existe
function getAuthData() {
  if (!fs.existsSync(AUTH_FILE)) {
    const defaultHash = crypto.createHash('sha256').update('lolla123').digest('hex');
    const initial = { passwordHash: defaultHash, defaultChanged: false };
    try {
      fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
      fs.writeFileSync(AUTH_FILE, JSON.stringify(initial, null, 2));
    } catch (e) {}
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  } catch (e) {
    return { passwordHash: crypto.createHash('sha256').update('lolla123').digest('hex') };
  }
}

// Tokens de sessão ativos em memória
const activeTokens = new Set();

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
  '.ico': 'image/x-icon'
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) { // 25MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function getExpectedToken(passwordHash) {
  return crypto.createHmac('sha256', passwordHash).update('lolla-admin-persistent-token').digest('hex');
}

function verifyAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  if (activeTokens.has(token)) return true;
  const auth = getAuthData();
  return token === getExpectedToken(auth.passwordHash);
}

const server = http.createServer(async (req, res) => {
  const [urlPath] = (req.url || '/').split('?');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Login do Administrador
  if (urlPath === '/api/auth/login' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { password } = JSON.parse(raw);
      const hash = crypto.createHash('sha256').update(password || '').digest('hex');
      const auth = getAuthData();

      if (hash === auth.passwordHash) {
        const token = getExpectedToken(auth.passwordHash);
        activeTokens.add(token);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          token,
          defaultChanged: auth.defaultChanged,
          message: 'Autenticado com sucesso'
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Senha incorreta' }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Requisição inválida' }));
    }
    return;
  }

  // API: Verificar Token
  if (urlPath === '/api/auth/verify' && req.method === 'GET') {
    const isAuth = verifyAuth(req);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ authenticated: isAuth }));
    return;
  }

  // API: Alterar Senha
  if (urlPath === '/api/auth/change-password' && req.method === 'POST') {
    if (!verifyAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Acesso negado' }));
      return;
    }

    try {
      const raw = await readBody(req);
      const { currentPassword, newPassword } = JSON.parse(raw);

      if (!newPassword || newPassword.length < 6) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'A nova senha deve ter no mínimo 6 caracteres' }));
        return;
      }

      const auth = getAuthData();
      const currentHash = crypto.createHash('sha256').update(currentPassword || '').digest('hex');

      if (currentHash !== auth.passwordHash) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Senha atual incorreta' }));
        return;
      }

      const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
      auth.passwordHash = newHash;
      auth.defaultChanged = true;
      try {
        fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2), 'utf8');
      } catch (e) {}

      activeTokens.clear();
      const newToken = getExpectedToken(newHash);
      activeTokens.add(newToken);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, token: newToken, message: 'Senha alterada com sucesso' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

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
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Erro ao ler data/cardapio.json' }));
    }
    return;
  }

  // API: Salvar cardápio
  if (urlPath === '/api/cardapio' && req.method === 'POST') {
    if (!verifyAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Acesso negado' }));
      return;
    }

    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.itens)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Estrutura de dados inválida' }));
        return;
      }

      fs.writeFileSync(CARDAPIO_FILE, JSON.stringify(data, null, 2), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, totalItens: data.itens.length }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Rota especial /admin e /gerenciar
  if (urlPath === '/admin' || urlPath === '/gerenciar') {
    let indexPath = path.join(ROOT_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) indexPath = path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  // Servir arquivos estáticos regulares
  let safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  let filePath = path.join(ROOT_DIR, safePath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, safePath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Se não encontrou o arquivo e não possui extensão, tenta index.html
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
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n🍦 Cardápio Sorveteria Lolla rodando com sucesso!`);
    console.log(`➡️  Acesso Clientes: http://localhost:${PORT}`);
    console.log(`🔒 Acesso Administrador (Dono): http://localhost:${PORT}/admin\n`);
  });
}

module.exports = server;
