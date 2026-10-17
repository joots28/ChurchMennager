import Brand from '../../components/ui/Brand.jsx';
import ThemeToggle from '../../components/ui/ThemeToggle.jsx';
import Icon from '../../components/Icon.jsx';
import './MemberTopbar.css';
import '../../components/ui/IconButton.css';

export default function MemberTopbar({ user, theme, onToggleTheme, onLogout }) {
  return (
    <header className="member-topbar">
      <Brand />
      <div className="member-top-right">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <span>{user.name}</span>
        <button className="icon-button" type="button" title="Sair" aria-label="Sair" onClick={onLogout}>
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
}
