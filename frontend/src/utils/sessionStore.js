const SESSION_KEY = 'churchmanager-session';
const TOKEN_KEY = 'churchmanager-token';

function removeFrom(storage, key) {
  try { storage.removeItem(key); } catch { /* armazenamento indisponível */ }
}

export function clearSession() {
  try { removeFrom(localStorage, SESSION_KEY); removeFrom(localStorage, TOKEN_KEY); } catch { /* ambiente sem localStorage */ }
  try { removeFrom(sessionStorage, SESSION_KEY); removeFrom(sessionStorage, TOKEN_KEY); } catch { /* ambiente sem sessionStorage */ }
}

export function readSession(demoMode) {
  try {
    const storage = demoMode ? localStorage : sessionStorage;
    if (!demoMode) {
      removeFrom(localStorage, TOKEN_KEY);
      removeFrom(localStorage, SESSION_KEY);
    }

    const stored = storage.getItem(SESSION_KEY);
    if (!stored) return null;

    const user = JSON.parse(stored);
    if (demoMode) {
      const authorizedDemoUser = user?.name === 'Jonathan Otiniel' && user?.role === 'Administrador';
      if (!authorizedDemoUser) {
        removeFrom(storage, SESSION_KEY);
        return null;
      }
      return user;
    }

    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Token ausente.');
    const segments = token.split('.');
    if (segments.length !== 3 || !segments[1]) throw new Error('Token inválido.');

    const payloadPart = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payloadPart.padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedPayload));
    if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new Error('Sessão expirada.');
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
