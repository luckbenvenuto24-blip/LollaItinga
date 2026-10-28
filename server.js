const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const AUTH_FILE = path.join(__dirname, 'data/auth.json');
const CARDAPIO_FILE = path.join(__dirname, 'data/cardapio.json');

// Garante que data/auth.json existe
function getAuthData() {
  if (!fs.existsSync(AUTH_FILE)) {
    const defaultHash = crypto.createHash('sha256').update('lolla123').digest('hex');
    const initial = { passwordHash: defaultHash, defaultChanged: false };
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
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
  const [urlPath] = req.url.split('?');

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
      const auth = getAuthData();
      const hash = crypto.createHash('sha256').update(password || '').digest('hex');

      if (hash === auth.passwordHash) {
        const token = getExpectedToken(auth.passwordHash);
        activeTokens.add(token);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, token, defaultChanged: auth.defaultChanged }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Senha de administrador incorreta' }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Dados inválidos' }));
    }
    return;
  }

  // API: Verificar se token de sessão continua válido
  if (urlPath === '/api/auth/verify' && req.method === 'GET') {
    const isAuth = verifyAuth(req);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ authenticated: isAuth }));
    return;
  }

  // API: Logout
  if (urlPath === '/api/auth/logout' && req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) activeTokens.delete(token);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // API: Alterar senha do Administrador
  if (urlPath === '/api/auth/change-password' && req.method === 'POST') {
    if (!verifyAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Acesso não autorizado' }));
      return;
    }
    try {
      const raw = await readBody(req);
      const { newPassword } = JSON.parse(raw);
      if (!newPassword || newPassword.length < 4) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'A nova senha deve ter no mínimo 4 caracteres' }));
        return;
      }
      const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
      const newToken = getExpectedToken(newHash);
      activeTokens.add(newToken);
      fs.writeFileSync(AUTH_FILE, JSON.stringify({ passwordHash: newHash, defaultChanged: true }, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, token: newToken, message: 'Senha alterada com sucesso!' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Obter cardápio (Público, para os clientes verem os produtos)
  if (urlPath === '/api/cardapio' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(CARDAPIO_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Erro ao ler data/cardapio.json' }));
    }
    return;
  }

  // API: Salvar cardápio (PROTEGIDO: Somente com token de administrador)
  if (urlPath === '/api/cardapio' && req.method === 'POST') {
    if (!verifyAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Acesso negado. Apenas o administrador pode alterar o cardápio.' }));
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

  // API: Upload de imagem (PROTEGIDO: Somente com token de administrador)
  if (urlPath === '/api/upload' && req.method === 'POST') {
    if (!verifyAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Acesso negado. Apenas o administrador pode fazer upload.' }));
      return;
    }

    try {
      const raw = await readBody(req);
      const { dataUrl, filename } = JSON.parse(raw);

      if (!dataUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Imagem não informada' }));
        return;
      }

      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!match) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Formato base64 inválido' }));
        return;
      }

      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      const outDir = path.join(__dirname, 'assets/fotos');
      fs.mkdirSync(outDir, { recursive: true });

      const safeName = (filename || 'foto')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 30);
      const outFilename = `${Date.now()}_${safeName}.${ext}`;
      const outPath = path.join(outDir, outFilename);

      fs.writeFileSync(outPath, buffer);

      const publicUrl = `assets/fotos/${outFilename}`;
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, url: publicUrl, filename: outFilename }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Rota especial /admin e /gerenciar: entrega index.html para o dono poder logar
  if (urlPath === '/admin' || urlPath === '/gerenciar') {
    const indexPath = path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  // Servir arquivos estáticos regulares
  let safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Não Encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n🍦 Cardápio Sorveteria Lolla rodando com sucesso!`);
  console.log(`➡️  Acesso Clientes: http://localhost:${PORT}`);
  console.log(`🔒 Acesso Administrador (Dono): http://localhost:${PORT}/admin\n`);
});
