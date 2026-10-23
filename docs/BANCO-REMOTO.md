# Banco remoto do ChurchManager

## Como o cadastro funciona

O navegador envia o cadastro para a API ASP.NET Core em /api/auth/register. A API valida os campos, cria a igreja e a conta administrativa dentro de uma transação e grava a senha como hash. O login consulta a mesma base remota e devolve um JWT. Assim, os cadastros não ficam presos ao armazenamento local do navegador e podem ser acessados após trocar de aparelho.

## Provedores suportados

- **MySQL local:** configuração padrão usada pelo Docker Compose e por backend/database/schema.sql.
- **PostgreSQL remoto:** selecionado com CHURCHMANAGER_DB_PROVIDER=postgres; usa Npgsql. O código aceita URLs no formato PostgreSQL e connection strings Npgsql.

O front-end deve usar VITE_DEMO_MODE=false e VITE_API_URL apontando para a URL HTTPS da API. O navegador não deve receber a senha do banco nem acessar diretamente a base.

## Blueprint do Render

O render.yaml declara o PostgreSQL churchmanager-tcc-db, a API Docker churchmanager-api-tcc na região Virginia e o site churchmanager-tcc. A conexão é referenciada por fromDatabase, e JWT_KEY é gerada pelo Render. Para aplicar o arquivo, crie ou sincronize um Blueprint no painel do Render apontando para este repositório e confira a prévia antes de aplicar.

A API atualmente associada ao repositório churchmanager (sem “Mennager”) não passa automaticamente a usar o código deste repositório. A configuração nova define uma API separada para ChurchMennager.

## Inicialização e verificação

Database__AutoCreate=true ativa EnsureCreatedAsync para criar o esquema inicial numa base vazia. Isso não atualiza tabelas parcialmente existentes e não substitui migrações versionadas para evolução do esquema.

- /health: API disponível.
- /health/ready: a API consegue abrir conexão com a base.

Após a implantação, crie uma conta de teste, entre, crie um registro, recarregue a página e confirme que o registro continua disponível. Depois repita a consulta em outro navegador ou dispositivo para confirmar que não depende do armazenamento local. Não use dados reais até confirmar retenção, backups e regras de acesso.

## Atenção à retenção dos dados

O banco Render gratuito já existente no workspace expira em **21 de novembro de 2026**. Bancos PostgreSQL gratuitos do Render expiram após 30 dias e não têm backups gerenciados. Portanto, use essa base apenas para homologação. Antes de guardar dados reais, migre para um banco com retenção adequada e teste a restauração de backups.

Não inclua tokens, senhas reais, strings de conexão ou chaves JWT no GitHub, em screenshots ou em mensagens públicas.
