# Roteiro de validação visual — Figma × ChurchManager

Use o frame original como referência. Faça uma verificação por tela e registre a diferença antes de alterar o CSS.

| Tela Figma | Desktop/mobile | Pontos a conferir |
|---|---|---|
| `login-desktop` / `login-mobile` | Ambos | Cor, tipografia, logo, conteúdo do formulário, posição do botão e link de cadastro |
| `cadastro-desktop` / `cadastro-passo-um` / `selecao-de-igreja` | Ambos | Indicador de etapas, campos, cartões e ações inferiores |
| `recuperacao-de-senha` | Mobile; localizar contraparte desktop se houver | Ícone, título, texto, formulário e botão voltar |
| `admin-dashboard` / `admin-dashboard-mobile` | Ambos | Largura do menu, cabeçalho, cartões, tabela/lista e espaçamentos |
| `admin-gestao-membros` / `admin-gestao-membros-mobile` | Ambos | Colunas desktop, adaptação mobile, busca, filtros e ações de linha |
| `admin-controle-financeiro` / `admin-controle-financeiro-mobile` | Ambos | Resumo financeiro, valores, tipos de entrada/saída e lista de movimentos |
| `admin-criacao-evento` / `admin-criar-evento-mobile` | Ambos | Campos, calendário, botões e mensagens de validação |
| `admin-configuracoes-igreja` | Desktop | Estrutura de formulário e agrupamento de configurações |
| `admin-gestao-cargos` / `admin-gestao-cargos-mobile` / `admin-modal-cargo` | Ambos/modal | Lista, permissões, modal, rolagem e botões |
| `admin-gestao-escalas` | Desktop; confirmar contraparte mobile, se existir | Data/horário, equipes, status e ações |
| `membro-dashboard-desktop` / `membro-inicio-eventos` | Ambos | Cabeçalho, navegação, agenda e cartões |
| `membro-meu-perfil` | Mobile | Dados de perfil e ações |
| `membro-fazer-doacao` | Mobile | Conteúdo e aviso: esta base não processa pagamento |
| `membro-minhas-escalas` | Mobile | Lista de escalas, datas e status |

## Como comparar

1. Abra o frame no Figma com zoom 100% ou exporte-o como imagem.
2. Abra a página local no mesmo tamanho lógico do frame (390×844 para os frames mobile; 1440×960 para muitos frames desktop).
3. Compare primeiro a estrutura (margens, largura, ordem dos elementos), depois cor, tipografia, alturas e ícones.
4. Verifique estados: hover/foco, campo inválido, tabela vazia, modal aberto e menu mobile.
5. Corrija apenas a tela fora da referência em questão, evitando regressões nos componentes compartilhados.
6. Refaça o teste em uma largura estreita e em uma viewport desktop.

Não substitua o screenshot do Figma por uma imagem estática dentro do site: a interface deve continuar real e interativa.
