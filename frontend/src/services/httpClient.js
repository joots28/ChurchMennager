const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5080').replace(/\/$/, '');
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export async function api(path, options = {}) {
  const response = await fetch(API_URL + path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    sessionStorage.removeItem('churchmanager-session');
    if (!path.startsWith('/api/auth/')) {
      window.dispatchEvent(new CustomEvent('churchmanager:unauthorized'));
    }
  }

  if (!response.ok) {
    let message = 'Falha na API (' + response.status + ')';
    try {
      const body = await response.json();
      message = body.message || body.title || message;
    } catch {
      // A API pode retornar uma resposta sem corpo JSON.
    }
    if (response.status === 429) {
      message = 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.';
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}
