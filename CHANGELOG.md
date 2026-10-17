# Histórico de alterações

Este arquivo registra mudanças relevantes da distribuição organizada do ChurchManager.

## Preparação para GitHub — 2026-10-16

- Consolidada a documentação principal em um README detalhado em português.
- Documentadas as funcionalidades disponíveis e as limitações conhecidas.
- Adicionado um plano de implantação que distingue MySQL atual e possível migração futura para PostgreSQL.
- Ajustado o `render.yaml` para prever `VITE_API_URL` no build do site estático e manter o modo demonstração desativado por padrão.
- Adicionado fluxo do GitHub Actions para tentar compilar o front-end e a API em cada push/pull request.
- Reforçadas regras de `.gitignore` para arquivos de ambiente e segredos locais.
- Adicionados guias de contribuição e segurança.

## Nota de versão

Esta é uma preparação documental e de configuração. O build completo do front-end, a compilação do back-end e os testes integrados não foram confirmados neste ambiente. A primeira execução de CI no GitHub deve ser revisada e eventuais erros corrigidos antes de declarar a versão validada.
