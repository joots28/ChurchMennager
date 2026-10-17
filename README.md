<div align="center">

# ⛪ ChurchManager

### Gestão inteligente, organizada e acessível para comunidades religiosas

**Projeto acadêmico / TCC** · Aplicação web responsiva · Front-end + API REST + banco relacional

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=111827">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white">
  <img alt="C%23" src="https://img.shields.io/badge/C%23-.NET%208-512BD4?logo=dotnet&logoColor=white">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white">
  <img alt="Status" src="https://img.shields.io/badge/status-em%20desenvolvimento-orange">
</p>

[Visão geral](#-visão-geral) · [Funcionalidades](#-funcionalidades) · [Arquitetura](#-arquitetura) · [Instalação](#-como-executar-localmente) · [Deploy](#-publicação-no-render) · [Segurança](#-segurança-e-transparência)

</div>

---

## ✨ Visão geral

O **ChurchManager** é um sistema de gestão voltado à organização administrativa de igrejas e comunidades religiosas. A proposta é reunir em um só ambiente informações e rotinas que muitas vezes ficam distribuídas entre planilhas, mensagens e registros manuais — com uma interface que se adapta a **computadores, tablets e celulares**.

O projeto faz parte de um trabalho acadêmico/TCC e foi estruturado para estudar e demonstrar o desenvolvimento *full-stack*: interface React, API independente em C# e persistência relacional em MySQL. A organização modular busca deixar cada tela, componente, estilo e responsabilidade técnica mais fácil de localizar, compreender e manter.

> **Status do projeto:** em desenvolvimento. Esta documentação descreve a base e o escopo planejado. Antes do uso real, é necessário instalar, executar e validar os fluxos completos, revisar as configurações de segurança e realizar os testes descritos em `docs/`. Não use esta versão para armazenar dados reais de membros ou informações financeiras sem a homologação necessária.

## 🎯 Objetivos e relevância

- **Centralização:** organizar informações administrativas em módulos coerentes.
- **Planejamento:** facilitar a consulta de membros, ministérios, eventos e escalas.
- **Acessibilidade:** oferecer navegação responsiva em diferentes tamanhos de tela.
- **Manutenção:** separar a interface, os estilos, os serviços HTTP, a API e o banco.
- **Aprendizagem:** aplicar conceitos de componentes reutilizáveis, API REST, autenticação, validação, modelagem de dados e implantação.
- **Evolução responsável:** documentar limitações e pendências em vez de apresentar recursos experimentais como prontos para produção.

## 🧩 Funcionalidades

| Módulo | Propósito | Situação nesta base |
|---|---|---|
| 🔐 Acesso | Login, cadastro e recuperação de acesso | Há fluxos de login/cadastro; recuperação por e-mail ainda requer integração |
| 📊 Painel inicial | Visão resumida das informações administrativas | Parte dos indicadores utiliza dados demonstrativos |
| 👥 Membros | Consultar e administrar registros | Endpoints CRUD previstos/disponíveis; validar a integração ponta a ponta |
| 🙏 Ministérios | Organizar grupos e ministérios | Módulo administrativo |
| 📅 Eventos | Registrar datas, horários, locais e status | Notificações automáticas não implementadas |
| 💰 Financeiro | Registrar entradas e saídas para acompanhamento | Não processa pagamentos nem se integra a instituições bancárias |
| 🗓️ Escalas | Organizar equipes, datas e horários | Validar todos os fluxos de atribuição |
| 🪪 Cargos e funções | Registrar cargos e informações relacionadas a permissões | Permissões granulares por cargo ainda precisam ser implementadas |
| ⚙️ Configurações | Manter informações institucionais | Depende da API e das permissões configuradas |
| 🧑‍🤝‍🧑 Portal do membro | Acesso a perfil, eventos, escalas e orientações | A experiência visual existe; integração completa requer endpoints e regras próprios |
| 📤 Exportação CSV | Exportar informações tabulares | Conferir os resultados antes de usar os arquivos exportados |
| 🎨 Tema e responsividade | Tema claro/escuro e adaptação a diferentes telas | Validar em navegadores e dispositivos reais |
| 🧪 Demonstração | Explorar telas com dados fictícios sem API ativa | Apenas demonstração; não equivale a persistência compartilhada |

A tabela diferencia a existência de telas e estruturas de uma integração plenamente homologada. A conclusão de cada módulo deve ser confirmada por testes no ambiente configurado.

## 🛠️ Tecnologias

| Camada | Tecnologias | Responsabilidade |
|---|---|---|
| **Front-end** | React 18, JavaScript/JSX, Vite, CSS | Interface, navegação, componentes e experiência responsiva |
| **API** | C#, ASP.NET Core 8 | Endpoints HTTP, regras de negócio, validação e autorização |
| **Persistência** | Entity Framework Core, Pomelo, MySQL 8 | Mapeamento objeto-relacional e armazenamento |
| **Autenticação** | JWT Bearer, PasswordHasher | Identidade e proteção de credenciais na API |
| **Ambiente** | Docker Compose, Dockerfile | Execução local e empacotamento da API |
| **Hospedagem planejada** | Render | Publicação do front-end e da API após configuração e validação |

## 🧱 Arquitetura

```text
┌────────────────────────────────────┐
│ Navegador / dispositivo móvel      │
│ React + Vite + CSS                 │
└──────────────────┬─────────────────┘
                   │ HTTPS / JSON / JWT
                   ▼
┌────────────────────────────────────┐
│ API REST                           │
│ C# + ASP.NET Core + validação      │
└──────────────────┬─────────────────┘
                   │ Entity Framework Core
                   ▼
┌────────────────────────────────────┐
│ Banco relacional                   │
│ MySQL 8                            │
└────────────────────────────────────┘
```

O navegador **não acessa o banco diretamente**. A comunicação com os dados passa pela API, responsável por validar as solicitações e aplicar as regras do servidor.

### Organização do repositório

```text
ChurchMennager/
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/      # elementos de interface reutilizáveis
│       ├── features/        # telas separadas por domínio
│       ├── hooks/           # estado e ações reutilizáveis
│       ├── services/        # autenticação e comunicação HTTP
│       ├── data/            # dados fictícios para demonstração
│       └── utils/            # validação, formatação e exportação
├── backend/
│   ├── ChurchManager.Api/
│   │   ├── Controllers/
│   │   ├── Data/
│   │   ├── Models/
│   │   ├── Validation/
│   │   └── Dockerfile
│   └── database/
│       ├── schema.sql
│       └── migrations/
├── docs/                    # arquitetura, segurança e plano de deploy
├── preview/                 # prévia visual independente
├── .github/workflows/       # automações de validação
├── docker-compose.yml
└── render.yaml
```

O front-end é uma *Single Page Application* (SPA): o navegador carrega um HTML inicial e o React compõe as telas a partir dos módulos JSX. Cada recurso continua separado em arquivos próprios; isso evita duplicar um documento HTML completo por tela.

## ✅ Pré-requisitos

- [Node.js LTS e npm](https://nodejs.org/) para o front-end.
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) para a API.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ou Docker Engine com Docker Compose para o MySQL.
- Git para versionamento.

## 🚀 Como executar localmente

### 1. Obter o código

```bash
git clone https://github.com/joots28/ChurchMennager.git
cd ChurchMennager
```

### 2. Subir o banco de dados

Na raiz do projeto:

```bash
docker compose up -d mysql
```

O serviço local usa a porta `3307`. O script `backend/database/schema.sql` é aplicado ao inicializar um volume novo. Caso exista um volume anterior, o MySQL não reaplica automaticamente os scripts de inicialização.

### 3. Restaurar e executar a API

```bash
cd backend/ChurchManager.Api
dotnet restore
dotnet run --urls http://localhost:5080
```

Teste o endpoint de saúde em `http://localhost:5080/health`. A disponibilidade do Swagger depende da configuração de ambiente da API.

### 4. Configurar e iniciar a interface

Em outro terminal:

```bash
cd frontend
```

Crie o arquivo local a partir do exemplo (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

Instale as dependências e inicie o Vite:

```bash
npm install
npm run dev
```

Acesse o endereço informado pelo Vite, normalmente `http://localhost:5173`. Para testar os módulos conectados, mantenha a API e o banco em execução.

### Modo de demonstração

No arquivo `frontend/.env.local`, configure:

```dotenv
VITE_DEMO_MODE=true
VITE_API_URL=http://localhost:5080
```

Reinicie o Vite depois de alterar as variáveis. O modo de demonstração usa dados fictícios no navegador e **não deve ser usado como autenticação nem armazenamento de produção**. Para voltar ao modo conectado, defina `VITE_DEMO_MODE=false`.

## ☁️ Publicação no Render

O arquivo `render.yaml` e o plano em `docs/PLANO-DE-DEPLOY.md` são pontos de partida; eles **não significam que os serviços já estejam publicados**.

| Serviço | Configuração planejada |
|---|---|
| Front-end | Render Static Site · diretório `frontend` · build `npm install && npm run build` · diretório publicado `dist` |
| API | Render Web Service · Dockerfile em `backend/ChurchManager.Api/Dockerfile` |
| Banco | MySQL compatível com o provedor configurado na API |

Antes de publicar, configure a chave JWT, a string de conexão do banco e a origem autorizada do front-end nas variáveis de ambiente. Defina `VITE_API_URL` com a URL HTTPS pública da API e faça um novo build do Vite depois de alterar variáveis usadas no build.

**Atenção ao banco:** esta versão usa MySQL. PostgreSQL não é um substituto direto; a troca exige migrar o provedor, o esquema e as configurações e testar a aplicação. Confira as condições atuais de hospedagem, armazenamento persistente, backups e limites do plano antes de decidir a arquitetura final.

## 🔐 Segurança e transparência

A base inclui mecanismos úteis para desenvolvimento, mas ainda precisa de revisão técnica e testes antes de lidar com informações reais:

- Hash de senha no servidor, em vez de armazenar senhas em texto puro.
- Autenticação por token e validação de solicitações protegidas.
- Validação de dados e controles de requisição previstos na API.
- CORS configurável para restringir origens autorizadas.
- Modo de demonstração separado, com informações fictícias.

### Pendências para uma versão de produção

- Recuperação/verificação de e-mail e MFA, se aplicável ao modelo de acesso.
- Permissões granulares por cargo e revisão dos limites entre igrejas/organizações.
- Auditoria consistente de operações sensíveis.
- Testes automatizados, testes integrados e homologação em ambiente limpo.
- Política de privacidade, retenção de dados, backups e procedimento de restauração.
- Revisão de segredos e configurações antes de aceitar usuários reais.

Não publique chaves, senhas ou strings de conexão no Git. Use variáveis de ambiente e mantenha arquivos locais de configuração fora do versionamento.

## 📚 Documentação complementar

- [Plano de implantação](docs/PLANO-DE-DEPLOY.md)
- [Segurança e validação](docs/SEGURANCA-E-VALIDACAO.md)
- [Status e validação](docs/STATUS-E-VALIDACAO.md)
- [Esquema SQL](backend/database/schema.sql)

## 🧪 Checklist de validação

1. Instalação limpa das dependências e build do front-end com `npm run build`.
2. Restauração e compilação da API com `dotnet restore` e `dotnet build`.
3. Inicialização do banco a partir de um volume limpo.
4. Teste de login, autorização, operações CRUD e tratamento de erros.
5. Teste em telas pequenas, navegação, estados vazios e acessibilidade básica.
6. Verificação de HTTPS, CORS, secrets e persistência no ambiente de hospedagem.

Os builds completos ainda não foram confirmados nesta sessão. Essas verificações são etapas obrigatórias, não resultados já obtidos.

## 🤝 Contribuição

Crie uma branch por alteração, mantenha componentes e estilos organizados por responsabilidade, evite adicionar segredos e descreva as mudanças no pull request. Atualize a documentação e inclua testes pertinentes ao alterar funcionalidades.

```bash
git checkout -b feat/nome-da-melhoria
git add .
git commit -m "feat: descreva a melhoria"
git push -u origin feat/nome-da-melhoria
```

## 👨‍💻 Contexto acadêmico

O ChurchManager busca aplicar, em um único projeto, conhecimentos de desenvolvimento web, arquitetura cliente-servidor, APIs, persistência relacional, usabilidade, segurança e implantação. A documentação explicita o que está estruturado e o que ainda precisa ser comprovado por testes, apoiando a apresentação e a evolução responsável do TCC.

<div align="center">

**ChurchManager** · Organização, clareza e tecnologia a serviço da comunidade.

<sub>Projeto educacional em desenvolvimento. A documentação deve acompanhar as mudanças reais do código.</sub>

</div>
