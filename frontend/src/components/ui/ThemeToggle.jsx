import Icon from '../Icon.jsx';
import './ThemeToggle.css';

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className={['theme-toggle', className].filter(Boolean).join(' ')}
      onClick={onToggle}
      aria-label={dark ? 'Ativar modo claro' : 'Ativar modo noturno'}
      title={dark ? 'Modo claro' : 'Modo noturno'}
    >
      <Icon name={dark ? 'sun' : 'moon'} size={18} />
    </button>
  );
}
