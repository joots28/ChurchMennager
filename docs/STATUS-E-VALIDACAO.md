# ChurchManager — relatório de status e validação

**Estado:** primeira base de implementação gerada. Não é uma declaração de conclusão do TCC.

## O que foi preparado

- Estrutura de front-end React + JavaScript + Vite e CSS responsivo, sem framework CSS obrigatório.
- Login, cadastro em duas etapas e recuperação de senha visual.
- Área administrativa com dashboard e módulos para membros, ministérios, eventos, finanças, escalas, cargos e configurações.
- Área do membro com início, eventos, escalas, perfil e orientação informativa de contribuições.
- Modo de demonstração com dados fictícios persistidos localmente para a feira.
- API C# ASP.NET Core com autenticação por JWT, hash de senha e endpoints CRUD protegidos pelo escopo de igreja.
- Esquema SQL MySQL, compose de desenvolvimento, Dockerfile e modelo `render.yaml`.
- Roteiro de validação visual abaixo.

## O que foi confirmado do Figma

Na página `Page 1` foi possível identificar estas pranchas/nodes:

- `login-mobile` (3:7), cadastro em duas etapas, seleção de igreja e recuperação de senha.
- `membro-inicio-eventos` (3:299), `membro-meu-perfil` (3:393), `membro-fazer-doacao` (3:462) e `membro-minhas-escalas` (3:527).
- `admin-dashboard` (3:718), `admin-gestao-membros` (3:853), `admin-controle-financeiro` (3:1021), `admin-criacao-evento` (3:1159), `admin-configuracoes-igreja` (8:7), `admin-gestao-cargos` (8:113), `admin-modal-cargo` (8:270) e `admin-gestao-escalas` (8:409).
- `login-desktop` (28:6), `cadastro-desktop` (28:59), `membro-dashboard-desktop` (28:131), `admin-dashboard-mobile` (28:318), `admin-criar-evento-mobile` (28:419), `admin-gestao-cargos-mobile` (28:474), `admin-gestao-membros-mobile` (32:5), `admin-controle-financeiro-mobile` (32:159).

No contexto acessível do `login-mobile` foram observados como referências visuais: fundo `#f8fafc`, azul principal `#2563eb`, texto primário `#0f172a`, texto secundário `#475569`, borda `#e2e8f0`, placeholder `#94a3b8`, fonte Inter, entradas de 48 px e botão principal de 52 px.

## Bloqueio e consequência

Durante a inspeção, o Figma MCP retornou limite de chamadas do plano Starter, impedindo capturar screenshots/contexto de todas as telas. Por isso, **não seria honesto afirmar que a implementação já está pixel a pixel idêntica ao protótipo**. A interface usa os tokens que foram obtidos e a lista de pranchas, mas algumas composições de telas ainda são inferidas a partir dos módulos descritos no relatório de TCC.

O arquivo Figma original não foi alterado. Nenhuma tela foi apagada, movida ou modificada por esta implementação.

## Validação técnica realizada nesta sessão

- Foi confirmada a existência do projeto Figma e a leitura dos nomes/tamanhos de suas pranchas até atingir o limite da integração.
- Foi obtido o contexto de código e os tokens principais do login mobile.
- Não foi possível executar a instalação de pacotes ou compilar o projeto dentro desta sessão. Não declare o front-end nem o back-end “testados” sem executar os comandos do README em um ambiente com Node.js/.NET e acesso às dependências.

## Itens obrigatórios antes da apresentação

- [ ] Executar `npm install` e `npm run build` em `frontend`.
- [ ] Executar `dotnet restore` e `dotnet build` em `backend/ChurchManager.Api`.
- [ ] Validar conexão MySQL e fluxo de login/registro.
- [ ] Validar criar/editar/excluir cada entidade por API e interface.
- [ ] Conferir isolamento de dados entre igrejas e permissões por papel.
- [ ] Comparar cada tela desktop/mobile em screenshot com o frame de mesmo nome no Figma.
- [ ] Verificar botões, formulários, scroll e largura em celular estreito e tela de TV/monitor.
- [ ] Verificar comportamento depois de a API ficar sem solicitações por algum tempo.
- [ ] Confirmar que o link de demonstração não expõe dados reais.
- [ ] Preparar capturas offline e roteiro de contingência para falha da internet.

## Revisão de segurança desta versão

- O cadastro público é bloqueado por padrão em produção, a autenticação usa JWT com emissor/audiência e expiração validados e as tentativas de login/cadastro têm limitação.
- Os campos de criação/edição são validados também no servidor, e o CSV neutraliza conteúdo que poderia ser interpretado como fórmula.
- Antes de publicar, siga os passos e limitações documentados em `docs/SEGURANCA-E-VALIDACAO.md`; esta checagem não substitui `dotnet build`, build do Vite nem testes integrados.
- A recuperação de senha por e-mail, verificação de e-mail, MFA, auditoria e permissões granulares ainda não estão implementadas. Não usar com informações reais até completar a homologação e essas pendências de acordo com o risco do uso.
