const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5080').replace(/\/$/, '');
// O modo de demonstração precisa ser ativado explicitamente; a configuração padrão usa a API real.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export async function api(path, options = {}) {
  const token = sessionStorage.getItem('churchmanager-token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    sessionStorage.removeItem('churchmanager-token');
    sessionStorage.removeItem('churchmanager-session');
    localStorage.removeItem('churchmanager-token'); // limpa tokens legados de versões anteriores
    localStorage.removeItem('churchmanager-session');
    if (!path.startsWith('/api/auth/')) window.dispatchEvent(new CustomEvent('churchmanager:unauthorized'));
  }

  if (!response.ok) {
    let message = `Falha na API (${response.status})`;
    try {
      const body = await response.json();
      message = body.message || body.title || message;
    } catch { /* resposta sem JSON */ }
    if (response.status === 429) message = 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.';
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}
