# Plano de implantação — ChurchManager

Este documento descreve uma implantação econômica sem afirmar que os serviços já foram criados. A configuração atual da API usa MySQL por meio do provedor Pomelo; a escolha do banco precisa respeitar essa implementação ou incluir uma migração testada.

## Arquitetura sugerida

1. **Site estático no Render:** recebe o React/Vite compilado. Não mantém dados em disco.
2. **API web no Render:** executa o ASP.NET Core em Docker e atende às chamadas HTTPS do navegador.
3. **Banco gerenciado:** precisa ser persistente, acessível pela API e compatível com MySQL nesta versão.

O plano gratuito do Render serve para demonstrações, mas a API pode entrar em suspensão após período sem acesso e a primeira chamada pode demorar para reativá-la. O PostgreSQL gratuito do Render tem limite de 1 GB e expira 30 dias após a criação; portanto, não use esse banco como armazenamento de longo prazo para este projeto sem planejar migração e backups.

## Escolha do banco

### Caminho A — preservar o código atual

Utilize um serviço MySQL gerenciado que permita conexões externas seguras e confira o custo, os limites, a retenção e as políticas de inatividade antes de escolher. Use a string de conexão apenas nas variáveis secretas da API. Esse caminho reduz a quantidade de mudanças de código, mas a viabilidade do preço depende do provedor MySQL selecionado.

### Caminho B — buscar uma pilha gratuita com PostgreSQL

Supabase oferece PostgreSQL em um plano gratuito com limites e possibilidade de pausar projetos inativos. É uma alternativa a avaliar para uma demonstração acadêmica, mas **não é plug-and-play para o código atual**: será necessário trocar o provedor EF Core de MySQL para PostgreSQL, rever a configuração de conexão, adaptar e recriar o esquema/migrações e validar todas as consultas e tipos. Faça isso em uma branch separada e não remova o esquema MySQL até que os testes integrados passem.

Não escolha Render Postgres gratuito como se fosse permanente: o vencimento de 30 dias torna inadequado para armazenar dados que precisam continuar disponíveis indefinidamente.

## Criar o serviço de API no Render

1. Publique primeiro este repositório no GitHub e conecte o repositório ao Render.
2. Crie um Web Service usando Docker.
3. Dockerfile: `backend/ChurchManager.Api/Dockerfile`.
4. Contexto do Docker: raiz do repositório (`.`).
5. Configure as variáveis de ambiente:
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `ASPNETCORE_URLS=http://+:8080`
   - `JWT_KEY`: valor aleatório exclusivo com pelo menos 32 caracteres; guarde apenas no painel do Render.
   - `ConnectionStrings__DefaultConnection`: string do MySQL remoto, compatível com Pomelo.
   - `FRONTEND_ORIGIN`: URL HTTPS exata do site estático, sem caminhos adicionais.
   - `AUTH_ALLOW_PUBLIC_REGISTRATION=false` após criar a primeira conta administrativa.
6. Espere o deploy e teste `https://URL-DA-API/health`.

Nunca coloque esses valores no `render.yaml`, no README, no histórico Git ou em screenshots públicas.

## Criar o site React no Render

1. Crie um Static Site a partir do mesmo repositório.
2. Root directory: `frontend`.
3. Build command: `npm install && npm run build`.
4. Publish directory: `dist`.
5. Configure `VITE_DEMO_MODE=false`.
6. Configure `VITE_API_URL` com a origem HTTPS da API, por exemplo `https://nome-do-servico.onrender.com`, sem barra final.
7. Faça novo deploy após adicionar/alterar essas variáveis, pois variáveis `VITE_*` são incorporadas durante o build do Vite.
8. Atualize `FRONTEND_ORIGIN` na API com a URL final do site e faça redeploy da API.
9. Teste login e CRUDs; não considere `/health` sozinho prova de que o banco está acessível.

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
