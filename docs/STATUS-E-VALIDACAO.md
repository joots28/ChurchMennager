# ChurchManager — status de validação

**Situação: frontend e backend organizados em um repositório; publicação e conexão Supabase em andamento.**

## Estrutura

- `frontend/`: React + JavaScript/JSX + Vite.
- `backend/ChurchManager.Api/`: C# ASP.NET Core 8, EF Core e Npgsql.
- `render.yaml`: frontend estático e API Docker, ambos a partir do mesmo repositório.
- Banco de produção: PostgreSQL do Supabase (`NexEl`).

## Confirmado

- [x] Um repositório contém frontend, backend, scripts e documentação.
- [x] `churchmanager-tcc` aponta para `joots28/ChurchMennager`, branch `main`.
- [x] `churchmanager-api-tcc` aponta para o mesmo repositório e branch.
- [x] Backend contém provedor Npgsql e endpoint `/health/ready`.
- [x] Pedido de restauração do projeto Supabase `NexEl` foi aceito.
- [ ] Supabase atingir `ACTIVE_HEALTHY`.
- [ ] Confirmar se dados do Neon foram importados; a restauração do Supabase não realiza essa cópia.
- [ ] Inspecionar tabelas/colunas/constraints e aplicar migração PostgreSQL.
- [ ] Configurar connection string como segredo no Render.
- [ ] Deploy manual da API após configurar o segredo.
- [ ] Confirmar `/health/ready` com `database: connected`.
- [ ] Testar login, CRUD e persistência em outro dispositivo.
- [ ] Validar isolamento de dados por igreja e backups.

## Pendências funcionais

- Recuperação de senha e verificação de e-mail não estão implementadas.
- Permissões detalhadas por cargo ainda são informativas; autorização usa o perfil administrativo.
- Portal do membro e ações de contribuição têm partes demonstrativas e exigem endpoints próprios.
- Não há integração de pagamento real.
- Testes ponta a ponta e comparação visual integral com Figma ainda são necessários.

Não usar dados reais nem declarar o TCC pronto antes de cumprir os itens críticos.
