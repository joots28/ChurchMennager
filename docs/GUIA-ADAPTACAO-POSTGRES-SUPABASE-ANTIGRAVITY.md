# Guia de finalização — ChurchManager

**Arquitetura alvo:** repositório único `joots28/ChurchMennager`; frontend React/Vite e backend ASP.NET Core/C# publicados no Render; Supabase (`NexEl`) como único banco de dados PostgreSQL.

## Arquitetura

```text
Navegador
  │ HTTPS / JSON
  ▼
Frontend React + Vite — Render Static Site
  │ VITE_API_URL
  ▼
API ASP.NET Core / C# — Render Docker Web Service
  │ EF Core + Npgsql / TLS
  ▼
PostgreSQL — Supabase
```

Não criar outro repositório. Não direcionar o frontend para Vercel. Não manter Neon como banco de produção. Nunca expor connection string ou senha no navegador.

## Render

Os dois serviços devem usar o repositório `joots28/ChurchMennager`, branch `main`.

API `churchmanager-api-tcc`:
- Dockerfile: `./backend/ChurchManager.Api/Dockerfile`
- Docker Context: `.`
- `CHURCHMANAGER_DB_PROVIDER=postgres`
- `ConnectionStrings__DefaultConnection`: connection string Session pooler copiada do Supabase; cadastrar como segredo.
- `Database__AutoCreate=false`
- `FRONTEND_ORIGIN=https://churchmanager-tcc.onrender.com`
- `JWT_KEY`: segredo aleatório com pelo menos 32 caracteres.
- `AUTH_ALLOW_PUBLIC_REGISTRATION=false` após primeiro cadastro administrativo.

Frontend `churchmanager-tcc`:
- Root Directory: `frontend`
- Build: `npm install && npm run build`
- Publish Directory: `dist`
- `VITE_DEMO_MODE=false`
- `VITE_API_URL=https://churchmanager-api-tcc.onrender.com`

## PostgreSQL Supabase

Para a API ASP.NET persistente, use o **Session pooler** apresentado em Supabase → Connect. Copie host, porta, banco, usuário e senha diretamente do painel. Mantenha SSL habilitado. Consulte a documentação oficial: https://supabase.com/docs/guides/database/connecting-to-postgres.

A connection string fica apenas nas variáveis de ambiente do Render ou em User Secrets local. Nunca salve a senha em commits, arquivos de exemplo ou frontend.

## Migração de dados

A restauração de um projeto Supabase pausado não importa automaticamente o banco de outro provedor. Antes de alterar o esquema:
1. Confirmar estado `ACTIVE_HEALTHY`.
2. Inspecionar tabelas, colunas, índices, constraints e contagem de registros.
3. Exportar o Neon se houver dados que precisam ser preservados.
4. Importar no Supabase e conferir contagens e integridade.
5. Comparar com `backend/ChurchManager.Api/Data/AppDbContext.cs`.
6. Aplicar migração PostgreSQL versionada e revisada.

Não executar scripts MySQL antigos no Supabase e não usar `EnsureCreated` como substituto de migrações.

## Testes de aceitação

- `GET /health` responde 200.
- `GET /health/ready` responde 200 com `database=connected`.
- Login, logout e sessão expirada.
- CRUD de membros, ministérios, eventos, finanças, cargos e escalas.
- Persistência após recarregar e entrar em outro dispositivo.
- Isolamento dos registros por igreja.
- Nenhuma credencial privilegiada no frontend.
- Cadastro público desativado após criar a primeira conta administrativa.
- Backup e restauração verificados.

## Limitações funcionais conhecidas

Recuperação de senha/verificação de e-mail, MFA, auditoria completa, RBAC granular e alguns endpoints do portal de membro ainda precisam de implementação e homologação. Não prometer esses recursos como concluídos.
