import { api } from './httpClient.js';

export async function apiLogin(identifier, password) {
  const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
  if (result.token) sessionStorage.setItem('churchmanager-token', result.token);
  return { ...result, user: { name: result.name, email: result.email, role: result.role || 'Administrador' } };
}

