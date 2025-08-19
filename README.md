# Revir

README atualizado para o estado atual do repositório: frontend em React (Vite) e backend em Node/Express com integração opcional ao Supabase.

## Visão geral

Revir é uma aplicação de demonstração para gestão de vendas. O frontend é uma SPA React construída com Vite e Material-UI; o backend é uma API Express que pode operar contra o Supabase (preferido) ou mock data para desenvolvimento.

Principais responsabilidades:
- Autenticação de usuários
- Rotas para produtos, clientes, compras, vendas e fornecedores
- Dashboard e relatórios básicos (frontend)

## Estrutura do repositório

- `frontend/` — app React + Vite (scripts: `dev`, `build`, `preview`)
- `backend/` — API Express (entry: `src/index.js`, scripts: `start`, `dev`)
- `.github/workflows/` — GitHub Actions para CI/CD (deploy no Vercel)
- `backend/vercel.json` e `frontend/vercel.json` — configurações de deploy para Vercel

## Rodando localmente

Requisitos:
- Node.js >= 18 recomendado
- npm ou yarn

1) Backend

```powershell
cd backend
npm install
# ambiente de desenvolvimento (recarregamento com nodemon):
npm run dev
# ou para rodar em produção local:
npm start
```

O servidor roda por padrão em `http://localhost:4000`.

2) Frontend

```powershell
cd frontend
npm install
npm run dev
```

O Vite normalmente abre em `http://localhost:5173` (o terminal indica a porta exata).

Para gerar build de produção (frontend):

```powershell
cd frontend
npm run build
```


## Variáveis de ambiente importantes

Backend (arquivo `.env` na pasta `backend` ou variáveis de ambiente do servidor):
- `PORT` — porta do servidor (padrão 4000)
- `SUPABASE_URL` — URL do projeto Supabase (opcional)
- `SUPABASE_SERVICE_ROLE_KEY` — chave de serviço (recomendada para operações servidoras)
- `SUPABASE_KEY` ou `SUPABASE_ANON_KEY` — alternativas (não recomendadas para server)

CI / Deploy (GitHub Actions / Vercel):
- `VERCEL_TOKEN` — token usado pelos workflows para deploy
- `VERCEL_PROJECT_ID` — ID do projeto Vercel (recomendado)
- `VERCEL_ORG_ID` — opcional

Observação: se `SUPABASE_*` não estiverem configuradas, o backend irá logar um aviso e alguns endpoints podem usar implementações mock internas.

## API — Endpoints principais

Base URL: `http://localhost:4000`

- `GET /` — health check
- `POST /auth/login` — login (autenticação)
- `GET/POST/PUT/DELETE /products` — gestão de produtos
- `GET/POST/PUT/DELETE /clients` — gestão de clientes
- `GET/POST/PUT/DELETE /suppliers` — gestão de fornecedores
- `GET/POST/PUT/DELETE /purchases` — compras
- `GET/POST/PUT/DELETE /sales` — vendas

Consulte as rotas em `backend/src/routes/` para detalhes dos parâmetros aceitos.

## Deploy

Este repositório contém workflows GitHub Actions que executam build e deploy no Vercel:

- Frontend: `.github/workflows/deploy-vercel.yml` — build (Vite) e `vercel --prod`
- Backend: `.github/workflows/deploy-backend.yml` — instala dependências e deploy via Vercel CLI

Passos mínimos para habilitar CI/CD:
1. Criar os projetos no Vercel (frontend e backend) ou um único projeto com configurações separadas.
2. No repositório GitHub: Settings → Secrets, adicionar `VERCEL_TOKEN` e `VERCEL_PROJECT_ID` (e `VERCEL_ORG_ID` se desejar).
3. Fazer push nas branches `main`/`master` para disparar os workflows.

Observações que surgiram ao configurar deploy:
- O Vercel pode tentar detectar frameworks automaticamente. Para garantir o build correto do frontend (Vite) incluímos `frontend/vercel.json` com `@vercel/static-build`.
- Para o backend apontamos `backend/vercel.json` para `src/index.js`.

## Troubleshooting rápido

- Erro `ng: command not found` no build do Vercel: antes havia detecção de Angular; solução: `frontend/vercel.json` com `@vercel/static-build` para forçar `npm run build`.
- Erro `You specified VERCEL_ORG_ID but you forgot to specify VERCEL_PROJECT_ID`: defina `VERCEL_PROJECT_ID` nos Secrets ou remova `VERCEL_ORG_ID` do env do workflow.
- Se o backend não conseguir conectar ao Supabase, confira `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env`/Secrets.

## Notas para desenvolvedores

- Frontend: está em `frontend/src/` com context providers (`AuthContext`, `CartContext` etc.).
- Backend: `backend/src/` contém rotas, controllers e integração com Supabase em `backend/src/lib/supabase.js`.
- Para debug rápido do backend sem Supabase, o código inclui mocks (veja `backend/src/db/*.js`).

## Contribuindo

- Abra uma issue descrevendo a mudança proposta.
- Crie uma branch por feature e envie PR para revisão.

---

Se quiser, eu posso adicionar exemplos de requests (curl/Postman) para os endpoints ou um arquivo `.env.example` com variáveis necessárias — quer que eu gere isso também?

