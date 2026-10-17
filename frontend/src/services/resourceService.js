import { api } from './httpClient.js';

const resourcePaths = Object.freeze({
  members: 'members',
  ministries: 'ministries',
  events: 'events',
  transactions: 'transactions',
  roles: 'roles',
  scales: 'scales'
});

export async function apiResource(resource, method = 'GET', item = null) {
  if (!Object.hasOwn(resourcePaths, resource)) throw new Error('Área do sistema não reconhecida.');
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) throw new Error('Operação não permitida.');
  const path = `/api/${resourcePaths[resource]}`;
  const id = item?.id;
  const payload = item && method !== 'DELETE' ? { ...item } : undefined;
  if (payload) delete payload.id;
  if (resource === 'roles' && payload?.permissions) { payload.permissionsJson = JSON.stringify(payload.permissions); delete payload.permissions; }
  if (resource === 'events' && payload?.date) { payload.startsAt = `${payload.date}T${payload.time || '00:00'}:00`; delete payload.date; delete payload.time; }
  if (resource === 'transactions' && payload?.date) { payload.transactionDate = payload.date; delete payload.date; payload.transactionType = payload.type === 'Entrada' ? 'Income' : 'Expense'; delete payload.type; }
  if (resource === 'scales' && payload?.date) { payload.startsAt = `${payload.date}T${payload.time || '00:00'}:00`; delete payload.date; delete payload.time; payload.assignedMembersJson = JSON.stringify((payload.members || '').split(',').map(x => x.trim()).filter(Boolean)); delete payload.members; }
  const result = await api(`${path}${id && method !== 'POST' ? `/${id}` : ''}`, { method, ...(payload ? { body: JSON.stringify(payload) } : {}) });
  const normalize = item => {
    if (!item) return item;
    if (resource === 'roles') return { ...item, permissions: (()=>{try{return JSON.parse(item.permissionsJson || '[]')}catch{return []}})() };
    if (resource === 'events' || resource === 'scales') { const d = String(item.startsAt || item.StartsAt || ''); const normalized = { ...item, date: d.slice(0,10), time: d.slice(11,16) }; if (resource === 'scales') { try { normalized.members = JSON.parse(item.assignedMembersJson || item.AssignedMembersJson || '[]').join(', '); } catch { normalized.members = ''; } } return normalized; }
    if (resource === 'transactions') return { ...item, date: (item.transactionDate || item.TransactionDate || '').toString().slice(0,10), type: (item.transactionType || item.TransactionType) === 'Income' ? 'Entrada' : 'Saída' };
    return item;
  };
  return Array.isArray(result) ? result.map(normalize) : normalize(result);
}
