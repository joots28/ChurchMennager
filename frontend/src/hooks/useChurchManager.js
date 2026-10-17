import { useEffect, useRef, useState } from 'react';
import { loadDemoData, saveDemoData } from '../services/demoStorage.js';
import { api, apiLogin, apiResource, DEMO_MODE } from '../services/index.js';
import { moduleMeta } from '../config/navigation.js';
import { humanRole } from '../utils/appHelpers.js';
import useTheme from './useTheme.js';
import useRecordActions from './useRecordActions.js';
import { clearSession, readSession, saveSession } from '../utils/sessionStore.js';
import { authenticateDemo } from '../services/demoAuthService.js';

const emptyData = () => ({
  members: [], ministries: [], events: [], transactions: [], roles: [], scales: [],
  settings: { churchName: '', email: '', phone: '', address: '', timezone: 'America/Sao_Paulo' }
});

export default function useChurchManager() {
  const [user, setUser] = useState(() => readSession(DEMO_MODE));
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState(() => DEMO_MODE ? loadDemoData() : emptyData());
  const [module, setModule] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const loadedRemoteData = useRef(false);
  const demo = DEMO_MODE;
  useEffect(() => { if (demo) saveDemoData(data); }, [data, demo]);
  useEffect(() => {
    const expireSession = () => { loadedRemoteData.current = false; clearSession(); setUser(null); setModule('dashboard'); setDialog(null); setData(emptyData()); };
    window.addEventListener('churchmanager:unauthorized', expireSession);
    return () => window.removeEventListener('churchmanager:unauthorized', expireSession);
  }, []);
  // Recarrega dados da API ao atualizar a página com uma sessão válida no sessionStorage.
  useEffect(() => {
    if (demo || !user || loadedRemoteData.current) return;
    let active = true;
    loadedRemoteData.current = true;
    (async () => {
      try {
        const names = ['members', 'ministries', 'events', 'transactions', 'roles', 'scales'];
        const loaded = await Promise.all([...names.map(resource => apiResource(resource)), api('/api/church/settings')]);
        if (active) setData(old => ({ ...old, ...Object.fromEntries(names.map((resource, index) => [resource, loaded[index] || []])), settings: loaded[6] || old.settings }));
      } catch (error) {
        if (!active) return;
        loadedRemoteData.current = false;
        clearSession();
        setUser(null);
        setToast(`A sessão não pôde ser restaurada: ${error.message}`);
      }
    })();
    return () => { active = false; };
  }, [demo, user]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(''), 3000); return () => clearTimeout(id); } }, [toast]);
  const tell = text => setToast(text);
  const logout = () => {
    loadedRemoteData.current = false;
    setToast('');
    clearSession();
    setUser(null);
    setModule('dashboard');
    setDialog(null);
    setData(demo ? loadDemoData() : emptyData());
  };
  async function login(identifier, password) {
    const loginIdentifier = String(identifier || '').trim();
    if (!loginIdentifier || !password) throw new Error('Informe seu usuário e senha.');

    const result = demo
      ? { user: authenticateDemo(loginIdentifier, password) }
      : await apiLogin(loginIdentifier, password);
    const next = result.user;

    if (!demo) {
      const names = ['members', 'ministries', 'events', 'transactions', 'roles', 'scales'];
      try {
        const loaded = await Promise.all([...names.map(resource => apiResource(resource)), api('/api/church/settings')]);
        setData(old => ({
          ...old,
          ...Object.fromEntries(names.map((resource, index) => [resource, loaded[index] || []])),
          settings: loaded[6] || old.settings
        }));
        loadedRemoteData.current = true;
      } catch (error) {
        loadedRemoteData.current = false;
        clearSession();
        throw new Error(`Não foi possível carregar os dados protegidos. ${error.message}`);
      }
    }

    saveSession(next, demo);
    setUser(next);
    setModule('dashboard');
  }

  async function register(values) {
    if (demo) throw new Error('O cadastro está desativado nesta demonstração. Use o acesso autorizado.');
    const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: values.name, email: values.email, password: values.password, churchName: values.church }) });
    if (result.token) sessionStorage.setItem('churchmanager-token', result.token);
    const next = { name: result.name, email: result.email, role: result.role || 'Administrador' };
    saveSession(next, false);
    setUser(next);
  }
  const {
    filtered, add, edit, remove, saveRecord, changeForm,
    handleAction, exportCsv
  } = useRecordActions({ module, data, query, dialog, form, setForm, setDialog, setData, setSaving, tell });
  const meta = moduleMeta[module] || moduleMeta.dashboard;

  return {
    user, setUser, data, setData, module, setModule, query, setQuery,
    dialog, setDialog, toast, setToast, mobileNav, setMobileNav, saving,
    form, setForm, theme, toggleTheme, demo, login, register, logout,
    filtered, add, edit, remove, saveRecord, changeForm,
    handleAction, exportCsv, tell, meta, humanRole
  };
}
