import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import ResourceTablePage from '../management/ResourceTablePage.jsx';

const columns = [
  {
    key: 'name',
    label: 'Nome',
    render: (value, member) => (
      <div className="person-cell">
        <Avatar label={String(value || '?').split(' ').map(part => part[0]).slice(0, 2).join('')} />
        <div>
          <strong>{value}</strong>
          <small>{member.email}</small>
        </div>
      </div>
    ),
  },
  { key: 'phone', label: 'Telefone' },
  { key: 'ministry', label: 'Ministério' },
  { key: 'role', label: 'Cargo' },
  { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> },
];

export default function MembersPage({ meta, filtered, edit, remove, exportCsv }) {
  return (
    <ResourceTablePage
      title={meta[0]}
      rows={filtered}
      columns={columns}
      onEdit={edit}
      onDelete={remove}
      onExport={exportCsv}
    />
  );
}
