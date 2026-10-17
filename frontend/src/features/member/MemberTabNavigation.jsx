import Icon from '../../components/Icon.jsx';
import './MemberTabNavigation.css';

const tabs = [
  { id: 'home', label: 'Início', icon: 'grid' },
  { id: 'events', label: 'Eventos', icon: 'calendar' },
  { id: 'scales', label: 'Minhas escalas', icon: 'clock' },
  { id: 'profile', label: 'Meu perfil', icon: 'user' }
];

export default function MemberTabNavigation({ active, onChange }) {
  return (
    <nav className="member-tabs" aria-label="Área do membro">
      {tabs.map(tab => (
        <button key={tab.id} type="button" className={active === tab.id ? 'active' : ''} onClick={() => onChange(tab.id)}>
          <Icon name={tab.icon} size={17} />{tab.label}
        </button>
      ))}
    </nav>
  );
}
