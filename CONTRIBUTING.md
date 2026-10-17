# Como contribuir

O ChurchManager é um projeto acadêmico em evolução. Contribuições devem manter a aplicação legível, acessível e segura.

## Antes de alterar

1. Identifique o módulo afetado e leia `docs/ARQUITETURA-E-BOAS-PRATICAS.md`.
2. Preserve a separação entre `components`, `features`, `services`, `hooks` e `utils`.
3. Mantenha os estilos de componente em CSS próprio quando o estilo for local; regras globais devem continuar centralizadas.
4. Não adicione TypeScript ou um framework visual sem discutir o motivo e o impacto no projeto.
5. Não inclua dados reais, credenciais, chaves, arquivos `.env` ou dumps do banco.

## Verificações antes de enviar

```bash
cd frontend
npm install
npm run build
```

```bash
dotnet restore backend/ChurchManager.Api/ChurchManager.Api.csproj
dotnet build backend/ChurchManager.Api/ChurchManager.Api.csproj
```

Descreva o que mudou, como verificar a mudança e quais limitações continuam abertas. Alterações em autenticação, autorização ou persistência precisam de testes adicionais; a compilação isolada não é suficiente.
