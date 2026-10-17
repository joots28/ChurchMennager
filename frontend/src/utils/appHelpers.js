export function getTodayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const toId = records => Math.max(0, ...records.map(record => Number(record.id) || 0)) + 1;
export const humanRole = role => String(role || '').toLowerCase().includes('membro') && !String(role).toLowerCase().includes('ministério') ? 'Membro' : 'Administrador';
