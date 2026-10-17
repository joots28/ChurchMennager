# Catálogo de funcionalidades

Este catálogo diferencia o que está presente na interface, o que tem endpoints na API e o que ainda depende de integração. A presença de uma tela não significa, por si só, que o fluxo está pronto para produção.

| Domínio | Interface | API desta versão | Limitações relevantes |
|---|---|---|---|
| Login | Login e estado de sessão | `POST /api/auth/login` | Precisa de banco e configuração de JWT |
| Cadastro | Cadastro em duas etapas | `POST /api/auth/register` | Cadastro público desativado por padrão em produção; ativação inicial deve ser temporária |
| Membros | Tela/tabela e formulário | CRUD em `/api/members` | Homologar validação e regras de usuário/membro |
| Ministérios | Tela/tabela e formulário | CRUD em `/api/ministries` | Homologar relações e filtros |
| Eventos | Tela/tabela e formulário | CRUD em `/api/events` | Notificações e convites não implementados |
| Financeiro | Entradas/saídas e indicadores | CRUD em `/api/transactions` | Não há integração bancária nem pagamento real |
| Cargos | Tela/tabela e formulário | CRUD em `/api/roles` | Permissões por cargo ainda informativas, não RBAC granular |
| Escalas | Tela/tabela e formulário | CRUD em `/api/scales` | Validar atribuição de pessoas/equipes e regras específicas |
| Configurações | Dados institucionais | `GET` e `PUT /api/church/settings` | Depende de usuário administrativo e banco conectados |
| Portal do membro | Início, eventos, escalas, perfil e contribuição informativa | Não existe API dedicada completa para todas as telas do portal | Tratar como base visual até integrar e testar os endpoints próprios |
| Tema | Alternância claro/escuro | Não aplicável | Comportamento de interface |
| CSV | Exportação de dados tabulares | Não aplicável | Conferir dados/colunas antes de distribuir arquivos |
| Demonstração | Dados fictícios no navegador | Não chama a API quando `VITE_DEMO_MODE=true` | Não é persistência compartilhada e não deve receber dados reais |

## Endpoints principais

- `GET /health` — verifica que o processo da API responde; não comprova sozinho conexão com banco.
- `POST /api/auth/login` — autenticação e emissão de JWT.
- `POST /api/auth/register` — cadastro inicial/administrativo conforme a configuração do ambiente.
- `/api/members`, `/api/ministries`, `/api/events`, `/api/transactions`, `/api/roles`, `/api/scales` — endpoints CRUD protegidos.
- `/api/church/settings` — leitura e atualização das configurações da igreja.

Consulte os controllers em `backend/ChurchManager.Api/Controllers/` para o contrato efetivo das requisições.
