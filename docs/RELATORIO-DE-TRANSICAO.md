# Relatório de transição — ChurchManager

## Objetivo

Manter todo o código em um único repositório GitHub, usando PostgreSQL no Supabase como único banco remoto da aplicação.

## Arquitetura definida

```text
GitHub: joots28/ChurchMennager (main)
   ├── frontend/  → Render Static Site: churchmanager-tcc
   └── backend/   → Render Docker API: churchmanager-api-tcc
                             |
                             | PostgreSQL + TLS
                             v
                       Supabase: NexEl
```

Os dois serviços Render existentes já apontam para o mesmo repositório e branch. Não é necessário criar outro repositório.

## Alterações de código realizadas

- PostgreSQL passa a ser o provedor padrão do backend.
- O backend exige uma connection string em variável de ambiente; senha não fica no código.
- A criação automática de tabelas está desativada por padrão em `appsettings.json`.
- `render.yaml` descreve os dois serviços apontando ao mesmo repositório.
- README e plano de deploy foram alinhados com Render + Supabase.

## Pendências antes da publicação funcional

1. O projeto Supabase `NexEl` estava pausado. A restauração foi solicitada, porém precisa atingir `ACTIVE_HEALTHY`.
2. Ainda não foi confirmado se o banco do Neon foi exportado e importado para o Supabase.
3. A senha/connection string do PostgreSQL deve ser copiada no dashboard Supabase e inserida como segredo no Render; não deve ser enviada pelo chat.
4. O esquema deve ser inspecionado e comparado com o EF Core antes de qualquer migração.
5. API precisa de novo deploy com a connection string Supabase.
6. Testes de autenticação, operações CRUD e persistência precisam ser executados.

## Critério de aceite

Somente considerar pronto quando `/health/ready` retornar `database: connected`, login e operações principais funcionarem, e os dados persistirem no Supabase. Não afirmar que migração de dados Neon ocorreu sem conferir tabelas e registros.
