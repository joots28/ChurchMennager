import Icon from '../Icon.jsx';
import Brand from '../ui/Brand.jsx';
import Avatar from '../ui/Avatar.jsx';
import { nav } from '../../config/navigation.js';
import './Sidebar.css';
import '../ui/IconButton.css';

export default function Sidebar({ user, logout, data, module, setModule, setQuery, mobileNav, setMobileNav }) {
  return (
    <>
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand />
          <button className="icon-button sidebar-close" type="button" onClick={() => setMobileNav(false)} aria-label="Fechar menu">
            <Icon name="close" />
          </button>
        </div>

        <div className="church-switch">
          <span className="church-avatar"><Icon name="church" size={20} /></span>
          <span>
            <strong>{data.settings.churchName}</strong>
            <small>Plano demonstração</small>
          </span>
          <span className="switch-chevron">⌄</span>
        </div>

        <nav className="side-nav" aria-label="Navegação principal">
          {['PRINCIPAL', 'GESTÃO', 'ADMINISTRAÇÃO'].map(group => (
            <div className="nav-group" key={group}>
              <p>{group}</p>
              {nav.filter(item => item.group === group).map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${module === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setModule(item.id);
                    setQuery('');
                    setMobileNav(false);
                  }}
                >
                  <Icon name={item.icon} size={19} />
                  <span>{item.label}</span>
                  {item.id === 'events' && data.events.length > 0 && <span className="nav-count">{data.events.length}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <Avatar label={user.name.slice(0, 1).toUpperCase()} variant="blue" />
            <div className="user-info">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
            <button className="icon-button" type="button" onClick={logout} title="Sair" aria-label="Sair">
              <Icon name="logout" size={17} />
            </button>
          </div>
          <span className="sidebar-version">ChurchManager · versão TCC</span>
        </div>
      </aside>

      {mobileNav && <button className="nav-scrim" type="button" aria-label="Fechar menu" onClick={() => setMobileNav(false)} />}
    </>
  );
}
