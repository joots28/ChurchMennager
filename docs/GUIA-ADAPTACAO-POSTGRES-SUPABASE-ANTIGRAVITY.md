# Guia de adaptação e finalização — ChurchMennager
## Supabase PostgreSQL + API C# no Render + React/Vite no Vercel

**Objetivo:** concluir a adaptação da base existente do ChurchMennager para PostgreSQL gerenciado pelo Supabase, mantendo a API ASP.NET Core em C# no Render e o frontend React/Vite no Vercel. Este documento é o handoff principal para o Antigravity e substitui, para a implantação final, as referências antigas a MySQL, Neon e frontend hospedado no Render.

**Prazo de referência:** apresentação do TCC em 01/12/2026.  
**Repositório:** https://github.com/joots28/ChurchMennager  
**Branch principal observada:** `main`

---

## 1. Decisão de arquitetura — não alterar

A arquitetura final é:

```text
Navegador / celular / computador
        |
        | HTTPS + JSON
        v
Frontend React + Vite (Vercel)
        |
        | HTTPS — VITE_API_URL
        v
API REST ASP.NET Core / C# (.NET 8) (Render)
        |
        | Entity Framework Core + Npgsql
        v
PostgreSQL gerenciado (Supabase)
```

Responsabilidades:

- **Vercel:** hospedar apenas a interface web estática React/Vite.
- **Render:** executar a API ASP.NET Core em Docker. A API é a única camada da aplicação que acessa o banco.
- **Supabase:** fornecer PostgreSQL gerenciado. Nesta arquitetura, o Supabase está sendo usado como banco PostgreSQL, não como substituto da API C#.
- **GitHub:** manter todo o código, documentação, scripts SQL e migrações versionadas.

### Regra fundamental

O navegador **não pode** conectar diretamente ao PostgreSQL, receber senha do banco ou receber credenciais privilegiadas do Supabase. O frontend chama a API C#; a API valida o JWT, aplica as regras de negócio e acessa o banco.

Não adicionar `@supabase/supabase-js` apenas para fazer CRUD se isso duplicar a camada de acesso já existente. Não mover regras de negócio para o frontend. Não trocar a API C# por Edge Functions.

---

## 2. Diagnóstico da base existente

A estrutura atual já tem boa parte da aplicação preparada:

- `frontend/`: React 18, JavaScript/JSX e Vite; comunicação HTTP centralizada em `src/services/`.
- `backend/ChurchManager.Api/`: API C# ASP.NET Core .NET 8, controllers, entidades, `AppDbContext`, JWT, validações, Dockerfile e provedor Npgsql.
- `backend/ChurchManager.Api/Data/AppDbContext.cs`: mapeia entidades para tabelas PostgreSQL com nomes PascalCase entre aspas, como `"Churches"`, `"Users"`, `"Members"`.
- `backend/ChurchManager.Api/Data/PostgresSchemaBootstrap.cs`: tentativa de inicialização/adaptação do esquema PostgreSQL.
- `render.yaml`: blueprint antigo de API + frontend no Render.
- `docker-compose.yml` e `backend/database/schema.sql`: ainda orientados a MySQL.
- `docs/`: documentação ainda contém referências a MySQL, Neon e ao site hospedado no Render.

### Inconsistências que precisam ser corrigidas

1. `Program.cs` ainda usa MySQL como provedor padrão quando `CHURCHMANAGER_DB_PROVIDER` não estiver configurado.
2. `appsettings.json` ainda define provedor e connection string de MySQL.
3. `ChurchManager.Api.csproj` ainda contém a dependência Pomelo/MySQL, embora o destino agora seja PostgreSQL.
4. O Compose e o SQL inicial ainda são MySQL; não podem ser usados para inicializar o Supabase.
5. O `render.yaml` configura também um Static Site no Render e define `FRONTEND_ORIGIN` como domínio do Render. O frontend final será Vercel.
6. `Database__AutoCreate=true` ativa `EnsureCreatedAsync` e o bootstrap SQL em tempo de inicialização. Isso não deve ser considerado substituto de migrações versionadas e auditáveis.
7. O bootstrap PostgreSQL atual cria tabelas/colunas/índices, mas não garante, sozinho, que todas as chaves estrangeiras e restrições esperadas pelo modelo EF Core estejam aplicadas.
8. Documentos antigos descrevem Neon/MySQL como arquitetura final. Atualizar ou marcar esses trechos como históricos para que outro desenvolvedor não siga instruções conflitantes.

