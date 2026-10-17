/* Dados fictícios exclusivos do modo demonstração. */

export const initialData = {
  members: [
    { id: 1, name: 'Ana Paula Ferreira', email: 'ana.ferreira@exemplo.com', phone: '(11) 98812-1034', ministry: 'Louvor', status: 'Ativo', role: 'Membro' },
    { id: 2, name: 'Bruno Almeida Santos', email: 'bruno.santos@exemplo.com', phone: '(11) 97654-2201', ministry: 'Recepção', status: 'Ativo', role: 'Líder' },
    { id: 3, name: 'Camila Oliveira Costa', email: 'camila.costa@exemplo.com', phone: '(11) 96771-8911', ministry: 'Infantil', status: 'Ativo', role: 'Membro' },
    { id: 4, name: 'Daniel Rodrigues Lima', email: 'daniel.lima@exemplo.com', phone: '(11) 95521-3410', ministry: 'Louvor', status: 'Inativo', role: 'Membro' },
    { id: 5, name: 'Eduarda Martins Souza', email: 'eduarda.souza@exemplo.com', phone: '(11) 94408-5622', ministry: 'Comunicação', status: 'Ativo', role: 'Membro' }
  ],
  ministries: [
    { id: 1, name: 'Louvor', description: 'Música e adoração', coordinator: 'Ana Paula Ferreira', status: 'Ativo' },
    { id: 2, name: 'Recepção', description: 'Acolhimento da comunidade', coordinator: 'Bruno Almeida Santos', status: 'Ativo' },
    { id: 3, name: 'Ministério Infantil', description: 'Atividades com crianças', coordinator: 'Camila Oliveira Costa', status: 'Ativo' },
    { id: 4, name: 'Comunicação', description: 'Comunicação e mídia', coordinator: 'Eduarda Martins Souza', status: 'Ativo' }
  ],
  events: [
    { id: 1, title: 'Culto de celebração', date: '2026-10-18', time: '19:00', location: 'Templo principal', ministry: 'Todos', status: 'Confirmado', description: 'Culto semanal da comunidade' },
    { id: 2, title: 'Encontro de jovens', date: '2026-10-20', time: '19:30', location: 'Salão social', ministry: 'Jovens', status: 'Confirmado', description: 'Encontro e integração dos jovens' },
    { id: 3, title: 'Ensaio do louvor', date: '2026-10-22', time: '20:00', location: 'Templo principal', ministry: 'Louvor', status: 'Planejado', description: 'Ensaio semanal' },
    { id: 4, title: 'Ação solidária', date: '2026-10-25', time: '09:00', location: 'Salão social', ministry: 'Assistência', status: 'Confirmado', description: 'Ação de apoio à comunidade' }
  ],
  transactions: [
    { id: 1, description: 'Oferta geral', category: 'Ofertas', amount: 1850, type: 'Entrada', date: '2026-10-23', method: 'Transferência' },
    { id: 2, description: 'Conta de energia', category: 'Despesas fixas', amount: 1200, type: 'Saída', date: '2026-10-23', method: 'Transferência' },
    { id: 3, description: 'Doação para reforma', category: 'Doações', amount: 5000, type: 'Entrada', date: '2026-10-20', method: 'PIX' },
    { id: 4, description: 'Material de limpeza', category: 'Manutenção', amount: 150, type: 'Saída', date: '2026-10-18', method: 'Dinheiro' },
    { id: 5, description: 'Contribuição mensal', category: 'Contribuições', amount: 720, type: 'Entrada', date: '2026-10-16', method: 'PIX' }
  ],
  roles: [
    { id: 1, name: 'Administrador', description: 'Acesso administrativo completo', permissions: ['Membros', 'Eventos', 'Financeiro', 'Configurações'], users: 2 },
    { id: 2, name: 'Líder de ministério', description: 'Gerencia atividades do ministério', permissions: ['Membros', 'Eventos'], users: 4 },
    { id: 3, name: 'Tesouraria', description: 'Acompanha entradas, saídas e relatórios', permissions: ['Financeiro', 'Relatórios'], users: 2 },
    { id: 4, name: 'Membro', description: 'Consulta informações próprias e escalas', permissions: ['Perfil', 'Eventos', 'Escalas'], users: 108 }
  ],
  scales: [
    { id: 1, title: 'Recepção — culto de domingo', ministry: 'Recepção', date: '2026-10-18', time: '18:30', members: 'Bruno Almeida, Eduarda Martins', status: 'Confirmada' },
    { id: 2, title: 'Louvor — culto de domingo', ministry: 'Louvor', date: '2026-10-18', time: '18:00', members: 'Ana Paula, Daniel Lima', status: 'Confirmada' },
    { id: 3, title: 'Ação solidária', ministry: 'Assistência', date: '2026-10-25', time: '08:30', members: 'Equipe de apoio', status: 'Pendente' }
  ],
  settings: { churchName: 'Igreja Batista Central', email: 'contato@igreja.exemplo', phone: '(11) 4000-1234', address: 'Av. das Nações, 1420 — Centro', timezone: 'America/Sao_Paulo' }
};
