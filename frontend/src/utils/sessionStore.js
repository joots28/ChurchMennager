const SESSION_KEY = 'churchmanager-session';
const TOKEN_KEY = 'churchmanager-token';

function tokenIsValid(token) {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return false;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return Number.isFinite(payload.exp) && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    // Remove tokens legados de versões anteriores.
    localStorage.removeItem('churchmanager-token');
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // A aplicação também precisa conseguir sair em navegadores com armazenamento restrito.
  }
}

export function readSession(demoMode) {
  try {
    const storage = demoMode ? localStorage : sessionStorage;
    const stored = storage.getItem(SESSION_KEY);
    if (!stored) return null;
    const user = JSON.parse(stored);

    if (!user || typeof user.name !== 'string' || typeof user.role !== 'string') {
      clearSession();
      return null;
    }

    if (demoMode) {
      if (user.name !== 'Jonathan Otiniel' || user.role !== 'Administrador') {
        clearSession();
        return null;
      }
    } else {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if ((user.role !== 'Administrador' && user.role !== 'Membro') || !tokenIsValid(token || '')) {
        clearSession();
        return null;
      }
    }

    return user;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(user, demoMode) {
  const storage = demoMode ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(user));
}
