import Icon from '../../components/Icon.jsx';
import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Brand from '../../components/ui/Brand.jsx';
import ThemeToggle from '../../components/ui/ThemeToggle.jsx';
import InputField from '../../components/ui/InputField.jsx';
import { DEMO_MODE } from '../../services/httpClient.js';
import './Auth.css';

export default function Auth({ onLogin, onRegister, theme, onToggleTheme, initialNotice = '' }) {
  const [screen, setScreen] = useState('login');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(initialNotice);
  const [form, setForm] = useState({ email: '', password: '', name: '', confirm: '', church: 'Igreja Batista Central' });
  const change = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const submit = async e => {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      if (screen === 'login') await onLogin(form.email, form.password);
      else if (screen === 'register') {
        if (step === 1) {
          if (form.password.length < 12) throw new Error('A senha deve ter pelo menos 12 caracteres.');
          if (form.password !== form.confirm) throw new Error('As senhas não coincidem.');
          setStep(2); setBusy(false); return;
        }
        await onRegister(form);
      } else {
        if (!form.email) throw new Error('Informe seu e-mail cadastrado.');
        setNotice(DEMO_MODE ? 'Demonstração: o envio de e-mail não está conectado.' : 'A recuperação automática ainda não está configurada. Entre em contato com o administrador da igreja.');
      }
    } catch (err) { setError(err.message || 'Não foi possível concluir a operação.'); }
    finally { setBusy(false); }
  };
  const title = screen === 'login' ? 'Bem-vindo de volta' : screen === 'register' ? (step === 1 ? 'Comece grátis' : 'Cadastrar igreja') : 'Recuperar Senha';
  const subtitle = screen === 'login' ? 'Acesse sua conta para gerenciar as atividades, finanças e ministérios da sua comunidade.' : screen === 'register' ? (step === 1 ? 'Passo 1 de 2: Dados do administrador da conta.' : 'Passo 2 de 2: Informe o nome da igreja que será cadastrada.') : 'Digite seu e-mail cadastrado. A recuperação automática por e-mail ainda não está disponível.';
  return <main className="auth-page"><section className="auth-card"><div className="auth-top"><ThemeToggle theme={theme} onToggle={onToggleTheme} className="auth-theme-toggle" /><div className="status-bar"><span>9:41</span><span className="status-symbols"><i/><i/><b/></span></div><div className="auth-brand"><Brand /></div>
    {screen === 'recover' && <button className="back-link" type="button" onClick={() => { setScreen('login'); setError(''); setNotice(''); }}><span>‹</span> Voltar ao login</button>}
    <div className="auth-hero">{screen === 'recover' && <div className="recover-icon"><Icon name="lock" size={24} /></div>}{screen === 'register' && <div className="steps"><i className={step >= 1 ? 'active' : ''}/><i className={step >= 2 ? 'active' : ''}/></div>}<h1>{title}</h1><p>{subtitle}</p></div>
    <form id="auth-form" className="auth-form" onSubmit={submit}>
      {screen === 'register' && step === 1 && <InputField label="Nome completo" name="name" value={form.name} onChange={change} placeholder="Seu nome e sobrenome" icon="user" minLength={2} maxLength={160} autoComplete="name" required />}
      {(screen !== 'register' || step === 1) && <InputField label={screen === 'login' ? 'Usuário ou e-mail' : 'E-mail'} name="email" value={form.email} onChange={change} placeholder={screen === 'login' ? 'Jonathan Otiniel' : 'exemplo@igreja.com'} type={screen === 'login' ? 'text' : 'email'} icon={screen === 'login' ? 'user' : 'mail'} maxLength={254} autoComplete={screen === 'login' ? 'username' : 'email'} required />}
      {screen !== 'recover' && (screen !== 'register' || step === 1) && <InputField label="Senha" name="password" value={form.password} onChange={change} placeholder={screen === 'register' ? 'Mínimo 12 caracteres' : 'Sua senha secreta'} type={showPassword ? 'text' : 'password'} icon="lock" minLength={screen === 'register' ? 12 : 1} maxLength={128} autoComplete={screen === 'register' ? 'new-password' : 'current-password'} rightIcon="eye" onRightClick={() => setShowPassword(v => !v)} required />}
      {screen === 'register' && step === 1 && <InputField label="Confirmação de senha" name="confirm" value={form.confirm} onChange={change} placeholder="Repita a senha criada" type={showPassword ? 'text' : 'password'} icon="lock" minLength={12} maxLength={128} autoComplete="new-password" rightIcon="eye" onRightClick={() => setShowPassword(v => !v)} required />}
      {screen === 'login' && DEMO_MODE && <p className="auth-demo-hint">Acesso demonstrativo: <strong>Jonathan Otiniel</strong> · senha <strong>1234</strong>. Use apenas para testar dados fictícios.</p>}
      {screen === 'login' && <div className="forgot-row"><button type="button" onClick={() => { setScreen('recover'); setError(''); setNotice(''); }}>Esqueci minha senha</button></div>}
      {screen === 'register' && step === 2 && <InputField label="Nome da igreja" name="church" value={form.church} onChange={change} placeholder="Nome oficial da instituição" icon="building" minLength={2} maxLength={180} required />}
      {error && <div className="alert alert-error" role="alert">{error}</div>}{notice && <div className="alert alert-info" role="status">{notice}</div>}
      {screen === 'register' && step === 2 && <button className="text-button" type="button" onClick={() => setStep(1)}>Voltar ao passo anterior</button>}
    </form></div>
    <div className="auth-bottom"><div className="auth-submit"><Button form="auth-form" type="submit" icon="arrow" disabled={busy}>{busy ? 'Aguarde...' : screen === 'login' ? 'Entrar' : screen === 'register' ? (step === 1 ? 'Próximo' : 'Concluir cadastro') : 'Continuar'}</Button></div>{screen === 'login' ? (DEMO_MODE ? <p>Acesso demonstrativo restrito · cadastros desativados</p> : <p>Não tem uma conta? <button onClick={() => { setScreen('register'); setStep(1); setError(''); setNotice(''); }}>Criar nova conta</button></p>) : screen === 'register' ? <p>Já tem uma conta? <button onClick={() => { setScreen('login'); setStep(1); }}>Entrar</button></p> : <p>Lembrou sua senha? <button onClick={() => setScreen('login')}>Entrar</button></p>}</div>
  </section></main>;
}
