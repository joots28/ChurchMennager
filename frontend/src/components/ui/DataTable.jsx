import Icon from '../Icon.jsx';
import EmptyState from './EmptyState.jsx';
import './DataTable.css';

export default function DataTable({ columns, rows, onEdit, onDelete, renderActions = true }) {
  if (!rows.length) return <EmptyState />;

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map(column => <th key={column.key}>{column.label}</th>)}
            {renderActions && <th className="actions-head">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {columns.map(column => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key] ?? '—'}
                </td>
              ))}
              {renderActions && (
                <td className="row-actions">
                  <button type="button" title="Editar" aria-label={`Editar ${row.name || row.title || row.description || 'registro'}`} onClick={() => onEdit(row)}>
                    <Icon name="settings" size={16} />
                  </button>
                  <button type="button" title="Excluir" aria-label={`Excluir ${row.name || row.title || row.description || 'registro'}`} onClick={() => onDelete(row)}>
                    <Icon name="close" size={16} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