**Não declarar o banco pronto apenas porque `/health` retorna OK.** A validação real exige conexão com PostgreSQL e leitura/escrita de dados através da API.

---

## 3. Escopo funcional que precisa continuar funcionando

Preservar o design e as telas atuais do Figma. Não redesenhar a interface durante a migração de banco.

### Módulos administrativos

- Autenticação: login e cadastro inicial controlado.
- Painel inicial: indicadores calculados a partir de dados da API, não números fictícios quando o modo real estiver ativo.
- Membros: listar, cadastrar, consultar, editar e excluir.
- Ministérios: CRUD completo.
- Eventos: CRUD, data, horário, local, ministério e status.
- Financeiro: entradas e saídas, valores decimais, categoria, data e método; não é gateway de pagamento.
- Cargos: CRUD e exibição da quantidade de usuários relacionados. Não apresentar permissões como RBAC efetivo enquanto a autorização por permissão não existir.
- Escalas: CRUD, data/horário, ministério, integrantes e eventual associação com evento.
- Configurações da igreja: consultar e atualizar dados da instituição.

### Portal do membro

O portal atual ainda tem pendências de integração. O Antigravity deve conferir os endpoints de dados do próprio membro e vincular a conta autenticada ao registro correto de membro. Não liberar dados administrativos para qualquer usuário autenticado.

### Funcionalidades que não podem ser anunciadas como prontas

- Recuperação de senha por e-mail, sem fluxo completo de token e envio.
- Verificação de e-mail, MFA e auditoria completa.
- Pagamentos reais ou integração bancária.
- Autorização granular por cargo, enquanto os campos de permissão forem apenas informativos.
- Notificações automáticas, caso ainda não exista serviço implementado e testado.

---

## 4. Modelo de dados esperado no PostgreSQL

Usar o modelo atual de domínio como referência. O nome das tabelas e colunas precisa ser coerente com `AppDbContext.cs`. Hoje o mapeamento PostgreSQL utiliza identificadores PascalCase entre aspas; por exemplo, `"Churches"` e `"CreatedAt"`. PostgreSQL diferencia identificadores quoted de nomes minúsculos sem aspas. Portanto, ou preserve exatamente os nomes mapeados, ou altere de forma coordenada todas as configurações EF, migrações, SQL e consultas. Não misture os dois padrões.

### Entidades principais

| Tabela | Campos principais esperados | Regras |
|---|---|---|
| `Churches` | Id, Name, Email, Phone, Address, CreatedAt | Igreja/organização proprietária dos registros |
| `Users` | Id, ChurchId, CargoId, Name, Email, PasswordHash, Role, IsActive, CreatedAt | E-mail único conforme regra atual; senha somente em hash |
| `Members` | Id, ChurchId, Name, Email, Phone, Ministry, Status, Role, CreatedAt | Pertence a uma igreja |
| `Ministries` | Id, ChurchId, Name, Description, Coordinator, Status, CreatedAt | Pertence a uma igreja |
| `Events` | Id, ChurchId, Title, Description, StartsAt, Location, Ministry, Status, IsRestricted, RecurrenceType, CreatedAt | Data/hora consistente e pertencente à igreja |
| `Transactions` | Id, ChurchId, Description, Category, Amount, TransactionType, TransactionDate, Method, CreatedAt | Amount como NUMERIC(12,2), valor maior que zero e tipo controlado |
| `Roles` | Id, ChurchId, Name, Description, PermissionsJson, Users, CreatedAt | Cargo pertence a uma igreja; quantidade de usuários deve ser calculada ou mantida sem confiar no navegador |
| `Scales` | Id, ChurchId, Title, Ministry, StartsAt, AssignedMembersJson, Status, EventId, LegacyMinistryName, CreatedAt | EventId opcional; integrantes não podem ser atribuídos a outra igreja |

