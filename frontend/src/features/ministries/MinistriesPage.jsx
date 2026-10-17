import Badge from '../../components/ui/Badge.jsx';
import ResourceTablePage from '../management/ResourceTablePage.jsx';

const columns = [
  { key: 'name', label: 'Ministério', render: (value) => <strong>{value}</strong> },
  { key: 'description', label: 'Descrição' },
  { key: 'coordinator', label: 'Coordenador' },
  { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> },
];

export default function MinistriesPage({ meta, filtered, edit, remove, exportCsv }) {
  return (
    <ResourceTablePage title={meta[0]} rows={filtered} columns={columns} onEdit={edit} onDelete={remove} onExport={exportCsv} />
  );
}
