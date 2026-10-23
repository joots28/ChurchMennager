# Plano de implantação — ChurchManager

Este documento descreve a configuração de implantação do ChurchManager. A API mantém MySQL para desenvolvimento local e também suporta PostgreSQL remoto usando Npgsql. A criação do serviço de API no Render exige sincronizar o Blueprint descrito em render.yaml.

## Arquitetura sugerida

1. **Site estático no Render:** recebe o React/Vite compilado. Não mantém dados em disco.
2. **API web no Render:** executa o ASP.NET Core em Docker e atende às chamadas HTTPS do navegador.
3. **Banco gerenciado:** a API suporta PostgreSQL remoto e MySQL local. O banco gratuito do Render já criado para este projeto expira em 21 de novembro de 2026; use-o apenas para homologação até migrar para uma opção com retenção e backups adequados.

O plano gratuito do Render serve para demonstrações, mas a API pode entrar em suspensão após período sem acesso e a primeira chamada pode demorar para reativá-la. O PostgreSQL gratuito do Render tem limite de 1 GB e expira 30 dias após a criação; portanto, não use esse banco como armazenamento de longo prazo para este projeto sem planejar migração e backups.

## Escolha e configuração do banco

O MySQL continua sendo o padrão para desenvolvimento local via Docker Compose. Para o banco remoto, defina CHURCHMANAGER_DB_PROVIDER=postgres e use ConnectionStrings__DefaultConnection com uma URL PostgreSQL (postgresql://usuario:senha@host:porta/banco) ou uma connection string Npgsql. Em produção, a API força TLS ao normalizar a conexão.

O render.yaml declara o banco churchmanager-tcc-db, a API churchmanager-api-tcc na mesma região e o site churchmanager-tcc. O Render injeta a URL de conexão por fromDatabase, sem armazenar a senha no Git. Sincronize o Blueprint pelo painel do Render; apenas commitar render.yaml não altera serviços criados manualmente.

A API usa EnsureCreatedAsync somente para inicializar uma base nova e vazia, quando Database__AutoCreate=true. Isso não corrige um esquema parcial e não substitui migrações do EF Core para mudanças futuras.

O PostgreSQL gratuito do Render expira 30 dias após a criação e não tem backups gerenciados. O banco já listado no workspace expira em 21 de novembro de 2026. Use-o para homologação e migre para um banco com retenção e backups antes de guardar informações reais.

## Conectar a API ao Render

1. No Render Dashboard, crie ou sincronize um Blueprint usando este repositório e a branch main.
2. Revise a prévia antes de aplicar. O Blueprint define a API churchmanager-api-tcc com Docker e referencia churchmanager-tcc-db por fromDatabase.
3. Confirme que JWT_KEY foi gerada pelo Render e que FRONTEND_ORIGIN está como https://churchmanager-tcc.onrender.com.
4. O modelo habilita AUTH_ALLOW_PUBLIC_REGISTRATION=true para permitir novos cadastros. Se decidir restringir inscrições, altere a variável no painel e mantenha um processo de criação de contas.
5. Database__AutoCreate=true serve apenas para inicializar um banco novo e vazio. Para alterações futuras, use migrações revisadas do EF Core.
6. Teste /health para conferir a disponibilidade da API e /health/ready para confirmar que ela abre conexão com o banco.

Nunca coloque credenciais, connection strings ou tokens no repositório. O Blueprint gera a chave JWT e injeta a conexão do banco sem versionar a senha.

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
- Supabase — pausa de projetos gratuitos inativos: <https://supabase.com/docs/guides/platform/free-project-pausing>
- Supabase — limite de tamanho do banco: <https://supabase.com/docs/guides/platform/database-size>

Revise essas páginas antes da implantação, pois limites e planos de fornecedores podem mudar.