### Relacionamentos obrigatórios

- `Churches (1) -> (N) Users`
- `Churches (1) -> (N) Members`
- `Churches (1) -> (N) Ministries`
- `Churches (1) -> (N) Events`
- `Churches (1) -> (N) Transactions`
- `Churches (1) -> (N) Roles`
- `Churches (1) -> (N) Scales`
- `Roles (1) -> (N) Users`, através de `Users.CargoId`
- `Events (1) -> (N) Scales`, através de `Scales.EventId`, permitindo nulo quando a escala não estiver associada a evento.

### Tipos e restrições

- IDs: `INTEGER GENERATED BY DEFAULT AS IDENTITY` (ou tipo coerente com o domínio atual).
- Datas persistidas como UTC; preferir `TIMESTAMPTZ` / `timestamp with time zone`.
- Valores financeiros: `NUMERIC(12,2)`, nunca `FLOAT` ou `DOUBLE`.
- Estado de ativo/restrito: `BOOLEAN`.
- Texto: limites compatíveis com as validações e o modelo C#.
- JSON que ainda seja mantido como string: `TEXT` com validação da aplicação. Se converter para `JSONB`, ajustar entidade, serialização e consultas antes.
- Criar PKs, FKs, índices e constraints de forma explícita.
- Índices mínimos para `ChurchId`, e índices compostos por igreja + data em Eventos, Transações e Escalas.
- Restringir valores financeiros inválidos e os tipos de movimentação aceitos.
- Definir comportamento de exclusão deliberadamente. Não apagar dados financeiros ou históricos em cascata sem uma decisão documentada.

**Regra de isolamento:** qualquer listagem, consulta, edição ou exclusão de entidades pertencentes a uma igreja deve usar o `church_id` do JWT validado no servidor. Nunca confiar no `ChurchId` que chega pelo navegador. Cobrir também endpoints de portal do membro, dashboards, relatórios, escalas e configurações.

### E-mail e contas

O código atual cria índice único global para `Users.Email`. Preservar esse comportamento nesta entrega, a menos que o requisito de negócio do grupo permita o mesmo e-mail em igrejas diferentes. Não remover a unicidade sem rever login, cadastro, índices e tratamento de conflito.

### Datas e fuso horário

Npgsql exige consistência no uso de `DateTime` com colunas `TIMESTAMPTZ`. Padronizar gravação em UTC. A interface deve enviar datas/horários com offset ou converter explicitamente o horário local para ISO UTC antes da requisição. Ao exibir, converter para o fuso local do usuário. Testar eventos e escalas para evitar diferenças de horas.

---

## 5. Trabalho obrigatório no banco e no Entity Framework Core

Esta é a principal etapa de banco. Não improvisar tabelas somente no bootstrap de inicialização.

### 5.1 Criar migrações PostgreSQL versionadas

1. Auditar o `AppDbContext.cs`, todas as entidades, controllers e validações.
2. Comparar o modelo EF com o esquema atual do Supabase, depois de confirmar que o projeto correto está ativo.
3. Criar migração inicial PostgreSQL revisada (por exemplo, `InitialPostgresSchema`) usando EF Core.
4. Garantir que a migração gere todas as oito tabelas, FKs, índices, constraints e tipos definidos.
5. Revisar o SQL gerado antes de aplicar. Não usar `EnsureCreated` como mecanismo permanente de evolução.
6. Aplicar a migração primeiro no banco de desenvolvimento/homologação. Fazer consulta de verificação nas tabelas, FKs e índices.
7. Versionar os arquivos de migração no GitHub e documentar o comando para reproduzir o banco.

