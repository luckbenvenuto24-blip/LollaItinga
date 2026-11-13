/**
 * SUÍTE OFICIAL DE TESTES OBRIGATÓRIOS (TESTES 1 A 12)
 * Validação rigorosa dos fluxos dos 4 perfis da Sorveteria Lolla
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runAll12Tests() {
  console.log('\n=====================================================');
  console.log('INICIANDO SUÍTE COMPLETA DE TESTES OBRIGATÓRIOS (1 a 12)');
  console.log('=====================================================\n');

  // SETUP: Login do Dono
  const donoLogin = await request('POST', '/api/auth/dono/login', { password: 'lolla123' });
  assert(donoLogin.status === 200 && donoLogin.data.token, 'Setup: Dono autenticado com sucesso.');
  const tokenDono = donoLogin.data.token;

  // Garante que a loja está aberta e com pedido mínimo padrão de 30
  await request('PUT', '/api/dono/horarios', {
    horarios: {
      segunda: { aberto: true, inicio: '00:00', fim: '23:59' },
      terca: { aberto: true, inicio: '00:00', fim: '23:59' },
      quarta: { aberto: true, inicio: '00:00', fim: '23:59' },
      quinta: { aberto: true, inicio: '00:00', fim: '23:59' },
      sexta: { aberto: true, inicio: '00:00', fim: '23:59' },
      sabado: { aberto: true, inicio: '00:00', fim: '23:59' },
      domingo: { aberto: true, inicio: '00:00', fim: '23:59' }
    },
    excecoes: []
  }, { 'Authorization': `Bearer ${tokenDono}` });

  await request('PUT', '/api/dono/pedido-minimo', { pedidoMinimo: 30.00 }, { 'Authorization': `Bearer ${tokenDono}` });

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 1: Produto (Alteração de preço no ADM refletida para Cliente) ---');
  // --------------------------------------------------------------------------
  const itemTeste = 'Açaí Tradicional - Copo 300ml';
  const novoPreco = 16.50;
  const updateProd = await request('PUT', '/api/admin/produtos/item', {
    nome: itemTeste,
    preco: novoPreco,
    disponibilidade: 'disponivel'
  }, { 'Authorization': `Bearer ${tokenDono}` });
  assert(updateProd.status === 200 && updateProd.data.produto.p === novoPreco, 'Preço alterado no painel administrativo');

  const cardapioCliente = await request('GET', '/api/cardapio');
  assert(cardapioCliente.status === 200, 'Cliente consulta cardápio');
  const prodEncontrado = cardapioCliente.data.itens.find(p => p.n === itemTeste);
  assert(prodEncontrado && prodEncontrado.p === novoPreco, 'Cliente visualiza novo preço de R$ 16.50');

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 2: Disponibilidade (Esgotado bloqueia finalização) ---');
  // --------------------------------------------------------------------------
  await request('PUT', '/api/admin/produtos/item', {
    nome: itemTeste,
    disponibilidade: 'esgotado'
  }, { 'Authorization': `Bearer ${tokenDono}` });

  const checkoutEsgotado = await request('POST', '/api/pedidos', {
    cliente_nome: 'Cliente Teste',
    cliente_telefone: '47999990001',
    endereco: { rua: 'Rua das Flores', numero: '100', bairro: 'Centro' },
    forma_pagamento: 'pix',
    itens: [{ n: itemTeste, preco: 16.50, qtd: 2 }]
  });
  assert(checkoutEsgotado.status === 400 && checkoutEsgotado.data.error.includes('ESGOTADO'), 'Checkout bloqueou produto esgotado');

  // Restaura disponibilidade
  await request('PUT', '/api/admin/produtos/item', {
    nome: itemTeste,
    preco: 15.00,
    disponibilidade: 'disponivel'
  }, { 'Authorization': `Bearer ${tokenDono}` });

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 3: Pedido mínimo (R$ 30,00 e alteração pelo Dono) ---');
  // --------------------------------------------------------------------------
  const checkoutAbaixo = await request('POST', '/api/pedidos', {
    cliente_nome: 'Cliente Teste',
    cliente_telefone: '47999990001',
    endereco: { rua: 'Rua das Flores', numero: '100', bairro: 'Centro' },
    forma_pagamento: 'pix',
    itens: [{ n: itemTeste, preco: 15.00, qtd: 1 }] // R$ 15 < R$ 30
  });
  assert(checkoutAbaixo.status === 400 && checkoutAbaixo.data.error.includes('pedido mínimo'), 'Bloqueio de pedido abaixo de R$ 30,00 validado');

  // Dono altera para R$ 10,00
  await request('PUT', '/api/dono/pedido-minimo', { pedidoMinimo: 10.00 }, { 'Authorization': `Bearer ${tokenDono}` });
  const checkoutNovoMinimo = await request('POST', '/api/pedidos', {
    cliente_nome: 'Cliente Teste',
    cliente_telefone: '47999990001',
    endereco: { rua: 'Rua das Flores', numero: '100', bairro: 'Centro' },
    forma_pagamento: 'pix',
    itens: [{ n: itemTeste, preco: 15.00, qtd: 1 }]
  });
  assert(checkoutNovoMinimo.status === 201, 'Pedido aceito após Dono alterar pedido mínimo');

  // Restaura pedido mínimo para 30.00
  await request('PUT', '/api/dono/pedido-minimo', { pedidoMinimo: 30.00 }, { 'Authorization': `Bearer ${tokenDono}` });

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 4: Checkout e Painel Dono em tempo real ---');
  // --------------------------------------------------------------------------
  const checkoutValido = await request('POST', '/api/pedidos', {
    cliente_nome: 'Mariana Silva',
    cliente_telefone: '47998877665',
    endereco: { rua: 'Av. Brasil', numero: '500', bairro: 'Centro', complemento: 'Apto 12' },
    forma_pagamento: 'pix',
    itens: [{ n: 'Açaí Tradicional - Copo 500ml', preco: 18.00, qtd: 2 }] // Total R$ 36.00 + R$ 6 frete = R$ 42.00
  });
  assert(checkoutValido.status === 201 && checkoutValido.data.pedido, 'Pedido realizado no site');
  const pedidoMariana = checkoutValido.data.pedido;

  const pedidosDono = await request('GET', '/api/dono/pedidos', null, { 'Authorization': `Bearer ${tokenDono}` });
  const pedidoNoDono = pedidosDono.data.find(o => o.id === pedidoMariana.id);
  assert(pedidoNoDono && pedidoNoDono.numero === pedidoMariana.numero, 'Pedido apareceu imediatamente na Central do Dono');

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 5: Histórico e Persistência de Rastreamento ---');
  // --------------------------------------------------------------------------
  const rastreio = await request('GET', `/api/pedidos/rastreio/${pedidoMariana.codigo_rastreio}`);
  assert(rastreio.status === 200 && rastreio.data.id === pedidoMariana.id, 'Rastreamento por código persistido e seguro');
  assert(rastreio.data.status_historico.length >= 1, 'Histórico de status gravado');

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 6: Entregadores offline recebem chamada (Regra 15) ---');
  // --------------------------------------------------------------------------
  const telM1 = '4799111' + Math.floor(1000 + Math.random() * 9000);
  const telM2 = '4799222' + Math.floor(1000 + Math.random() * 9000);

  const cadM1 = await request('POST', '/api/auth/entregador/register', {
    nome: 'Carlos Motoboy 1',
    telefone: telM1,
    cpf: '111.222.333-44',
    password: 'senha'
  });
  const cadM2 = await request('POST', '/api/auth/entregador/register', {
    nome: 'Roberto Motoboy 2',
    telefone: telM2,
    cpf: '222.333.444-55',
    password: 'senha'
  });
  assert(cadM1.status === 201 && cadM2.status === 201, 'Dois entregadores cadastrados (Aguardando Aprovação)');

  // Dono aprova ambos
  await request('PUT', `/api/dono/entregadores/${cadM1.data.entregador.id}/status`, { status: 'APROVADO' }, { 'Authorization': `Bearer ${tokenDono}` });
  await request('PUT', `/api/dono/entregadores/${cadM2.data.entregador.id}/status`, { status: 'APROVADO' }, { 'Authorization': `Bearer ${tokenDono}` });

  // Ambos realizam login mas PERMANECEM OFFLINE
  const loginM1 = await request('POST', '/api/auth/entregador/login', { telefone: telM1, password: 'senha' });
  const loginM2 = await request('POST', '/api/auth/entregador/login', { telefone: telM2, password: 'senha' });
  const tokenM1 = loginM1.data.token;
  const tokenM2 = loginM2.data.token;
  assert(!loginM1.data.entregador.online && !loginM2.data.entregador.online, 'Ambos os motoboys estão OFFLINE');

  // Dono chama entregador para o pedido
  await request('PUT', `/api/dono/pedidos/${pedidoMariana.id}/status`, { novoStatus: 'EM_PREPARACAO' }, { 'Authorization': `Bearer ${tokenDono}` });
  const disparoChamada = await request('POST', `/api/dono/pedidos/${pedidoMariana.id}/chamar-entregador`, null, { 'Authorization': `Bearer ${tokenDono}` });
  assert(disparoChamada.status === 200, 'Chamada criada com sucesso pelo Dono');
  assert(disparoChamada.data.entregadoresNotificados >= 2, 'Chamada enviada para todos os motoboys aprovados mesmo offline');

  const chamadasM1 = await request('GET', '/api/entregador/chamadas', null, { 'Authorization': `Bearer ${tokenM1}` });
  const chamadasM2 = await request('GET', '/api/entregador/chamadas', null, { 'Authorization': `Bearer ${tokenM2}` });
  const achouM1 = chamadasM1.data.find(c => c.pedido_id === pedidoMariana.id);
  const achouM2 = chamadasM2.data.find(c => c.pedido_id === pedidoMariana.id);
  assert(achouM1 && achouM2, 'Ambos os entregadores offline receberam a chamada de entrega no painel');

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 7: Primeiro aceite atômico (Regra 15) ---');
  // --------------------------------------------------------------------------
  const callId = achouM1.id;
  const aceite1 = await request('POST', `/api/entregador/chamadas/${callId}/aceitar`, null, { 'Authorization': `Bearer ${tokenM1}` });
  assert(aceite1.status === 200, 'Motoboy 1 aceitou primeiro e ficou com a entrega');

  const aceite2 = await request('POST', `/api/entregador/chamadas/${callId}/aceitar`, null, { 'Authorization': `Bearer ${tokenM2}` });
  assert(aceite2.status === 409, 'Segundo motoboy foi bloqueado com 409 Conflict (Atomicidade garantida)');

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 8: Cancelamento e redistribuição automática (Regra 16) ---');
  // --------------------------------------------------------------------------
  const cancelamento = await request('POST', `/api/entregador/pedidos/${pedidoMariana.id}/cancelar`, {
    motivo: 'Pneu da moto furou na saída'
  }, { 'Authorization': `Bearer ${tokenM1}` });
  assert(cancelamento.status === 200 && cancelamento.data.novaChamadaId, 'Motoboy 1 cancelou e entrega voltou para a fila');

  // Verifica que nova chamada foi criada e Motoboy 2 pode aceitar
  const chamadasNovasM2 = await request('GET', '/api/entregador/chamadas', null, { 'Authorization': `Bearer ${tokenM2}` });
  const achouRedistribuida = chamadasNovasM2.data.find(c => c.pedido_id === pedidoMariana.id);
  assert(achouRedistribuida, 'Motoboy 2 recebeu a nova chamada redistribuída');

  const aceiteM2 = await request('POST', `/api/entregador/chamadas/${achouRedistribuida.id}/aceitar`, null, { 'Authorization': `Bearer ${tokenM2}` });
  assert(aceiteM2.status === 200, 'Motoboy 2 aceitou a entrega redistribuída');

  // Conclui etapas até entregar
  await request('POST', `/api/entregador/pedidos/${pedidoMariana.id}/etapa`, { etapa: 'CHEGOU_SORVETERIA' }, { 'Authorization': `Bearer ${tokenM2}` });
  await request('POST', `/api/entregador/pedidos/${pedidoMariana.id}/etapa`, { etapa: 'RETIRADO' }, { 'Authorization': `Bearer ${tokenM2}` });
  await request('POST', `/api/entregador/pedidos/${pedidoMariana.id}/etapa`, { etapa: 'ENTREGUE' }, { 'Authorization': `Bearer ${tokenM2}` });

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 9: Pagamentos (PIX confirmação, dinheiro c/ troco, cartão) ---');
  // --------------------------------------------------------------------------
  // Confirmar pagamento PIX pelo Dono
  const confPix = await request('PUT', `/api/dono/pedidos/${pedidoMariana.id}/pagamento`, {
    statusPagamento: 'CONFIRMADO',
    observacao: 'Comprovante conferido via Extrato Bancário'
  }, { 'Authorization': `Bearer ${tokenDono}` });
  assert(confPix.status === 200 && confPix.data.statusPagamento === 'CONFIRMADO', 'Pagamento PIX confirmado manualmente pelo Dono');

  // Teste dinheiro com troco
  const pedidoDinheiro = await request('POST', '/api/pedidos', {
    cliente_nome: 'Lucas Dinheiro',
    cliente_telefone: '47990001122',
    endereco: { rua: 'Rua A', numero: '1', bairro: 'Centro' },
    forma_pagamento: 'dinheiro',
    precisa_troco: true,
    troco_para: 50.00,
    itens: [{ n: 'Açaí Tradicional - Copo 500ml', preco: 18.00, qtd: 2 }] // Total = 36 + 5 = 41
  });
  assert(pedidoDinheiro.status === 201 && pedidoDinheiro.data.pedido.troco_valor === 9.00, 'Dinheiro com cálculo de troco para R$ 50,00 validado');

  // Teste cartão na entrega desativado vs ativado
  await request('PUT', '/api/dono/pagamentos', {
    dinheiro: { ativo: true },
    pix: { ativo: true },
    cartao_entrega: { ativo: false }
  }, { 'Authorization': `Bearer ${tokenDono}` });

  const pedidoCartaoDesativado = await request('POST', '/api/pedidos', {
    cliente_nome: 'Teste Cartão',
    cliente_telefone: '47990001122',
    endereco: { rua: 'Rua A', numero: '1', bairro: 'Centro' },
    forma_pagamento: 'cartao_entrega',
    itens: [{ n: 'Açaí Tradicional - Copo 500ml', preco: 18.00, qtd: 2 }]
  });
  assert(pedidoCartaoDesativado.status === 400, 'Bloqueio de cartão quando desativado validado');

  // Ativa cartão nas configurações
  await request('PUT', '/api/dono/pagamentos', {
    dinheiro: { ativo: true },
    pix: { ativo: true },
    cartao_entrega: { ativo: true }
  }, { 'Authorization': `Bearer ${tokenDono}` });

  const pedidoCartaoAtivado = await request('POST', '/api/pedidos', {
    cliente_nome: 'Teste Cartão Ativado',
    cliente_telefone: '47990001122',
    endereco: { rua: 'Rua A', numero: '1', bairro: 'Centro' },
    forma_pagamento: 'cartao_entrega',
    itens: [{ n: 'Açaí Tradicional - Copo 500ml', preco: 18.00, qtd: 2 }]
  });
  assert(pedidoCartaoAtivado.status === 201, 'Cartão na maquininha aceito após Dono ativar opção');

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 10: Comanda para impressão térmica ---');
  // --------------------------------------------------------------------------
  const comandaPedido = pedidoMariana;
  assert(comandaPedido.numero && comandaPedido.cliente_nome && comandaPedido.endereco.bairro, 'Comanda contém número, nome do cliente e bairro');
  assert(comandaPedido.itens.length > 0 && comandaPedido.subtotal && comandaPedido.taxa_entrega && comandaPedido.total, 'Comanda possui snapshot de itens, subtotal, taxa e total');
  assert(comandaPedido.forma_pagamento, 'Comanda possui forma de pagamento');

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 11: Horários de funcionamento (Bloqueio quando fechada) ---');
  // --------------------------------------------------------------------------
  await request('PUT', '/api/dono/horarios', {
    horarios: {
      segunda: { aberto: false, inicio: '00:00', fim: '00:00' },
      terca: { aberto: false, inicio: '00:00', fim: '00:00' },
      quarta: { aberto: false, inicio: '00:00', fim: '00:00' },
      quinta: { aberto: false, inicio: '00:00', fim: '00:00' },
      sexta: { aberto: false, inicio: '00:00', fim: '00:00' },
      sabado: { aberto: false, inicio: '00:00', fim: '00:00' },
      domingo: { aberto: false, inicio: '00:00', fim: '00:00' }
    },
    excecoes: []
  }, { 'Authorization': `Bearer ${tokenDono}` });

  const checkoutLojaFechada = await request('POST', '/api/pedidos', {
    cliente_nome: 'Tentativa Fechado',
    cliente_telefone: '47990001122',
    endereco: { rua: 'Rua B', numero: '2', bairro: 'Centro' },
    forma_pagamento: 'pix',
    itens: [{ n: 'Açaí Tradicional - Copo 500ml', preco: 18.00, qtd: 2 }]
  });
  assert(checkoutLojaFechada.status === 400 && checkoutLojaFechada.data.error.includes('fechada'), 'Checkout bloqueou pedidos imediatos com a sorveteria fechada');

  // Reabre horários
  await request('PUT', '/api/dono/horarios', {
    horarios: {
      segunda: { aberto: true, inicio: '00:00', fim: '23:59' },
      terca: { aberto: true, inicio: '00:00', fim: '23:59' },
      quarta: { aberto: true, inicio: '00:00', fim: '23:59' },
      quinta: { aberto: true, inicio: '00:00', fim: '23:59' },
      sexta: { aberto: true, inicio: '00:00', fim: '23:59' },
      sabado: { aberto: true, inicio: '00:00', fim: '23:59' },
      domingo: { aberto: true, inicio: '00:00', fim: '23:59' }
    },
    excecoes: []
  }, { 'Authorization': `Bearer ${tokenDono}` });

  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 12: Segurança e Permissões (RBAC) ---');
  // --------------------------------------------------------------------------
  const invadeDono = await request('GET', '/api/dono/pedidos', null, { 'Authorization': `Bearer ${tokenM2}` });
  assert(invadeDono.status === 401 || invadeDono.status === 403, 'Motoboy bloqueado de acessar Painel do Dono');

  const invadeEntregador = await request('GET', '/api/entregador/chamadas');
  assert(invadeEntregador.status === 401 || invadeEntregador.status === 403, 'Acesso não autenticado a chamadas bloqueado');

  console.log('\n=====================================================');
  console.log('TODOS OS 12 TESTES OBRIGATÓRIOS PASSARAM COM SUCESSO TOTAL!');
  console.log('=====================================================\n');
}

runAll12Tests().catch(err => {
  console.error('\n❌ ERRO NA EXECUÇÃO DOS TESTES:', err);
  process.exit(1);
});
