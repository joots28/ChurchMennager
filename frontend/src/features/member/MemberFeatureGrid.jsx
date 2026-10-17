import Icon from '../../components/Icon.jsx';
import './MemberFeatureGrid.css';

export default function MemberFeatureGrid({ eventCount, scaleCount }) {
  return (
    <div className="member-feature-grid">
      <article><Icon name="calendar" size={23} /><span>Próximos eventos</span><strong>{eventCount}</strong><small>Eventos programados</small></article>
      <article><Icon name="clock" size={23} /><span>Minhas escalas</span><strong>{scaleCount}</strong><small>Escalas cadastradas</small></article>
      <article><Icon name="heart" size={23} /><span>Contribuições</span><strong>—</strong><small>Consulte a tesouraria</small></article>
    </div>
  );
}
