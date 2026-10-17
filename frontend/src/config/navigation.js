const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', group: 'PRINCIPAL' },
  { id: 'members', label: 'Gestão de membros', icon: 'users', group: 'GESTÃO' },
  { id: 'ministries', label: 'Ministérios', icon: 'church', group: 'GESTÃO' },
  { id: 'events', label: 'Eventos e calendário', icon: 'calendar', group: 'GESTÃO' },
  { id: 'finance', label: 'Controle financeiro', icon: 'wallet', group: 'GESTÃO' },
  { id: 'scales', label: 'Gestão de escalas', icon: 'clock', group: 'GESTÃO' },
  { id: 'roles', label: 'Gestão de cargos', icon: 'shield', group: 'ADMINISTRAÇÃO' },
  { id: 'settings', label: 'Configurações', icon: 'settings', group: 'ADMINISTRAÇÃO' }
];
const moduleMeta = {
  dashboard: ['Dashboard', 'Visão geral das atividades da sua comunidade'],
  members: ['Gestão de membros', 'Organize e acompanhe os membros da igreja'],
  ministries: ['Ministérios', 'Gerencie as equipes e suas áreas de atuação'],
  events: ['Eventos e calendário', 'Planeje e acompanhe as próximas atividades'],
  finance: ['Controle financeiro', 'Acompanhe entradas, saídas e saldo da instituição'],
  scales: ['Gestão de escalas', 'Organize equipes e responsáveis por atividade'],
  roles: ['Gestão de cargos', 'Gerencie perfis e permissões de acesso'],
  settings: ['Configurações da igreja', 'Mantenha os dados institucionais atualizados']
};

export { nav, moduleMeta };
