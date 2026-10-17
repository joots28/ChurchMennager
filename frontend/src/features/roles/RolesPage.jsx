import ResourceTablePage from '../management/ResourceTablePage.jsx';
import './RolesPage.css';

const columns = [
  { key: 'name', label: 'Cargo', render: (value) => <strong>{value}</strong> },
  { key: 'description', label: 'Descrição' },
  {
    key: 'permissions',
    label: 'Permissões',
    render: (value = []) => (
      <div className="permission-tags">
        {value.map((permission) => <span key={permission}>{permission}</span>)}
      </div>
    ),
  },
  { key: 'users', label: 'Usuários' },
];

export default function RolesPage({ meta, filtered, edit, remove, exportCsv }) {
  return (
    <ResourceTablePage title={meta[0]} rows={filtered} columns={columns} onEdit={edit} onDelete={remove} onExport={exportCsv} />
  );
}