Comandos de referência (ajustar ao ambiente e à versão de ferramentas instalada):

```bash
dotnet restore backend/ChurchManager.Api/ChurchManager.Api.csproj
dotnet build backend/ChurchManager.Api/ChurchManager.Api.csproj

dotnet ef migrations add InitialPostgresSchema \
  --project backend/ChurchManager.Api/ChurchManager.Api.csproj \
  --startup-project backend/ChurchManager.Api/ChurchManager.Api.csproj

dotnet ef migrations script \
  --project backend/ChurchManager.Api/ChurchManager.Api.csproj \
  --startup-project backend/ChurchManager.Api/ChurchManager.Api.csproj

dotnet ef database update \
  --project backend/ChurchManager.Api/ChurchManager.Api.csproj \
  --startup-project backend/ChurchManager.Api/ChurchManager.Api.csproj
```

A connection string deve ser fornecida por variável de ambiente/User Secrets durante esses comandos. Nunca colocar senha real no comando salvo, no histórico Git ou na documentação.

### 5.2 Resolver a inicialização atual

- Desativar `Database__AutoCreate=true` como solução permanente.
- Substituir a lógica de `EnsureCreatedAsync` e o bootstrap SQL manual por migrações revisadas e controladas.
- Não executar DDL destrutivo automaticamente no início de cada instância.
- Se o Supabase já tiver tabelas, inspecionar primeiro. Não executar uma migração inicial às cegas sobre tabelas existentes.
- Não apagar, renomear ou sobrescrever tabelas existentes sem backup e plano de migração.
- Se o banco do projeto contiver dados ou tabelas de outro sistema, criar uma estratégia isolada (projeto Supabase dedicado ou schema separado) em vez de misturar os objetos.

### 5.3 Padronizar o provedor

Como o destino oficial agora é PostgreSQL:

- Configurar PostgreSQL como único provedor da aplicação final.
- Remover a dependência Pomelo/MySQL do `.csproj` caso não exista necessidade real de continuar suportando MySQL.
- Remover ramificações MySQL de `Program.cs` e o Compose MySQL, ou marcá-los claramente como legado fora da implantação oficial.
- Atualizar `appsettings.json` para exemplos sem credenciais e com provedor PostgreSQL.
- Garantir que `Npgsql.EntityFrameworkCore.PostgreSQL` seja compatível com a versão do EF Core utilizada.
- Não deixar o projeto iniciar silenciosamente usando MySQL quando a variável de ambiente estiver ausente. Falhar com mensagem clara se não houver connection string PostgreSQL.

---

## 6. Conexão Supabase -> API C# no Render

O backend deve receber a conexão PostgreSQL somente pelo ambiente do Render.

### Variáveis esperadas no serviço da API

| Variável | Valor |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_URLS` | `http://+:8080` |
| `CHURCHMANAGER_DB_PROVIDER` | `postgres` |
| `ConnectionStrings__DefaultConnection` | Connection string PostgreSQL do Supabase, como segredo |
| `JWT_KEY` | Segredo aleatório, exclusivo e com pelo menos 32 caracteres |
| `JWT_ISSUER` | Emissor definido pela API |
| `JWT_AUDIENCE` | Audiência definida pela API |
| `FRONTEND_ORIGIN` | Origem HTTPS exata do site de produção no Vercel |
| `AUTH_ALLOW_PUBLIC_REGISTRATION` | `false` depois do cadastro inicial do administrador |
| `Database__AutoCreate` | `false` após implementar migrações |

Os nomes precisam corresponder exatamente ao que o `Program.cs` lê. Não colocar a connection string em `render.yaml`; usar campo de segredo/variável privada no painel do Render.

### Escolha do endpoint de conexão Supabase

O Supabase disponibiliza conexão direta e poolers. Consultar a opção **Connect** no painel do projeto:

