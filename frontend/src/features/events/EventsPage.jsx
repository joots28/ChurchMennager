import Icon from '../../components/Icon.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { dateBR } from '../../utils/formatters.js';
import ResourceTablePage from '../management/ResourceTablePage.jsx';
import './EventsPage.css';

const columns = [
  {
    key: 'title',
    label: 'Evento',
    render: (value, event) => (
      <div>
        <strong>{value}</strong>
        <small className="cell-subtitle">{event.location}</small>
      </div>
    ),
  },
  { key: 'date', label: 'Data', render: (value) => dateBR(value) },
  { key: 'time', label: 'Horário' },
  { key: 'ministry', label: 'Ministério' },
  { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> },
];

export default function EventsPage({ data, meta, filtered, edit, remove, exportCsv }) {
  return (
    <>
      <div className="calendar-summary">
        <div className="calendar-illustration"><Icon name="calendar" size={24} /></div>
        <div>
          <strong>Agenda da comunidade</strong>
          <p>Consulte as atividades e mantenha o calendário organizado.</p>
        </div>
        <span className="calendar-count">{data.events.length} eventos</span>
      </div>
      <ResourceTablePage title={meta[0]} rows={filtered} columns={columns} onEdit={edit} onDelete={remove} onExport={exportCsv} />
    </>
  );
}
