import Icon from '../Icon.jsx';
import './MetricCard.css';

export default function MetricCard({ label, value, sub, icon, trend }) {
  return (
    <article className="metric-card">
      <div className="metric-heading">
        <span>{label}</span>
        <span className="metric-icon"><Icon name={icon} size={20} /></span>
      </div>
      <div className="metric-value">{value}</div>
      <div className={`metric-sub ${trend === 'down' ? 'neutral' : ''}`}>{sub}</div>
    </article>
  );
}