- **Direct connection:** adequada para backend persistente quando a rede do Render consegue alcançar o endpoint (a conexão direta pode depender de IPv6 conforme o projeto/plano).
- **Supavisor — Session mode:** alternativa indicada para backend persistente em rede IPv4-only.
- **Transaction mode:** destinado principalmente a conexões curtas/efêmeras; não escolher automaticamente para uma API ASP.NET Core persistente com pool do Npgsql.

Testar a conectividade real a partir do Render. Não presumir que o endpoint direto funcionará na rede do serviço.

A API deve usar SSL/TLS, pool de conexões Npgsql com limites compatíveis com o plano Supabase, timeout de conexão e tratamento correto de falhas. Não abrir uma conexão nova manualmente por requisição se o EF Core já gerencia o pool.

Documentação oficial:
- Conectar ao PostgreSQL: https://supabase.com/docs/guides/database/connecting-to-postgres
- Migrações de banco: https://supabase.com/docs/guides/deployment/database-migrations
- Segurança do banco / RLS: https://supabase.com/docs/guides/database/postgres/row-level-security

### Segurança do banco

- Nunca expor a senha do PostgreSQL ou credenciais privilegiadas no Vercel, frontend, GitHub ou navegador.
- Não colocar `service_role`, `secret key` ou senha de banco em variável `VITE_*`.
- Como a API é a única camada de dados, não conceder acesso público desnecessário às tabelas pela Data API.
- Revisar RLS para tabelas no schema exposto `public`. Habilitar RLS e criar políticas coerentes sempre que houver acesso por `anon`/`authenticated` via Data API.
- Importante: políticas RLS baseadas em `auth.uid()` não protegem automaticamente chamadas feitas pela API com um usuário de banco privilegiado e JWT próprio da aplicação. O isolamento principal desta arquitetura deve estar na API, com `church_id` validado e filtros em todas as consultas. Se o Antigravity adotar RLS para a API, deverá usar uma role de runtime restrita e um contexto de igreja transacional seguro, nunca confiar em um valor enviado livremente pelo cliente.
- Ativar e testar backup/exportação antes de inserir dados que precisem ser preservados.

---

## 7. Configuração Vercel -> API Render

O projeto Vercel deve conectar ao repositório GitHub e fazer build da pasta `frontend`.

Configuração esperada:

- **Framework:** Vite.
- **Root Directory:** `frontend`.
- **Install Command:** `npm ci` (ou `npm install` enquanto não houver lockfile; preferir gerar e versionar `package-lock.json`).
- **Build Command:** `npm run build`.
- **Output Directory:** `dist`.

Variáveis de ambiente no projeto Vercel:

```dotenv
VITE_DEMO_MODE=false
VITE_API_URL=https://URL-PUBLICA-DA-API-RENDER
```

Depois de alterar `VITE_API_URL`, executar novo deploy/build porque variáveis `VITE_*` são incorporadas no bundle.

A API no Render precisa ter `FRONTEND_ORIGIN` igual à origem de produção do Vercel, sem caminho adicional e sem barra final. A política CORS deve aceitar essa origem específica. Não usar `AllowAnyOrigin` em produção.

Configurar fallback SPA para que rotas do React retornem `index.html`, e testar abrir/atualizar diretamente cada rota.

---

## 8. Ajuste obrigatório do Render Blueprint

O `render.yaml` atual ainda prevê um site estático hospedado no Render e usa o domínio do Render como origem do frontend. Isso conflita com a arquitetura final.

O arquivo deve ser revisado para que o blueprint do Render mantenha apenas a API Docker. Não criar um segundo frontend no Render. Manter:

- serviço Web API `churchmanager-api-tcc` (ou nome já existente confirmado no painel);
- Dockerfile `backend/ChurchManager.Api/Dockerfile`;
- contexto de build na raiz do repositório;
- porta 8080;
- health check `/health/ready`;
- PostgreSQL do Supabase por variável secreta;
- CORS para o domínio Vercel real;
- segredo JWT gerado/guardado pelo Render.

