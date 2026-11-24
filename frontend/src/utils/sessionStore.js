const SESSION_KEY = 'churchmanager-session';

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    // Remove tokens antigos; a sessão atual fica em cookie HttpOnly.
    localStorage.removeItem('churchmanager-token');
    sessionStorage.removeItem('churchmanager-token');
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
    } else if (user.role !== 'Administrador' && user.role !== 'Membro') {
      clearSession();
      return null;
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
