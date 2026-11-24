# ChurchManager

Sistema web responsivo de gestão de igrejas, desenvolvido como TCC.

## Arquitetura oficial

**Todo o código fica em um único repositório GitHub:** [joots28/ChurchMennager](https://github.com/joots28/ChurchMennager), branch `main`.

- **Frontend:** React 18 + JavaScript/JSX + Vite.
- **Backend:** C# + ASP.NET Core 8 + Entity Framework Core.
- **Banco de dados:** PostgreSQL gerenciado pelo Supabase, projeto `NexEl`.
- **Hospedagem:** Render. O serviço estático publica `frontend/`; o serviço Docker publica a API em `backend/ChurchManager.Api/`. Ambos usam o mesmo repositório e a mesma branch.
- **Fluxo:** navegador → HTTPS → API C# → PostgreSQL/TLS → Supabase.

O navegador nunca recebe a senha do banco nem acessa PostgreSQL diretamente. A API concentra autenticação, validação, autorização e regras de negócio.

## Estrutura

```text
ChurchMennager/
├── frontend/                  # React + Vite (site/PWA)
├── backend/
│   ├── ChurchManager.Api/     # API ASP.NET Core
│   └── database/              # scripts e histórico do esquema
├── docs/                       # arquitetura, deploy e validação
├── preview/                    # prévia visual independente
└── render.yaml                 # configuração dos dois serviços Render
```

## Endereços dos serviços

- Frontend: https://churchmanager-tcc.onrender.com
- API: https://churchmanager-api-tcc.onrender.com
- Saúde da API: `/health`
- Saúde + banco: `/health/ready`

A existência dos endereços não garante que o banco esteja conectado. Para considerar a publicação funcional, `/health/ready` deve retornar `database: connected` e os fluxos reais precisam ser testados.

## Configurar o Supabase no Render

No Render → serviço **churchmanager-api-tcc** → **Environment**, configure:

| Variável | Valor |
|---|---|
| `CHURCHMANAGER_DB_PROVIDER` | `postgres` |
| `ConnectionStrings__DefaultConnection` | Connection string copiada de Supabase → Connect → Session pooler |
| `Database__AutoCreate` | `false` |
| `FRONTEND_ORIGIN` | `https://churchmanager-tcc.onrender.com` |
| `AUTH_ALLOW_PUBLIC_REGISTRATION` | `false` após criar a conta administrativa |
| `JWT_KEY` | Chave aleatória exclusiva com pelo menos 32 caracteres |

Use o modo **Session pooler** do Supabase para o backend ASP.NET persistente. Copie host, porta, database, usuário e senha diretamente do painel. Mantenha SSL habilitado. Não coloque a senha em código, README, issues ou arquivos versionados.

No serviço **churchmanager-tcc**, confira:
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- `VITE_DEMO_MODE=false`
- `VITE_API_URL=https://churchmanager-api-tcc.onrender.com`

## Executar localmente

Pré-requisitos: Node.js 20+ e .NET SDK 8.

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend: configure a connection string do Supabase via User Secrets (não grave a senha em `appsettings.json`):
```bash
dotnet user-secrets init --project backend/ChurchManager.Api/ChurchManager.Api.csproj
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=HOST_DO_POOLER;Port=5432;Database=postgres;Username=USUARIO_DO_POOLER;Password=SUA_SENHA;SSL Mode=Require" --project backend/ChurchManager.Api/ChurchManager.Api.csproj
dotnet run --project backend/ChurchManager.Api/ChurchManager.Api.csproj --urls http://localhost:5080
```

Para o frontend local, crie `frontend/.env.local` com `VITE_DEMO_MODE=false` e `VITE_API_URL=http://localhost:5080`.

## Estado da migração

O projeto Supabase `NexEl` foi localizado e a solicitação de restauração do projeto pausado foi aceita. Isso **não comprova** que dados de outro provedor (como Neon) tenham sido importados. Antes de declarar a migração concluída, confirme que as tabelas e os registros necessários estão presentes no Supabase.

O esquema deve ser revisado e aplicado por migração PostgreSQL versionada. A API não deve criar tabelas automaticamente em produção. Não execute scripts MySQL antigos no Supabase. Depois de aplicar o esquema, valide `/health/ready`, login, CRUD e persistência após recarregar em outro dispositivo.

## Segurança

- Nunca versionar `.env`, connection strings, senhas, JWTs ou chaves privilegiadas.
- Não disponibilizar credenciais do banco no frontend.
- Manter CORS restrito ao domínio publicado.
- Desativar cadastro público após criar a conta inicial.
- Não inserir dados pessoais ou financeiros reais antes de validar autenticação, isolamento por igreja, backup e recuperação.

Consulte `docs/PLANO-DE-DEPLOY.md`, `docs/STATUS-E-VALIDACAO.md` e `docs/SEGURANCA-E-VALIDACAO.md`.