Antes de sincronizar ou criar Blueprint, revisar a prévia. Não criar serviços duplicados caso já exista uma API ativa.

---

## 9. Checklist de implementação para o Antigravity

### Fase A — Banco de dados (prioridade máxima)

- [ ] Confirmar o projeto Supabase correto e ativo.
- [ ] Inspecionar tabelas, schemas, colunas, índices e constraints atuais.
- [ ] Decidir projeto dedicado ou schema isolado se já houver outros dados.
- [ ] Auditar as oito entidades e o mapeamento EF Core.
- [ ] Gerar migração PostgreSQL inicial completa e versionada.
- [ ] Incluir todas as FKs e regras de exclusão.
- [ ] Incluir índices e constraints de valores/datas.
- [ ] Corrigir tipo e conversão de data/hora para UTC.
- [ ] Aplicar migração em homologação e verificar com SQL.
- [ ] Documentar como recriar o banco do zero.

### Fase B — API C# (prioridade máxima)

- [ ] Usar exclusivamente PostgreSQL/Npgsql na configuração final.
- [ ] Corrigir `Program.cs` e `appsettings.json`.
- [ ] Remover caminho MySQL não utilizado e dependências obsoletas.
- [ ] Retirar `EnsureCreated`/bootstrap como mecanismo permanente.
- [ ] Confirmar conexão com Supabase a partir do Render.
- [ ] Confirmar autenticação, criação de usuário e login com hash de senha.
- [ ] Confirmar JWT e isolamento por igreja em todos os endpoints.
- [ ] Confirmar CRUD de membros, ministérios, eventos, financeiro, cargos e escalas.
- [ ] Confirmar configurações da igreja e portal do membro.
- [ ] Corrigir tratamento global de erros e respostas HTTP.
- [ ] Manter Swagger apenas em desenvolvimento, salvo decisão explícita.
- [ ] Confirmar `/health` e `/health/ready`.

### Fase C — Frontend

- [ ] Manter React + JavaScript/JSX + Vite; não introduzir TypeScript.
- [ ] Definir `VITE_DEMO_MODE=false` em produção.
- [ ] Definir `VITE_API_URL` com a URL real do Render.
- [ ] Garantir que os serviços HTTP usem a API, sem acesso direto ao banco.
- [ ] Remover dados fictícios das telas quando o modo real estiver ativo.
- [ ] Exibir estados de carregamento, vazio e erro sem travar a interface.
- [ ] Validar login e todas as operações CRUD após atualizar a página.
- [ ] Preservar a identidade visual e os fluxos existentes do Figma.

### Fase D — Deploy e integração

- [ ] API Docker implantada no Render a partir de `main`.
- [ ] Variáveis secretas configuradas no Render.
- [ ] Frontend implantado no Vercel a partir da pasta `frontend`.
- [ ] Variáveis `VITE_*` configuradas no Vercel.
- [ ] CORS liberado apenas para o domínio Vercel de produção.
- [ ] Rotas da SPA funcionando com atualização direta.
- [ ] Health check comprova conexão real com PostgreSQL.
- [ ] Teste de persistência concluído após reiniciar API e abrir outro navegador/dispositivo.

### Fase E — validação para apresentação

- [ ] Executar `npm ci` e `npm run build`.
- [ ] Executar `dotnet restore` e `dotnet build`.
- [ ] Executar testes de integração contra PostgreSQL de homologação.
- [ ] Testar CRUD em cada módulo.
- [ ] Testar usuário não autenticado e token expirado.
- [ ] Testar duas igrejas e comprovar que uma não acessa dados da outra.
- [ ] Testar perfis/permissões conforme o que estiver realmente implementado.
- [ ] Testar celular, desktop e tela/TV da feira.
- [ ] Confirmar que não existem erros relevantes no console do navegador, logs do Render ou logs do PostgreSQL.
- [ ] Preparar uma demonstração com dados fictícios identificados como demonstração.
- [ ] Preparar roteiro de contingência caso a API gratuita demore para iniciar ou a internet falhe.
- [ ] Atualizar README e documentação somente depois de verificar o que foi realmente entregue.

