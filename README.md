<div align="center">

# ChurchManager

### Gestão organizada para comunidades e instituições religiosas

**Projeto acadêmico / TCC · Web responsiva · React + C# / ASP.NET Core + PostgreSQL remoto / MySQL local**

[Objetivo](#-objetivo-do-projeto) · [Funcionalidades](#-funcionalidades) · [Tecnologias](#-tecnologias) · [Executar localmente](#-executar-localmente) · [Arquitetura](#-arquitetura) · [Implantação](#-implantação) · [Segurança](#-segurança-e-limitações)

</div>

---

## 📌 Sobre o projeto

O **ChurchManager** é uma proposta de sistema web para centralizar rotinas administrativas de uma igreja ou comunidade religiosa em uma interface responsiva, utilizável em computadores, tablets e celulares. A ideia é substituir parte dos controles dispersos em anotações e planilhas por módulos organizados, com informações estruturadas e acesso controlado.

O projeto está sendo desenvolvido como trabalho acadêmico/TCC. Esta versão reúne uma base de front-end, uma API independente e um esquema de banco de dados. Ela **não deve ser confundida com uma versão de produção pronta**: alguns fluxos ainda são demonstrativos e os builds completos e os testes integrados precisam ser executados antes de uma publicação estável.

## 🎯 Objetivo do projeto

- Centralizar informações administrativas e operacionais em um único ambiente.
- Facilitar a organização de membros, ministérios, eventos, escalas, cargos e registros financeiros.
- Oferecer uma experiência coerente em dispositivos móveis e desktop, sem manter duas aplicações separadas.
- Separar interface, regras de negócio, API e persistência para facilitar manutenção e evolução.
- Aplicar práticas de desenvolvimento estudadas no curso: componentes reutilizáveis, validação no servidor, autenticação, organização modular, configuração por ambiente e documentação técnica.

### Por que ele é importante?

Uma organização comunitária depende de informações confiáveis e acessíveis às pessoas certas. Reunir essas rotinas em módulos bem definidos pode reduzir retrabalho, facilitar o planejamento e apoiar a continuidade das atividades. Do ponto de vista educacional, o ChurchManager também permite praticar a construção de uma aplicação full-stack, desde a interface até a API e o modelo relacional, deixando explícitos os cuidados de segurança e as limitações que ainda precisam ser resolvidas.

## 🧩 Funcionalidades

Os itens abaixo descrevem o código desta versão. Quando uma função ainda é visual, local ou parcial, isso está sinalizado para não confundir uma demonstração com um serviço já integrado.

| Módulo | O que oferece nesta versão | Situação / observação |
|---|---|---|
| Acesso | Tela de login, cadastro em duas etapas e telas de recuperação de acesso | Login e cadastro possuem fluxo na API; recuperação por e-mail ainda não está integrada |
| Painel inicial | Resumo visual e indicadores da rotina administrativa | Dados podem ser demonstrativos; validar as métricas contra a API antes de uso real |
| Membros | Listagem e operações de cadastro, consulta, edição e exclusão | API REST disponível; validar o fluxo completo em ambiente local |
| Ministérios | Organização e manutenção de ministérios | API REST disponível |
| Eventos | Dados de eventos, datas, horários, local e status | API REST disponível; notificações automáticas não estão implementadas |
| Financeiro | Registro de entradas e saídas e apresentação de indicadores | É um controle administrativo; não processa pagamentos reais nem se conecta a bancos |
| Escalas | Organização de equipes, ministérios, datas e horários | API REST disponível; confirmar atribuição de integrantes durante homologação |
| Cargos | Cadastro de cargos e informações sobre permissões | As permissões exibidas são informativas; ainda não existe RBAC granular por cargo |
| Configurações da igreja | Consulta e atualização de dados institucionais | API de configurações disponível para a conta administrativa autenticada |
| Portal do membro | Área visual com início, eventos, escalas, perfil e orientação sobre contribuições | O portal ainda precisa de endpoints e regras próprios para ser considerado integrado à produção |
| Exportação CSV | Utilitário para exportar dados tabulares | Validar cada exportação manualmente; a rotina inclui neutralização de valores que poderiam ser interpretados como fórmulas |
| Tema visual | Alternância entre tema claro e escuro | Recurso de interface |
| Layout responsivo | Componentes e navegação adaptáveis a diferentes larguras | Requer validação em dispositivos e navegadores reais |
| Modo de demonstração | Dados fictícios locais para demonstrar as telas sem API ativa | Somente para demonstração; não oferece persistência compartilhada entre usuários |

## 🛠️ Tecnologias

### Front-end

- **React 18** para composição das telas e componentes.
- **JavaScript / JSX**, sem TypeScript nesta versão.
- **Vite** para desenvolvimento e geração dos arquivos estáticos.
- **CSS modular por componente** para isolar estilos e facilitar manutenção.
- `fetch` para comunicação HTTP com a API.

### Back-end

- **C# e ASP.NET Core (.NET 8)** para a API REST.
- **Entity Framework Core** com provedores **Pomelo para MySQL local** e **Npgsql para PostgreSQL remoto**.
- **JWT Bearer** para autenticação de chamadas protegidas.
- `PasswordHasher` do ASP.NET Core para armazenar hashes de senha em vez de texto puro.
- Validação no servidor, limitação de tentativas em endpoints de autenticação, autorização por função administrativa e isolamento por igreja nos CRUDs preparados.

### Banco de dados e ambiente

- **MySQL 8** para desenvolvimento local e **PostgreSQL** para hospedagem remota.
- **Docker Compose** para subir o MySQL local.
- **Dockerfile** da API e `render.yaml` como ponto de partida para implantação no Render.

## 🧱 Arquitetura

A solução está separada em três partes:

```text
Navegador (React + Vite)
        │ HTTPS / JSON / JWT
        ▼
API REST (C# / ASP.NET Core)
        │ Entity Framework Core
        ▼
Banco remoto PostgreSQL (Render) ou MySQL local
```

O front-end não deve acessar o banco diretamente. O navegador conversa com a API; a API valida a identidade e as permissões, aplica as regras e então consulta ou atualiza o banco.

### Organização do repositório

```text
ChurchManager/
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx                 # composição principal
│       ├── main.jsx                # inicialização do React
│       ├── config/                 # navegação e metadados
│       ├── components/
│       │   ├── layout/             # estrutura, menu e cabeçalho
│       │   └── ui/                 # botões, campos, tabelas, modais etc.
│       ├── features/               # páginas e módulos por domínio
│       ├── hooks/                  # estado e ações reutilizáveis
│       ├── services/               # autenticação e chamadas HTTP
│       ├── data/                   # dados fictícios para demonstração
│       └── utils/                  # validação, formatação e exportação
├── backend/
│   ├── ChurchManager.Api/
│   │   ├── Controllers/            # endpoints REST
│   │   ├── Data/                   # contexto de dados
│   │   ├── Models/                 # entidades e contratos
│   │   ├── Validation/             # validação no servidor
│   │   └── Dockerfile
│   └── database/
│       ├── schema.sql
│       └── migrations/
├── docs/                            # decisões, arquitetura e validação
├── preview/                         # prévia independente para consulta visual
├── docker-compose.yml                # banco MySQL de desenvolvimento
└── render.yaml                       # modelo de implantação
```

**Por que existe apenas um `index.html` no front-end?** O React é uma SPA (*Single Page Application*): o HTML inicial carrega a aplicação e os arquivos JSX determinam as telas. Cada módulo continua separado, sem duplicar um HTML completo para cada página.

## 🚀 Executar localmente

### Pré-requisitos

- Node.js LTS e npm.
- .NET SDK 8.
- Docker Desktop ou Docker Engine com Docker Compose.

### 1. Iniciar o MySQL

Na raiz do projeto:

```bash
docker compose up -d mysql
```

O banco é publicado localmente na porta `3307`. O script `backend/database/schema.sql` é aplicado na inicialização de um volume novo. Se o volume já existir, o MySQL não reaplica automaticamente o script de inicialização.

### 2. Iniciar a API

Em um terminal:

```bash
cd backend/ChurchManager.Api
dotnet restore
dotnet run --urls http://localhost:5080
```

A API deve responder ao teste de saúde em `http://localhost:5080/health`. Em ambiente de desenvolvimento, a documentação Swagger fica disponível quando a API estiver executando.

### 3. Iniciar o front-end

Em outro terminal:

```bash
cd frontend
```

Crie seu arquivo local a partir do exemplo (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

Depois execute:

```bash
npm install
npm run dev
```

Abra o endereço local informado pelo Vite (normalmente `http://localhost:5173`). A API precisa estar ativa e o banco disponível para testar o modo conectado.

### Modo de demonstração sem API

No `frontend/.env.local`, defina:

```dotenv
VITE_DEMO_MODE=true
VITE_API_URL=http://localhost:5080
```

Reinicie o Vite após alterar variáveis. O modo de demonstração trabalha com dados fictícios no navegador; não é adequado para informações reais e não serve como autenticação de produção. O acesso de demonstração aparece na tela de login quando esse modo é ativado.

Para voltar ao modo conectado, defina `VITE_DEMO_MODE=false` e deixe a API e o banco funcionando.

## ☁️ Implantação

O `render.yaml` é um **modelo inicial**, não uma implantação já realizada. O plano de publicação previsto separa o site estático da API em Docker. Leia [`docs/PLANO-DE-DEPLOY.md`](docs/PLANO-DE-DEPLOY.md) antes de criar serviços.

- **Front-end:** Render Static Site, raiz `frontend`, comando `npm install && npm run build`, diretório publicado `dist`.
- **API:** Render Web Service usando Dockerfile em `backend/ChurchManager.Api/Dockerfile` e contexto da raiz do repositório.
- **Banco:** a API mantém MySQL para desenvolvimento local e aceita PostgreSQL remoto via Npgsql. O modelo de implantação conecta a API a churchmanager-tcc-db e cria o esquema inicial somente quando Database__AutoCreate=true e o banco está vazio. **Atenção:** o PostgreSQL gratuito do Render expira 30 dias após a criação; migre para um banco com retenção e backups antes de armazenar dados importantes.
- **Configuração obrigatória:** `JWT_KEY`, string de conexão e `FRONTEND_ORIGIN` devem ser informados nas variáveis de ambiente do provedor. No serviço estático, defina `VITE_API_URL` para a URL HTTPS pública da API e faça novo build.

Serviços gratuitos de hospedagem podem suspender a API quando ficam ociosos. Isso pode causar demora na primeira solicitação. Não publique dados de membros ou finanças reais antes de configurar armazenamento persistente, backups, autenticação e permissões de acordo com o uso pretendido.

## 🔐 Segurança e limitações conhecidas

A base inclui mecanismos de segurança úteis para desenvolvimento, mas ainda precisa de homologação antes do uso real:

- Senhas protegidas por hash no back-end; o front-end não deve armazenar senhas.
- JWT com expiração e validação de emissor/audiência.
- Cadastro público controlado por variável de ambiente; o modelo de implantação o habilita para permitir novas contas.
- Validação de campos na API, limites de requisição e rate limiting em login/cadastro.
- CORS restrito à origem configurada.
- Dados fictícios isolados no modo de demonstração.

**Pendências que não devem ser tratadas como concluídas:** recuperação de senha por e-mail, verificação de e-mail, MFA, trilha completa de auditoria, permissões granulares por cargo, endpoints dedicados para toda a experiência do membro, testes automatizados de ponta a ponta e validação integral dos fluxos contra um banco real. Consulte [`docs/SEGURANCA-E-VALIDACAO.md`](docs/SEGURANCA-E-VALIDACAO.md) e [`docs/STATUS-E-VALIDACAO.md`](docs/STATUS-E-VALIDACAO.md).

Nunca faça commit de arquivos `.env`, credenciais reais, chaves JWT de produção, dumps de banco ou dados pessoais. Os valores de senha presentes no Compose e no `appsettings.json` são exclusivamente locais para desenvolvimento e devem ser substituídos fora desse contexto.

## 🧪 Validação atual

O pacote recebido contém verificações estáticas e documentação prévia, porém o build completo do Vite, a compilação da API e o teste integrado com MySQL ainda precisam ser executados em um ambiente com as dependências disponíveis. Este repositório adiciona um fluxo de CI para executar os builds no GitHub Actions após o primeiro push; isso **não significa que a pipeline já passou**.

Checklist recomendado antes de uma apresentação ou publicação:

- [ ] `npm install` e `npm run build` em `frontend/`.
- [ ] `dotnet restore` e `dotnet build` em `backend/ChurchManager.Api/`.
- [ ] API conectando-se a um MySQL recém-inicializado.
- [ ] Login, cadastro, sessão expirada e permissões administrativas.
- [ ] Criar, listar, editar e excluir os registros dos módulos conectados.
- [ ] Testes de uso em Android, telas estreitas e desktop.
- [ ] Conferência visual com as telas correspondentes do Figma.
- [ ] Configuração das variáveis de produção e teste de CORS.
- [ ] Backup e restauração do banco antes de inserir dados reais.

## 👨‍💻 Desenvolvedor e autoria

**Desenvolvedor principal:** Jonathan Otiniel  
**GitHub:** [@joots28](https://github.com/joots28)  
**Contexto:** projeto acadêmico/TCC na área de desenvolvimento de sistemas.

O projeto também é um exercício prático de evolução de software: manter a interface fiel às referências de design, dividir o código por responsabilidade, tornar os fluxos transparentes e registrar honestamente o que está pronto e o que depende de trabalho futuro.

## 🗺️ Próximos passos sugeridos

1. Confirmar os builds locais e deixar o CI verde.
2. Revisar os fluxos de autenticação e o isolamento de dados entre igrejas.
3. Corrigir e validar os detalhes de responsividade com capturas reais de telas pequenas e desktop.
4. Sincronizar o Blueprint do Render, validar a conexão com PostgreSQL e planejar a migração para um banco persistente antes do vencimento do banco gratuito.
5. Implementar recuperação de senha, verificação de e-mail, permissões granulares e auditoria conforme os requisitos do TCC.
6. Executar testes integrados e só então publicar uma demonstração conectada a banco persistente.

## 📚 Documentação complementar

- [Arquitetura e boas práticas](docs/ARQUITETURA-E-BOAS-PRATICAS.md)
- [Decisões técnicas](docs/DECISOES-TECNICAS.md)
- [Plano de implantação](docs/PLANO-DE-DEPLOY.md)
- [Segurança e validação](docs/SEGURANCA-E-VALIDACAO.md)
- [Status e validação](docs/STATUS-E-VALIDACAO.md)
- [Roteiro de validação visual](docs/ROTEIRO-DE-VALIDACAO-VISUAL.md)
- [Relatório de transição](docs/RELATORIO-DE-TRANSICAO.md)
- [Protótipo de referência no Figma](https://www.figma.com/design/HsCzM9y4zLXyBdFIZtn23k/TCC--Final---c%C3%B3pia-)

## 📄 Licença

Uma licença de distribuição ainda não foi definida neste repositório. Até que um arquivo `LICENSE` seja incluído, não presuma que o código está liberado para reutilização, redistribuição ou uso comercial.
