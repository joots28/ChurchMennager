import Badge from '../../components/ui/Badge.jsx';
import { dateBR } from '../../utils/formatters.js';
import ResourceTablePage from '../management/ResourceTablePage.jsx';

const columns = [
  {
    key: 'title',
    label: 'Escala',
    render: (value, scale) => (
      <div>
        <strong>{value}</strong>
        <small className="cell-subtitle">{scale.ministry}</small>
      </div>
    ),
  },
  { key: 'date', label: 'Data', render: (value) => dateBR(value) },
  { key: 'time', label: 'Horário' },
  { key: 'members', label: 'Equipe' },
  { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> },
];

export default function ScalesPage({ meta, filtered, edit, remove, exportCsv }) {
  return (
    <ResourceTablePage title={meta[0]} rows={filtered} columns={columns} onEdit={edit} onDelete={remove} onExport={exportCsv} />
  );
}
