const VALID_PERMISSIONS = new Set([
  'Membros', 'Eventos', 'Financeiro', 'Relatórios',
  'Configurações', 'Perfil', 'Escalas'
]);
const VALID = {
  members: { ministry: ['Louvor', 'Recepção', 'Ministério Infantil', 'Comunicação', 'Assistência', 'Jovens', 'Todos'], role: ['Membro', 'Líder', 'Administrador', 'Tesouraria'], status: ['Ativo', 'Inativo'] },
  ministries: { status: ['Ativo', 'Inativo'] },
  events: { ministry: ['Todos', 'Louvor', 'Recepção', 'Ministério Infantil', 'Comunicação', 'Assistência', 'Jovens'], status: ['Planejado', 'Confirmado', 'Cancelado'] },
  transactions: { type: ['Entrada', 'Saída'], category: ['Ofertas', 'Contribuições', 'Doações', 'Despesas fixas', 'Manutenção', 'Eventos', 'Outros'], method: ['PIX', 'Transferência', 'Dinheiro', 'Cartão', 'Outro'] },
  scales: { ministry: ['Louvor', 'Recepção', 'Ministério Infantil', 'Comunicação', 'Assistência', 'Jovens'], status: ['Pendente', 'Confirmada', 'Concluída'] }
};

function required(value, label) {
  if (value == null || String(value).trim() === '') throw new Error(`Preencha o campo ${label}.`);
}
function maxLength(value, label, limit) {
  if (String(value ?? '').length > limit) throw new Error(`${label} deve ter no máximo ${limit} caracteres.`);
}
function minLength(value, label, limit) {
  if (String(value ?? '').trim().length < limit) throw new Error(`${label} deve ter pelo menos ${limit} caracteres.`);
}
function choice(resource, key, value, label) {
  const options = VALID[resource]?.[key];
  if (options && !options.includes(value)) throw new Error(`Selecione uma opção válida para ${label}.`);
}
function validDate(value, label) {
  required(value, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Informe uma ${label.toLowerCase()} válida.`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`Informe uma ${label.toLowerCase()} válida.`);
  }
}
function validTime(value) {
  required(value, 'Horário');
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Informe um horário válido.');
}

export function validateRecord(resource, record) {
  if (resource === 'members') {
    required(record.name, 'Nome completo'); minLength(record.name, 'Nome completo', 2); maxLength(record.name, 'Nome completo', 160);
    maxLength(record.email, 'E-mail', 254); maxLength(record.phone, 'Telefone', 40);
    if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email.trim())) throw new Error('Informe um e-mail válido ou deixe o campo vazio.');
    choice(resource, 'ministry', record.ministry, 'Ministério'); choice(resource, 'role', record.role, 'Cargo'); choice(resource, 'status', record.status, 'Status');
  }
  if (resource === 'ministries') {
    required(record.name, 'Nome do ministério'); minLength(record.name, 'Nome do ministério', 2); maxLength(record.name, 'Nome do ministério', 160);
    maxLength(record.description, 'Descrição', 500); maxLength(record.coordinator, 'Coordenador', 160); choice(resource, 'status', record.status, 'Status');
  }
  if (resource === 'events') {
    required(record.title, 'Nome do evento'); minLength(record.title, 'Nome do evento', 2); maxLength(record.title, 'Nome do evento', 180);
    validDate(record.date, 'Data'); validTime(record.time); maxLength(record.location, 'Local', 180); maxLength(record.description, 'Descrição', 1000);
    choice(resource, 'ministry', record.ministry, 'Ministério'); choice(resource, 'status', record.status, 'Status');
  }
  if (resource === 'transactions') {
    required(record.description, 'Descrição'); minLength(record.description, 'Descrição', 2); maxLength(record.description, 'Descrição', 180);
    required(record.amount, 'Valor'); const amount = Number(record.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 9_999_999_999.99 || Math.round(amount * 100) !== amount * 100) throw new Error('Informe um valor positivo de até R$ 9.999.999.999,99 e com no máximo duas casas decimais.');
    validDate(record.date, 'Data'); choice(resource, 'type', record.type, 'Tipo de movimentação'); choice(resource, 'category', record.category, 'Categoria'); choice(resource, 'method', record.method, 'Método');
  }
  if (resource === 'roles') {
    required(record.name, 'Nome do cargo'); minLength(record.name, 'Nome do cargo', 2); maxLength(record.name, 'Nome do cargo', 120); maxLength(record.description, 'Descrição', 500);
    const permissions = Array.isArray(record.permissions) ? record.permissions : [];
    if (permissions.length > VALID_PERMISSIONS.size || permissions.some(permission => !VALID_PERMISSIONS.has(permission))) throw new Error('Remova as permissões inválidas e tente novamente.');
  }
  if (resource === 'scales') {
    required(record.title, 'Nome da escala'); minLength(record.title, 'Nome da escala', 2); maxLength(record.title, 'Nome da escala', 180);
    validDate(record.date, 'Data'); validTime(record.time); maxLength(record.members, 'Equipe', 8000);
    choice(resource, 'ministry', record.ministry, 'Ministério'); choice(resource, 'status', record.status, 'Status');
    if (String(record.members ?? '').split(',').filter(x => x.trim()).length > 500) throw new Error('A escala pode ter no máximo 500 integrantes.');
  }
}
