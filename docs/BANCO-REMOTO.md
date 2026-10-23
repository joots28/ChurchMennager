# Banco remoto do ChurchManager

## Como o cadastro funciona

O navegador envia o cadastro para a API ASP.NET Core em /api/auth/register. A API valida os campos, cria a igreja e a conta administrativa dentro de uma transação e grava a senha como hash. O login consulta a mesma base remota e devolve um JWT. Assim, os cadastros não ficam presos ao armazenamento local do navegador e podem ser acessados após trocar de aparelho.

## Provedores suportados

- **MySQL local:** configuração padrão usada pelo Docker Compose e por backend/database/schema.sql.
- **PostgreSQL remoto:** selecionado com CHURCHMANAGER_DB_PROVIDER=postgres; usa Npgsql. O código aceita URLs no formato PostgreSQL e connection strings Npgsql.

O front-end deve usar VITE_DEMO_MODE=false e VITE_API_URL apontando para a URL HTTPS da API. O navegador não deve receber a senha do banco nem acessar diretamente a base.

## Blueprint do Render

O render.yaml declara a API Docker churchmanager-api-tcc e o site churchmanager-tcc. A variável ConnectionStrings__DefaultConnection usa sync:false para manter a credencial fora do Git, e JWT_KEY é gerada pelo Render. Crie ou sincronize um Blueprint no painel do Render, confira a prévia e insira a nova URL do Neon em Render → serviço da API → Environment.

A API atualmente associada ao repositório churchmanager (sem “Mennager”) não passa automaticamente a usar o código deste repositório. A configuração nova define uma API separada para ChurchMennager.

## Inicialização e verificação

Database__AutoCreate=true ativa EnsureCreatedAsync para criar o esquema inicial numa base vazia. Isso não atualiza tabelas parcialmente existentes e não substitui migrações versionadas para evolução do esquema.

- /health: API disponível.
- /health/ready: a API consegue abrir conexão com a base.

Após a implantação, crie uma conta de teste, entre, crie um registro, recarregue a página e confirme que o registro continua disponível. Depois repita a consulta em outro navegador ou dispositivo para confirmar que não depende do armazenamento local. Não use dados reais até confirmar retenção, backups e regras de acesso.

## Retenção e segurança

Verifique os limites e as regras de suspensão do plano Neon associado ao projeto, e mantenha uma exportação de segurança do banco antes da apresentação. Como a string de conexão foi compartilhada em uma conversa, redefina a senha da role no console Neon e atualize o segredo no Render antes de usar esse banco.

Não inclua tokens, senhas reais, strings de conexão ou chaves JWT no GitHub, em screenshots ou em mensagens públicas.
