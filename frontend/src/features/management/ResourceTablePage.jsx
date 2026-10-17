import Button from '../../components/ui/Button.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import './ResourceTablePage.css';
import '../../components/ui/Panel.css';

export default function ResourceTablePage({
  title,
  rows,
  columns,
  onEdit,
  onDelete,
  onExport,
}) {
  return (
    <section className="panel data-panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{rows.length} registro(s) encontrado(s)</p>
        </div>
        <Button icon="download" variant="secondary" onClick={onExport}>
          Exportar CSV
        </Button>
      </div>
      <DataTable columns={columns} rows={rows} onEdit={onEdit} onDelete={onDelete} />
    </section>
  );
}