---

## 10. Testes mínimos de aceite

A adaptação só pode ser considerada concluída quando estes cenários passarem:

1. Abrir o site Vercel e cadastrar a conta administrativa inicial de forma controlada.
2. Sair e entrar novamente usando a API hospedada.
3. Criar um membro pela interface; confirmar que a linha aparece no PostgreSQL.
4. Atualizar a página e confirmar que o membro continua presente.
5. Editar e excluir o registro e confirmar a alteração no banco.
6. Repetir o procedimento com ministérios, eventos, movimentações financeiras, cargos e escalas.
7. Abrir o site em outro navegador ou celular e confirmar que os mesmos dados são retornados pela API.
8. Tentar consultar/alterar um registro de outra igreja e confirmar bloqueio.
9. Reiniciar ou redeployar a API e confirmar que os dados persistem.
10. Verificar `GET /health/ready` retornando sucesso somente quando o banco estiver acessível.

Não usar apenas `GET /health` como prova de integração: esse endpoint confirma que o processo HTTP responde, não que o PostgreSQL está conectado.

---

## 11. Entregáveis que o Antigravity deve devolver

Ao terminar, deixar no repositório:

1. Código C# adaptado e compilando com Npgsql/PostgreSQL.
2. Migrações PostgreSQL versionadas e SQL revisado.
3. `render.yaml` atualizado apenas para a API.
4. Frontend configurado para consumir a API do Render via Vercel.
5. `.env.example` sem senhas, tokens ou dados reais.
6. Documentação atualizada: arquitetura, instalação local, variáveis, migração, deploy e testes.
7. Relatório final com o que foi testado de verdade, URLs dos ambientes, pendências conhecidas e evidências dos testes.

O Antigravity não deve marcar tarefas como concluídas sem build, execução ou teste correspondente. Se alguma ação depender de credencial, acesso ao painel, projeto Supabase ativo ou domínio ainda não conhecido, registrar a dependência sem inventar valores.

---

## 12. Instrução direta para execução no Antigravity

> Leia este documento por completo e audite o repositório atual antes de alterar qualquer arquivo. Adapte o ChurchMennager existente para a arquitetura oficial: React/Vite no Vercel, API ASP.NET Core em C# no Render e PostgreSQL no Supabase. O PostgreSQL é o único banco da versão final. Não mantenha Neon nem MySQL como destino de produção. Preserve as telas, os fluxos, a estrutura React/JSX e a identidade visual do Figma. Complete o esquema PostgreSQL com migrações versionadas, PKs, FKs, índices, constraints, tipos corretos e isolamento por igreja; alinhe o AppDbContext, entidades, Program.cs, variáveis e serviços HTTP. Corrija datas para UTC e não exponha credenciais no frontend. Ajuste o Render para hospedar somente a API e configure o frontend no Vercel para chamar a URL pública da API. Execute builds e testes reais, corrija os erros encontrados, atualize a documentação e faça commits pequenos e claros. Não use EnsureCreated como substituto de migrações, não apague dados existentes e não declare integração concluída sem comprovar persistência no Supabase via API.

---

## 13. Bloqueios externos a confirmar antes do deploy

- Confirmar qual projeto Supabase deve ser usado e se está ativo. Não conectar a aplicação a um projeto que pertença a outro sistema.
- Confirmar no painel Supabase a connection string adequada à rede do Render.
- Confirmar o domínio final do Vercel para preencher `FRONTEND_ORIGIN` no Render.
- Confirmar o workspace correto do Render antes de criar/alterar serviços.
- Confirmar o projeto Vercel que está conectado ao repositório `joots28/ChurchMennager`.

**Importante:** credenciais e senhas devem ser inseridas diretamente nos painéis dos provedores ou em User Secrets. Nunca enviá-las em texto aberto no chat, commitá-las ou colocá-las neste arquivo.
