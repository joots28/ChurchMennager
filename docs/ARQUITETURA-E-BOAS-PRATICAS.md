# Arquitetura modular e boas práticas — ChurchManager

## Objetivo

O ChurchManager continua sendo **um único produto integrado**, mas cada responsabilidade é editada no local próprio: página, componente visual, estilo, serviço HTTP, lógica de estado, API C# ou SQL. A modularização não deve mudar a identidade visual nem duplicar código só para aumentar o número de arquivos.

## Como a interface está organizada

- `frontend/index.html` é o documento HTML-base carregado pelo navegador. A aplicação React é uma SPA: suas páginas não precisam de HTMLs completos duplicados.
- `frontend/src/main.jsx` inicializa o React e `App.jsx` compõe a aplicação.
- `features/pages/PageRenderer.jsx` seleciona a página corrente.
- `features/home/HomePage.jsx`, `features/members/MembersPage.jsx`, `features/ministries/MinistriesPage.jsx`, `features/events/EventsPage.jsx`, `features/finance/FinancePage.jsx`, `features/scales/ScalesPage.jsx`, `features/roles/RolesPage.jsx` e `features/settings/SettingsPage.jsx` representam páginas por domínio.
- `features/member/` divide o portal do membro em seções independentes.
- `features/management/forms/` contém um JSX por tipo de formulário: membro, ministério, evento, lançamento, cargo e escala.
- `components/layout/` separa a estrutura administrativa, o menu lateral e o cabeçalho.
- `components/ui/` contém componentes reutilizáveis. Componentes que têm estilo próprio mantêm CSS ao lado: `Button.jsx`/`Button.css`, `InputField.jsx`/`InputField.css`, `SelectField.jsx`/`SelectField.css`, `Modal.jsx`/`Modal.css`, `Badge.jsx`/`Badge.css` e assim por diante.
- Regras comuns de formulário podem ficar em um arquivo comum, como `FormField.css`; isso evita repetir as mesmas declarações para todos os campos. Estilos específicos de cada controle permanecem isolados.
- `styles/base.css`, `styles/responsive.css` e `styles/theme.css` são globais por natureza (reset/variáveis, ajustes globais de responsividade e tema). Não devem virar cópias de regras específicas de componentes.

## Onde editar uma mudança

| Se quiser alterar… | Comece por… |
|---|---|
| Aparência do botão | `components/ui/Button.css` |
| Comportamento do botão | `components/ui/Button.jsx` |
| Aparência do campo de texto | `components/ui/InputField.css` |
| Aparência do seletor | `components/ui/SelectField.css` |
| Página inicial | `features/home/HomePage.jsx` e `HomePage.css` |
| Cadastro de membros | `features/management/forms/MemberFields.jsx` |
| Tabela usada por módulos administrativos | `features/management/ResourceTablePage.jsx` e `ResourceTablePage.css` |
| Login via API | `services/authService.js` e `services/httpClient.js` |
| Dados fictícios da demonstração | `data/demoData.js` e `services/demoStorage.js` |
| Estado/ações de gestão | `hooks/useChurchManager.js` e `hooks/useRecordActions.js` |
| Regras de validação no cliente | `utils/formValidation.js` |
| Endpoint ou regra protegida | `backend/ChurchManager.Api/Controllers/` e camadas relacionadas |
| Estrutura do banco | `backend/database/schema.sql` ou uma migração nova |

## API, SQL e persistência

A API é um projeto independente ASP.NET Core em `backend/ChurchManager.Api/`. Os controladores expõem endpoints HTTP; os modelos/contratos e o contexto de dados ficam em suas pastas de responsabilidade. O esquema SQL inicial e alterações de estrutura ficam em `backend/database/`. A interface acessa endpoints através de `frontend/src/services/`; as páginas não devem espalhar chamadas `fetch` nem SQL.

## Princípios adotados

1. **Uma responsabilidade por módulo:** alteração isolada sem reescrever a aplicação inteira.
2. **Composição e reutilização:** reutilizar componentes visuais quando têm comportamento/estilo verdadeiramente comum; evitar cópia e cola.
3. **Estilo junto ao componente:** CSS local por componente ou página quando houver estilo próprio.
4. **Compartilhamento com intenção:** folha comum apenas para regras que realmente são comuns; não criar arquivos vazios ou arquivos de uma linha sem finalidade.
5. **Sem CSS inline nem estilos gigantes:** estilos persistentes ficam em `.css`; JSX fica responsável pela estrutura e comportamento.
6. **Serviços separados da interface:** chamadas HTTP em `services/`, lógica reutilizável em `hooks/`, funções puras em `utils/`.
7. **Segurança do lado do servidor:** validações no navegador ajudam a experiência, mas a API e o banco continuam sendo a autoridade.
8. **Código enxuto com propósito:** remover duplicações, imports e arquivos obsoletos; não remover validações, tratamento de erro, acessibilidade ou segurança por serem linhas a mais.

## Limites de validação

Os arquivos JavaScript/JSX e os imports locais devem passar por uma checagem estática. Para validar a compilação real, execute `npm install` e `npm run build` em `frontend/`; a integração completa exige também compilar a API com o SDK .NET e testar contra uma instância de SQL. A prévia HTML é independente, usa dados de demonstração e não comprova que a API, autenticação ou banco foram executados.
