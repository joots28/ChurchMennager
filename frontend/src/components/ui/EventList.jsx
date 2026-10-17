import Badge from './Badge.jsx';
import EmptyState from './EmptyState.jsx';
import Icon from '../Icon.jsx';
import { dateBR } from '../../utils/formatters.js';
import './EventList.css';

function getDateParts(value) {
  const date = new Date(`${value}T12:00:00`);
  return {
    day: date.getDate(),
    month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '')
  };
}

export default function EventList({
  items, kind = 'events', showStatus = false, showFullDate = false,
  emptyText = 'Nenhum registro encontrado.'
}) {
  if (!items?.length) return <EmptyState text={emptyText} />;

  return (
    <div className="event-list">
      {items.map(item => {
        const dateValue = kind === 'scales' ? item.date : item.date;
        const date = getDateParts(dateValue);
        const details = [
          showFullDate ? dateBR(dateValue) : null,
          item.time || null,
          kind !== 'scales' ? item.location || null : null
        ].filter(Boolean).join(' · ');

        return (
          <div className="event-row" key={item.id}>
            <div className="event-date"><strong>{date.day}</strong><span>{date.month}</span></div>
            <div className="event-info">
              <strong>{item.title}</strong>
              <span>{!showFullDate && <Icon name="clock" size={14} />} {details}</span>
            </div>
            {showStatus && <Badge>{item.status}</Badge>}
          </div>
        );
      })}
    </div>
  );
}
