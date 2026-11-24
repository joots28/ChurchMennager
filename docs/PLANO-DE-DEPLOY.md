# Plano de implantação — ChurchManager

## Arquitetura de publicação

Um único repositório GitHub — `joots28/ChurchMennager`, branch `main` — contém frontend e backend. Dois serviços Render publicam partes desse mesmo repositório:

- `churchmanager-tcc`: Static Site, Root Directory `frontend`, build `npm install && npm run build`, publicação `dist`.
- `churchmanager-api-tcc`: Web Service Docker, Dockerfile `backend/ChurchManager.Api/Dockerfile`, contexto `.`.

O único banco remoto da aplicação é o PostgreSQL do Supabase (`NexEl`). Neon e MySQL não fazem parte da arquitetura publicada.

## Variáveis da API no Render

Configure em Render → `churchmanager-api-tcc` → Environment:

- `CHURCHMANAGER_DB_PROVIDER=postgres`
- `ConnectionStrings__DefaultConnection`: connection string copiada de Supabase → Connect → Session pooler. Armazenar como segredo.
- `Database__AutoCreate=false`
- `FRONTEND_ORIGIN=https://churchmanager-tcc.onrender.com`
- `JWT_KEY`: chave aleatória e exclusiva com pelo menos 32 caracteres.
- `AUTH_ALLOW_PUBLIC_REGISTRATION=false` após criar a conta inicial.

Use TLS/SSL. Para o serviço ASP.NET persistente, prefira o modo Session pooler, copiando host, porta, database, usuário e senha do painel. Consulte https://supabase.com/docs/guides/database/connecting-to-postgres.

## Variáveis do frontend no Render

Em Render → `churchmanager-tcc`:

- `VITE_DEMO_MODE=false`
- `VITE_API_URL=https://churchmanager-api-tcc.onrender.com`

As variáveis `VITE_*` são embutidas no build; alterá-las exige novo deploy do frontend.

## Ordem segura

1. Aguardar Supabase `NexEl` ficar `ACTIVE_HEALTHY`.
2. Inspecionar tabelas, colunas, índices, constraints e quantidade de registros.
3. Se houver dados importantes no Neon, exportar e importar explicitamente no Supabase. Restaurar o projeto Supabase não copia dados de outro provedor.
4. Comparar esquema e dados com `AppDbContext.cs`; aplicar uma migração PostgreSQL revisada, versionada e não destrutiva.
5. Inserir connection string do Supabase como segredo no Render.
6. Deployar a API e confirmar `/health/ready` retornando `database: connected`.
7. Fazer build do frontend com a URL correta da API.
8. Testar autenticação e CRUD, além da persistência entre dispositivos.
9. Desativar o cadastro público e validar isolamento por igreja e backup/restore.

## Estado verificado em 23/11/2026

- Os serviços Render existentes `churchmanager-tcc` e `churchmanager-api-tcc` apontam para `joots28/ChurchMennager`, branch `main`.
- Frontend é Static Site; API é Docker Web Service.
- Auto-deploy da API estava desativado; após atualizar o código, é necessário deploy manual.
- O projeto Supabase `NexEl` estava pausado; a solicitação de restauração foi aceita, mas ainda precisa atingir `ACTIVE_HEALTHY` antes de consultar tabelas.
- A importação dos dados Neon não foi comprovada.
- A connection string deve ser configurada como segredo e validada por `/health/ready`.

Não declarar a aplicação pronta enquanto qualquer etapa crítica estiver pendente.
