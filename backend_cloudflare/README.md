# ProServiços - Backend Unificado no Cloudflare (Workers + D1 SQL)

Este diretório contém o backend serverless completo rodando na borda global do **Cloudflare Workers** com banco relacional de baixa latência **Cloudflare D1**.

Ele atende simultaneamente aos dois aplicativos móveis em Flutter:
1. **📱 App do Cliente** (`flutter_apps/client_app`)
2. **🛠️ App do Prestador** (`flutter_apps/provider_app`)

---

## 🏗️ Estrutura do Backend Cloudflare
```
backend_cloudflare/
├── wrangler.toml         # Configuração de deploy no Cloudflare Workers & bindings D1
├── package.json          # Dependências do Worker (wrangler, typescript, types)
├── schema.sql            # Script SQL de criação das tabelas no Cloudflare D1
├── src/
│   ├── worker.ts         # Código do Worker (Rotas REST, CORS, Queries SQL D1)
│   └── types.ts          # Definições TypeScript dos dados compartilhados
└── README.md             # Instruções de deploy
```

---

## 🚀 Como fazer Deploy no Cloudflare (Passo a Passo)

### 1. Instale o Wrangler (CLI do Cloudflare)
```bash
npm install -g wrangler
```

### 2. Faça Login na sua conta Cloudflare
```bash
wrangler login
```

### 3. Crie o Banco de Dados Cloudflare D1
```bash
wrangler d1 create proservicos-d1
```
*Copie o `database_id` gerado e cole no arquivo `wrangler.toml` no campo `database_id`.*

### 4. Execute o Schema SQL no Cloudflare D1
- **Em desenvolvimento local:**
```bash
wrangler d1 execute proservicos-d1 --local --file=./schema.sql
```
- **Em produção na nuvem Cloudflare:**
```bash
wrangler d1 execute proservicos-d1 --remote --file=./schema.sql
```

### 5. Inicie o Worker Localmente
```bash
cd backend_cloudflare
npm install
npm run dev
```
O backend ficará ativo em `http://127.0.0.1:8787`.

### 6. Faça o Deploy Global
```bash
npm run deploy
```
Sua API estará no ar em milissegundos em: `https://proservicos-api.<seu-subdominio>.workers.dev`

---

## 📡 Endpoints da API Cloudflare Workers

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/health` | Healthcheck do Worker e conexão D1 |
| `POST` | `/api/auth/login` | Login com autenticação de usuário |
| `POST` | `/api/requests` | Cliente cria novo pedido e dispara radar |
| `GET` | `/api/requests/radar` | Prestadores buscam chamados abertos na região |
| `GET` | `/api/requests/:id` | Detalhes do pedido e status da ordem |
| `POST` | `/api/requests/:id/quotes` | Prestador envia orçamento de mão de obra e materiais |
| `GET` | `/api/requests/:id/quotes` | Cliente lista orçamentos recebidos em tempo real |
| `POST` | `/api/requests/:id/escrow` | Cliente fecha contratação retendo valor no PIX Custódia |
| `POST` | `/api/requests/:id/status` | Prestador atualiza status (a caminho, cheguei, concluído) |
| `POST` | `/api/requests/:id/release` | Cliente aprova e libera custódia PIX para o prestador |
| `GET` | `/api/requests/:id/messages` | Histórico do chat do serviço |
| `POST` | `/api/requests/:id/messages` | Enviar nova mensagem de chat |
| `GET` | `/api/provider/:id/finance` | Extrato da carteira e recibos MEI do prestador |
