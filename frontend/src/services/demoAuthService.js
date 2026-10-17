const DEMO_THROTTLE_KEY = 'churchmanager-demo-login-throttle';
const DEMO_USER = Object.freeze({
  name: 'Jonathan Otiniel',
  email: 'jonathan@churchmanager.test',
  role: 'Administrador'
});

export function authenticateDemo(identifier, password) {
  const normalizedIdentifier = String(identifier || '').trim().toLocaleLowerCase('pt-BR');
  let throttle = { failures: 0, lockedUntil: 0 };

  try {
    throttle = { ...throttle, ...JSON.parse(sessionStorage.getItem(DEMO_THROTTLE_KEY) || '{}') };
  } catch {
    // A sessão de demonstração pode não permitir armazenamento.
  }

  if (Number(throttle.lockedUntil) > Date.now()) {
    const seconds = Math.ceil((Number(throttle.lockedUntil) - Date.now()) / 1000);
    throw new Error(`Acesso temporariamente bloqueado. Aguarde ${seconds} s.`);
  }

  if (normalizedIdentifier !== 'jonathan otiniel' || password !== '1234') {
    const failures = Number(throttle.failures || 0) + 1;
    const lockedUntil = failures >= 5 ? Date.now() + 60_000 : 0;
    try {
      sessionStorage.setItem(DEMO_THROTTLE_KEY, JSON.stringify({ failures: lockedUntil ? 0 : failures, lockedUntil }));
    } catch {
      // O bloqueio em memória da demonstração não é um controle de segurança de produção.
    }
    throw new Error(lockedUntil
      ? 'Muitas tentativas inválidas. Acesso bloqueado por 60 segundos nesta demonstração.'
      : 'Usuário ou senha inválidos.');
  }

  try { sessionStorage.removeItem(DEMO_THROTTLE_KEY); } catch { /* armazenamento opcional */ }
  return { ...DEMO_USER };
}
