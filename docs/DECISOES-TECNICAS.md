# Decisões técnicas e motivos

- **Um site responsivo, não um app React Native separado:** menos código duplicado e mais simples de publicar/apresentar por URL.
- **React + JavaScript + Vite:** aproveita conhecimentos já estudados e mantém ferramentas leves. TypeScript foi deixado fora da primeira etapa porque não é requisito funcional e acrescenta uma curva de aprendizado.
- **ASP.NET Core em C#:** mantém a tecnologia de back-end que o grupo já estudou, com API independente do navegador.
- **MySQL:** alinhado à decisão do relatório conversado. A conexão gerenciada precisa ser contratada/provisionada fora de ambientes que não ofereçam MySQL nativo.
- **CSS nativo:** evita dependência obrigatória de um framework visual extra; componentes seguem tokens de cor/forma recuperados do contexto de design do Figma.
- **Modo demonstração:** facilita a feira sem exigir que a API esteja sempre ativa, mas os dados vivem apenas no navegador e são fictícios. Não equivale à aplicação multiusuário de produção.
- **API com escopo por igreja:** entidades são filtradas pelo `church_id` do JWT; não aceitar esse ID confiando no cliente é essencial para evitar acesso cruzado.
- **Render:** front-end estático e API são serviços distintos; o MySQL requer provedor com acesso de rede apropriado. Validar custos, política de suspensão e certificados antes da publicação.
- **Sem pagamentos reais nem e-mail ainda:** não declarar contribuição, redefinição de senha ou notificações como integradas até implementar um provedor e testar.
