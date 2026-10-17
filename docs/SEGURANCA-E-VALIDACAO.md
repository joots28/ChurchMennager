# Revisão de segurança e validação — ChurchManager

## Controles incluídos nesta versão

- Senhas novas com mínimo de 12 e máximo de 128 caracteres, armazenadas com `PasswordHasher` do ASP.NET Core; e-mails normalizados para minúsculas.
- JWT assinado com a mesma chave na geração e na validação, emissor e audiência validados, expiração de 60 minutos e pequena tolerância de relógio.
- Endpoint de cadastro limitado por endereço remoto a 12 requisições por minuto; login limitado a 5 tentativas por IP a cada 5 minutos. Em hospedagem atrás de proxy, confirme o IP remoto efetivamente recebido antes de depender desse limite como única defesa.
- Cadastro público desativado por padrão em produção. Para bootstrap inicial, habilite `AUTH_ALLOW_PUBLIC_REGISTRATION=true` temporariamente, crie a conta do administrador e volte a definir `false`.
- Endpoints CRUD e configurações exigem a função `Administrador`; consultas, edições e exclusões de registros são limitadas ao `church_id` assinado no token. O identificador de igreja enviado no corpo é sobrescrito pelo servidor.
- Criação e edição têm validação no servidor para obrigatoriedade, tamanho, formato de e-mail, status aceitos, JSON, data/horário e movimentações financeiras positivas com até duas casas decimais.
- Erros inesperados da API não devolvem detalhes de exceções. Há cabeçalhos de segurança, política CORS por origem e respostas de API sem cache.
- Dependências de autenticação JWT e ferramentas de projeto do EF Core atualizadas para o patch de manutenção .NET 8.0.32 disponível em outubro de 2026; o build precisa confirmar a restauração correta dos pacotes.
- O navegador usa `sessionStorage` para o JWT, verifica sua expiração ao restaurar a sessão e encerra a sessão quando recebe HTTP 401. Isso reduz a persistência entre sessões, mas não impede acesso ao token por JavaScript malicioso caso exista uma vulnerabilidade XSS; por isso, não se deve tratar o armazenamento no navegador como proteção absoluta.
- A API limita requisições HTTP a 1 MiB, adequado aos formulários atuais, para reduzir exposição a corpos JSON excessivos.
- Exportação CSV neutraliza valores que podem ser interpretados como fórmulas por planilhas.

## Campos obrigatórios por formulário

| Área | Obrigatórios | Opcionais |
|---|---|---|
| Membros | Nome completo, ministério, cargo e status | E-mail e telefone |
| Ministérios | Nome e status | Descrição e coordenador |
| Eventos | Nome, data, horário, ministério e status | Local e descrição |
| Financeiro | Descrição, tipo, valor positivo, categoria, data e método | Nenhum dos campos de lançamento financeiro |
| Cargos | Nome | Descrição e permissões informativas |
| Escalas | Nome, ministério, data, horário e status | Integrantes da equipe |
| Instituição | Nome e e-mail institucional válidos | Telefone e endereço |
| Cadastro | Nome, e-mail, senha de 12–128 caracteres e nome da igreja | Nenhum |

Os limites também são conferidos no servidor, para que chamadas diretas à API não possam ignorar as restrições da interface.

## Passos obrigatórios antes de publicar

1. Gere uma chave aleatória e exclusiva para `JWT_KEY` (pelo menos 32 caracteres); nunca publique a chave local de desenvolvimento.
2. Configure `ConnectionStrings__DefaultConnection` ou `CHURCHMANAGER_DB`, `FRONTEND_ORIGIN` com a origem HTTPS exata e confirme TLS e backups do banco na hospedagem.
3. Em banco existente, confira primeiro se há e-mails repetidos globalmente e depois avalie a migração `backend/database/migrations/001-global-user-email-unique.sql`. Não remova contas automaticamente.
4. Mantenha o cadastro público desativado após criar a conta inicial. O limite por IP não substitui verificação de e-mail, CAPTCHA ou monitoramento contra abuso.
5. Confirme os cabeçalhos de segurança e cache definidos em `render.yaml`. Uma CSP restritiva ainda precisa ser configurada depois de confirmar a origem real da API e a necessidade de fontes externas; aplicar uma política sem esses dados pode bloquear chamadas legítimas ou recursos da interface.
6. Faça build, testes de integração e teste manual em ambiente de homologação antes de usar dados reais.

## Pendências conhecidas — não afirmar como resolvidas

- Recuperação de senha por e-mail e verificação de e-mail ainda não estão implementadas; a interface agora informa isso em vez de fingir que enviou uma solicitação.
- As permissões selecionadas em “Cargos” são apenas dados informativos nesta versão; autorização efetiva continua baseada na função do usuário. Não trate essas caixas como RBAC granular.
- O portal de membro e a gestão de contas de usuários precisam de endpoints próprios antes de serem considerados recursos de produção.
- Não há ainda trilha de auditoria completa para alterações/exclusões, proteção contra credential stuffing distribuído, MFA ou testes automatizados de ponta a ponta. Para um ambiente mais rigoroso, considerar sessão por cookie `HttpOnly`, `Secure` e `SameSite` com proteção CSRF, em vez de token acessível ao JavaScript.
- A demonstração local usa dados fictícios no navegador e não é um ambiente seguro para cadastrar informações reais.
- A migração SQL precisa ser avaliada para o banco existente; `schema.sql` define o formato esperado para instalações novas.

## Validação executada para a entrega

Foi feita uma checagem estática de 40 arquivos JavaScript/JSX e dos imports relativos, sem erros. Também passaram 11 cenários de validação de formulários, e os arquivos YAML/JSON de configuração foram lidos sem erros. O ambiente de trabalho não contém o SDK do .NET e a instalação de dependências do front-end não concluiu; portanto, não foi possível executar o build completo do Vite, compilar/executar a API C# nem testar contra um banco real. Esses testes precisam ser executados em ambiente com dependências instaladas antes da publicação.


## Credenciais de demonstração

No modo local `VITE_DEMO_MODE=true`, o acesso é `Jonathan Otiniel` / `1234`. A validação no navegador é apenas demonstrativa e não protege a API. Essa senha nunca deve ser reutilizada no ambiente publicado. A API real aceita e-mail ou nome completo não ambíguo de uma conta existente, verifica o hash da senha no banco e limita tentativas de login por IP.
