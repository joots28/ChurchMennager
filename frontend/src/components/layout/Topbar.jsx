import Icon from '../Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import './Topbar.css';
import '../ui/IconButton.css';

export default function Topbar({ user, meta, demo, theme, toggleTheme, setMobileNav }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" type="button" onClick={() => setMobileNav(true)} aria-label="Abrir menu">
        <Icon name="menu" />
      </button>
      <div className="breadcrumb">
        <span>ChurchManager</span>
        <span className="crumb-sep">/</span>
        <strong>{meta[0]}</strong>
      </div>
      <div className="topbar-actions">
        <span className={`mode-tag ${demo ? 'demo' : 'live'}`}>{demo ? 'Demonstração' : 'API conectada'}</span>
<ThemeToggle theme={theme} onToggle={toggleTheme} className="icon-button" />
        <button className="icon-button notification-button" type="button" title="Notificações" aria-label="Notificações">
          <Icon name="bell" size={19} /><i />
        </button>
        <div className="topbar-user">
          <Avatar label={user.name.slice(0, 1).toUpperCase()} variant="blue" />
          <span><strong>{user.name}</strong><small>{user.role}</small></span>
        </div>
      </div>
    </header>
  );
}
