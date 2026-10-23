# Plano de implantação — ChurchManager

Este documento descreve a configuração de implantação do ChurchManager. A API mantém MySQL para desenvolvimento local e também suporta PostgreSQL remoto usando Npgsql. A criação do serviço de API no Render exige sincronizar o Blueprint descrito em render.yaml.

## Arquitetura sugerida

1. **Site estático no Render:** recebe o React/Vite compilado. Não mantém dados em disco.
2. **API web no Render:** executa o ASP.NET Core em Docker e atende às chamadas HTTPS do navegador.
3. **Banco gerenciado:** a API suporta PostgreSQL remoto do Neon e MySQL local. A conexão do Neon fica apenas nas variáveis secretas do serviço de API no Render.

O plano gratuito do serviço web do Render pode suspender a API após inatividade, causando demora na primeira chamada. O banco de dados do Neon é gerenciado separadamente; confira os limites do seu plano e mantenha exportações de segurança.

## Escolha e configuração do banco

O MySQL continua sendo o padrão para desenvolvimento local via Docker Compose. Para conectar o PostgreSQL do Neon, defina `CHURCHMANAGER_DB_PROVIDER=postgres` e configure `ConnectionStrings__DefaultConnection` com a URL do banco em uma variável secreta do serviço de API. Em produção, a API exige TLS ao normalizar a conexão.

O `render.yaml` declara a API `churchmanager-api-tcc` e o site `churchmanager-tcc`. A variável de conexão usa `sync: false`, portanto não é gravada no Git: após criar/sincronizar o Blueprint, insira a nova connection string em **Render → serviço da API → Environment**. Nunca cole a senha em `render.yaml`, README, issues ou logs.

A API usa `EnsureCreatedAsync` somente para inicializar uma base nova e vazia, quando `Database__AutoCreate=true`. Isso não corrige um esquema parcial e não substitui migrações do EF Core para mudanças futuras.

## Conectar a API ao Render

1. No Render Dashboard, crie ou sincronize um Blueprint usando este repositório e a branch main.
2. Revise a prévia antes de aplicar. O Blueprint define a API churchmanager-api-tcc com Docker; a connection string do Neon é inserida separadamente como segredo.
3. Confirme que JWT_KEY foi gerada pelo Render e que FRONTEND_ORIGIN está como https://churchmanager-tcc.onrender.com.
4. O modelo habilita AUTH_ALLOW_PUBLIC_REGISTRATION=true para permitir novos cadastros. Se decidir restringir inscrições, altere a variável no painel e mantenha um processo de criação de contas.
5. Database__AutoCreate=true serve apenas para inicializar um banco novo e vazio. Para alterações futuras, use migrações revisadas do EF Core.
6. Teste /health para conferir a disponibilidade da API e /health/ready para confirmar que ela abre conexão com o banco.

Nunca coloque credenciais, connection strings ou tokens no repositório. O Blueprint gera a chave JWT; você deve inserir a connection string do Neon diretamente no painel do Render, na variável ConnectionStrings__DefaultConnection.

## Site React no Render

O Blueprint configura o Static Site churchmanager-tcc, publica frontend/dist, define VITE_DEMO_MODE=false e aponta VITE_API_URL para https://churchmanager-api-tcc.onrender.com. Variáveis VITE_* são incorporadas durante o build, então faça um novo build se alterar a URL da API.

Teste cadastro, login, criar/editar/excluir e persistência após recarregar o site em outro dispositivo. /health confirma apenas que a API está respondendo; /health/ready verifica a conexão com o banco.

## Critérios de aceite

- [ ] Site servido por HTTPS.
- [ ] API `/health` respondendo.
- [ ] API consegue conectar-se ao banco após reinicialização.
- [ ] `VITE_API_URL` aponta para a URL pública real da API.
- [ ] CORS aceita somente a origem final do site.
- [ ] `JWT_KEY` não é a chave local de desenvolvimento.
- [ ] Cadastro público fica desativado depois da configuração inicial.
- [ ] Teste criar/editar/excluir em todos os módulos conectados.
- [ ] Existe procedimento de backup e restauração verificado.
- [ ] Não há dados reais no modo de demonstração.

## Referências oficiais para confirmar limites atuais

- Render — serviços gratuitos: <https://render.com/docs/free>
- Render — especificação de Blueprints (`render.yaml`): <https://render.com/docs/blueprint-spec>
- Neon — conexão com aplicativos: <https://neon.com/docs/get-started/connect-neon>
- Neon — rotação segura de credenciais: <https://neon.com/docs/security/security-overview>

Revise essas páginas antes da implantação, pois limites e planos de fornecedores podem mudar.
