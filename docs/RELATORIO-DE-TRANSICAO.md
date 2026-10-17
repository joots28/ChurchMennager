# Relatório de transição — ChurchManager

Este arquivo descreve o estado real da base entregue e orienta a próxima etapa de trabalho, inclusive se outra ferramenta de desenvolvimento for utilizada.

## Objetivo técnico

Manter a identidade visual e os fluxos definidos no arquivo original do Figma, com um site responsivo leve para computadores/notebooks/televisores e celulares, front-end React + JavaScript + Vite, API C# / ASP.NET Core e MySQL.

## Base preparada

- Front-end com login, cadastro em duas etapas, recuperação de senha informativa, área administrativa, tabelas e formulários de cadastro/edição/exclusão em modo de demonstração.
- Dashboard com cartões e listagem de eventos/movimentações fictícias.
- Módulos de membros, ministérios, eventos, movimentações financeiras, cargos, escalas e configurações.
- Área do membro demonstrativa: início, eventos, escalas, perfil e ação de contribuição não financeira.
- Persistência demonstrativa via localStorage, separada do modo de API.
- API .NET 8 com autenticação JWT, hash de senhas, endpoints de cadastro/login, CRUD segregado por igreja e configurações básicas da igreja.
- Esquema MySQL, docker-compose local, Dockerfile e template de implantação.
- README com execução e contas demonstrativas.

## Não considerar concluído ainda

1. **Fidelidade pixel a pixel.** O conector Figma permitiu obter a lista de frames e o contexto de código do login-mobile, mas atingiu o limite de chamadas Starter antes de recuperar screenshots/contexto das demais telas. A base segue os tokens recuperados (`#f8fafc`, `#2563eb`, `#0f172a`, `#475569`, `#e2e8f0`, Inter) e a lista de pranchas. Não afirmar que todos os frames estão idênticos sem comparar screenshots lado a lado.
2. **Build/execução.** Este ambiente não tem o SDK do .NET ou Docker, e a instalação offline do npm falhou por falta de pacotes em cache. Os arquivos JSX passaram por checagem sintática do parser, e os arquivos JS/JSON foram validados, mas não foi possível executar `npm run build`, `dotnet build` nem testes ponta a ponta.
3. **Autorização refinada.** O CRUD API está restrito a Administrador nesta primeira base. Falta implementar permissões por módulo (ex.: tesouraria só no financeiro, líderes nos ministérios correspondentes) e fluxo seguro de convite/aprovação de membro. Não expor dados reais antes dessa revisão.
4. **Conta de membro na API.** O portal de membro funciona em modo demonstrativo; a ligação entre `Member` e um usuário autenticável ainda precisa de fluxo seguro, e endpoints específicos de dados do próprio membro precisam ser implementados/testados antes de usar no modo de API.
5. **Recuperação de senha.** A interface mostra uma mensagem informativa, mas ainda não há serviço de e-mail nem token de reset.
6. **Vinculação à igreja.** O cadastro visual apresenta seleção de uma igreja existente; a API de registro ainda cria uma igreja com o nome enviado. É necessário alinhar o fluxo real com o protótipo e implementar convite/autorização para não permitir que alguém assuma acesso administrativo a uma igreja existente.
7. **Pagamentos.** Não existe integração financeira com gateway. A ação de contribuição é apenas informativa e não deve ser descrita como pagamento funcional.
8. **Hospedagem MySQL.** O YAML do Render é um template; precisa ser ligado a um provedor MySQL compatível. Confirmar custos, TLS, backup, disponibilidade e limites antes da feira.

## Instruções para a próxima pessoa/agente de desenvolvimento

- Primeiro, obtenha screenshots/exportações do Figma depois que o limite de integração for liberado. Use os frames existentes na lista de `STATUS-E-VALIDACAO.md` e preserve ordem, texto, cor, ícones, espaçamento e dimensão dos componentes.
- Não introduza telas que não existam no protótipo. Se um fluxo não estiver definido, documente a dúvida em vez de inventar o comportamento.
- Faça comparação visual em `390×844` (ou dimensão exata do frame mobile) e `1440×960` para os frames desktop, depois ajuste breakpoints.
- Execute build e testes localmente; corrija todos os erros antes de afirmar que está funcional.
- Complete a segurança multi-tenant e autorizações por módulo. Dados de uma igreja nunca podem aparecer para usuários de outra igreja.
- Separe dados de demonstração de dados reais. Não preencha produção com nomes/valores fictícios que pareçam registros reais.
- Não modifique o arquivo Figma original. Se a necessidade for só corrigir o código, trabalhe no repositório e mantenha o protótipo como referência.

## Credenciais do modo de demonstração

- Acesso demonstrativo autorizado: `Jonathan Otiniel` / `1234` (somente com `VITE_DEMO_MODE=true`; nunca usar em produção).

Essas contas existem somente para o front-end demonstrativo e seus dados fictícios locais. Não são credenciais da API e não devem ser usadas para publicar uma versão real.


## Atualização de segurança e formulários

A versão reorganizada agora valida os dados no servidor e na interface, protege a criação/edição com autorização administrativa e filtro por igreja, expira JWTs em uma hora, limita solicitações de autenticação e bloqueia cadastro público em produção por padrão. Também há cabeçalhos de segurança definidos no `render.yaml` para o site estático. A recuperação de senha, verificação de e-mail, MFA, auditoria e permissões granulares continuam pendentes; detalhes e passos de publicação constam em `docs/SEGURANCA-E-VALIDACAO.md`.
