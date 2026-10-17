# Política de segurança

O ChurchManager é uma base acadêmica em desenvolvimento, não um serviço de produção homologado. Não envie dados reais de membros, credenciais, informações bancárias ou documentos pessoais por meio desta versão.

## Comunicação de problemas

Para relatar uma vulnerabilidade, abra uma issue privada somente se o repositório e a organização oferecerem esse recurso; caso contrário, entre em contato com o mantenedor por um canal privado conhecido. Evite publicar detalhes exploráveis ou dados pessoais em issues públicas.

## Práticas obrigatórias para desenvolvimento

- Nunca faça commit de chaves JWT de produção, senhas, arquivos `.env` ou strings de conexão reais.
- Use variáveis de ambiente para valores sensíveis e rotacione imediatamente qualquer segredo que tenha sido exposto.
- Não ative o cadastro público permanentemente sem proteções e monitoramento apropriados.
- Não use o modo de demonstração para armazenar dados reais.
- Antes de publicar, execute os builds, os testes integrados e a revisão descritos em `docs/SEGURANCA-E-VALIDACAO.md`.

Leia também [docs/SEGURANCA-E-VALIDACAO.md](docs/SEGURANCA-E-VALIDACAO.md) e [docs/PLANO-DE-DEPLOY.md](docs/PLANO-DE-DEPLOY.md).
