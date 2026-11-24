import { api } from './httpClient.js';

export async function apiLogin(identifier, password, portal = 'admin') {
  const result = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password, portal })
  });

  return {
    ...result,
    user: {
      name: result.name,
      email: result.email,
      role: result.role === 'Administrador' ? 'Administrador' : 'Membro'
    }
  };
}
