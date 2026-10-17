import { getTodayIso } from './appHelpers.js';

export function getRecordDefaults(resource) {
  const defaults = {
    members: { name: '', email: '', phone: '', ministry: 'Louvor', status: 'Ativo', role: 'Membro' },
    ministries: { name: '', description: '', coordinator: '', status: 'Ativo' },
    events: { title: '', date: getTodayIso(), time: '19:00', location: '', ministry: 'Todos', status: 'Planejado', description: '' },
    transactions: { description: '', category: 'Ofertas', amount: '', type: 'Entrada', date: getTodayIso(), method: 'PIX' },
    roles: { name: '', description: '', permissions: [], users: 0 },
    scales: { title: '', ministry: 'Louvor', date: getTodayIso(), time: '18:00', members: '', status: 'Pendente' }
  };
  return { ...(defaults[resource] || {}) };
}
