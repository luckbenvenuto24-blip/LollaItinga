# 🍦 Cardápio Digital - Sorveteria Lolla

Aplicação de cardápio digital completa com **Acesso Restrito Protegido por Senha para o Dono/Administrador**. Reconstruído via engenharia reversa com **REA** (`reverse-engineer-anything`).

---

## 🔒 Segurança: Clientes vs Administrador (Dono)

- **Visão do Cliente (Pública)**:
  - Ao acessar o cardápio normalmente (`http://localhost:3000`), **nenhum** botão de edição ou painel administrativo é visível.
  - O cliente apenas navega, pesquisa sabores, filtra categorias e clica nos botões de pedido do WhatsApp.
  - As rotas da API que salvam alterações (`/api/cardapio` e `/api/upload`) são protegidas no servidor e rejeitam qualquer tentativa não autorizada.

- **Visão do Dono / Administrador**:
  - Para acessar as funções de lojista, você precisa autenticar-se com sua senha.
  - **Senha inicial padrão**: `lolla123` *(você pode alterá-la para qualquer senha que preferir!)*

---

## 🔑 Como você (Dono) acessa o Painel de Edição:

Você tem **3 formas práticas** de entrar:

1. **Pela URL Direta**:
   - Acesse: **[http://localhost:3000/admin](http://localhost:3000/admin)**
   - O modal de login abrirá automaticamente pedindo sua senha.
2. **Pelo Rodapé da Página**:
   - No final da página (rodapé), há um link discreto: **`🔒 Área Restrita`**.
3. **Pelo Atalho Secreto**:
   - Dê **4 cliques rápidos** no título `"Sorveteria Lolla"` no topo da página, ou pressione **`Ctrl + Shift + A`** no teclado.

Após digitar a senha correta:
- A barra do Dono é liberada com os botões:
  - `➕ Adicionar Produto`
  - `⚙️ Dados da Loja (WhatsApp)`
  - `🔑 Alterar Senha`
  - `🔄 Restaurar Padrão`
  - `🚪 Sair (Logout)`
- Os botões `✏️ Editar` e `🗑️ Excluir` aparecem em cada produto para você trocar fotos, nomes, preços ou remover itens que não tem no estoque.
- Ao clicar em `🚪 Sair`, a tela volta imediatamente ao modo limpo do cliente.

---

## 📁 Estrutura do Projeto

```text
├── assets/
│   ├── marca/            # Logo, mascote (vaquinha) e imagens institucionais
│   └── fotos/            # Fotos salvas pelo upload do painel
├── css/
│   └── styles.css        # Folha de estilos completa e responsiva
├── data/
│   ├── auth.json         # Senha criptografada (SHA-256) do administrador
│   └── cardapio.json     # Catálogo editável de produtos e categorias
├── js/
│   └── app.js            # Lógica interativa, autenticação segura e CRUD
├── index.html            # Aplicação pronta para clientes e lojista
├── server.js             # Servidor HTTP com autenticação por token e API REST
└── package.json          # Scripts e comandos
```

---

## ⚡ Como Rodar

1. No terminal:
   ```bash
   npm start
   ```
2. Para clientes: [http://localhost:3000](http://localhost:3000)
3. Para você (Dono): [http://localhost:3000/admin](http://localhost:3000/admin) *(Senha: `lolla123`)*
