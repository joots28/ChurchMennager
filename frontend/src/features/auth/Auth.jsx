import Icon from '../../components/Icon.jsx';
import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Brand from '../../components/ui/Brand.jsx';
import ThemeToggle from '../../components/ui/ThemeToggle.jsx';
import InputField from '../../components/ui/InputField.jsx';
import { DEMO_MODE } from '../../services/httpClient.js';
import './Auth.css';

export default function Auth({ onLogin, onRegister, theme, onToggleTheme, initialNotice = '' }) {
  const memberPortal = window.location.pathname.startsWith('/membro');
  const portal = memberPortal ? 'member' : 'admin';
  const [screen, setScreen] = useState('login');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(initialNotice);
  const [form, setForm] = useState({ email: '', password: '', name: '', confirm: '', church: '' });
  const change = (key, value) => setForm(old => ({ ...old, [key]: value }));

  const submit = async event => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (screen === 'login') {
        await onLogin(form.email, form.password, portal);
      } else if (screen === 'register') {
        if (step === 1) {
          if (form.password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
          if (form.password !== form.confirm) throw new Error('As senhas não coincidem.');
          if (form.name.trim().length < 2 || !form.email.trim()) throw new Error('Preencha seu nome e e-mail.');
          setStep(2);
          return;
        }
        await onRegister(form);
      } else {
        setNotice('A recuperação de senha ainda não está disponível. Entre em contato com o administrador da igreja.');
      }
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível concluir a operação.');
    } finally {
      setBusy(false);
    }
  };

  const isRegister = screen === 'register';
  const title = screen === 'recover'
    ? 'Recuperar senha'
    : isRegister
      ? step === 1 ? 'Criar conta administrativa' : 'Cadastrar igreja'
      : memberPortal ? 'Portal do Membro' : 'Acesso Administrativo';
  const subtitle = screen === 'recover'
    ? 'Entre em contato com a administração para recuperar seu acesso.'
    : isRegister
      ? step === 1 ? 'Crie a conta responsável pela sua igreja.' : 'Informe os dados da instituição.'
      : memberPortal
        ? 'Acesse eventos, escalas e informações da sua comunidade.'
        : 'Acesse a gestão de membros, ministérios, eventos e finanças.';

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-top">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} className="auth-theme-toggle" />
          <div className="auth-brand"><Brand /></div>
          <nav className="auth-portals" aria-label="Tipo de acesso">
            <a href="/admin/login" className={!memberPortal ? 'active' : ''}>Administrador</a>
            <a href="/membro/login" className={memberPortal ? 'active' : ''}>Membro</a>
          </nav>
          {screen === 'recover' && (
            <button className="back-link" type="button" onClick={() => { setScreen('login'); setError(''); }}>
              <span aria-hidden="true">←</span> Voltar ao acesso
            </button>
          )}
          <div className="auth-hero">
            {screen === 'recover' && <div className="recover-icon"><Icon name="lock" size={24} /></div>}
            {isRegister && <div className="steps"><i className={step >= 1 ? 'active' : ''} /><i className={step >= 2 ? 'active' : ''} /></div>}
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <form id="auth-form" className="auth-form" onSubmit={submit}>
            {isRegister && step === 1 && (
              <InputField label="Nome completo" name="name" value={form.name} onChange={change} placeholder="Seu nome e sobrenome" icon="user" minLength={2} maxLength={100} autoComplete="name" required />
            )}
            {(screen !== 'register' || step === 1) && (
              <InputField
                label={memberPortal && screen === 'login' ? 'E-mail ou usuário cadastrado' : screen === 'login' ? 'Usuário ou e-mail' : 'E-mail'}
                name="email" value={form.email} onChange={change}
                placeholder={screen === 'login' ? 'Digite seu usuário ou e-mail' : 'voce@igreja.com'}
                type={screen === 'login' ? 'text' : 'email'} icon={screen === 'login' ? 'user' : 'mail'}
                maxLength={254} autoComplete={screen === 'login' ? 'username' : 'email'} required
              />
            )}
            {screen !== 'recover' && (screen !== 'register' || step === 1) && (
              <InputField
                label="Senha" name="password" value={form.password} onChange={change}
                placeholder={screen === 'register' ? 'Mínimo de 8 caracteres' : 'Sua senha'}
                type={showPassword ? 'text' : 'password'} icon="lock"
                minLength={screen === 'register' ? 8 : 1} maxLength={128}
                autoComplete={screen === 'register' ? 'new-password' : 'current-password'}
                rightIcon="eye" onRightClick={() => setShowPassword(value => !value)} required
              />
            )}
            {isRegister && step === 1 && (
              <InputField
                label="Confirmar senha" name="confirm" value={form.confirm} onChange={change}
                placeholder="Digite a senha novamente" type={showPassword ? 'text' : 'password'}
                icon="lock" minLength={8} maxLength={128} autoComplete="new-password" required
              />
            )}
            {isRegister && step === 2 && (
              <InputField label="Nome da igreja" name="church" value={form.church} onChange={change} placeholder="Nome oficial da igreja" icon="building" minLength={2} maxLength={100} required />
            )}
            {screen === 'login' && DEMO_MODE && !memberPortal && (
              <p className="auth-demo-hint">Acesso demonstrativo: <strong>Jonathan Otiniel</strong> · senha <strong>1234</strong>. Use apenas dados fictícios.</p>
            )}
            {screen === 'login' && <div className="forgot-row"><button type="button" onClick={() => { setScreen('recover'); setError(''); }}>Esqueci minha senha</button></div>}
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            {notice && <div className="alert alert-info" role="status">{notice}</div>}
            {isRegister && step === 2 && <button className="text-button" type="button" onClick={() => setStep(1)}>Voltar ao passo anterior</button>}
          </form>
        </div>
        <div className="auth-bottom">
          <div className="auth-submit">
            <Button form="auth-form" type="submit" icon="arrow" disabled={busy}>
              {busy ? 'Aguarde...' : screen === 'login' ? 'Entrar' : isRegister ? step === 1 ? 'Continuar' : 'Criar igreja' : 'Continuar'}
            </Button>
          </div>
          {screen === 'login' ? (
            memberPortal
              ? <p>Não possui acesso? <span>Solicite ao administrador da sua igreja.</span></p>
              : <p>Precisa cadastrar uma igreja? <button type="button" onClick={() => { setScreen('register'); setStep(1); setError(''); }}>Criar conta administrativa</button></p>
          ) : isRegister ? (
            <p>Já possui uma conta? <button type="button" onClick={() => { setScreen('login'); setStep(1); }}>Entrar</button></p>
          ) : (
            <p>Lembrou sua senha? <button type="button" onClick={() => setScreen('login')}>Entrar</button></p>
          )}
          <a className="auth-privacy-link" href="/privacidade">Privacidade e política de cookies</a>
        </div>
      </section>
    </main>
  );
}
