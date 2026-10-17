import Badge from '../../components/ui/Badge.jsx';
import MetricCard from '../../components/ui/MetricCard.jsx';
import { currency, dateBR } from '../../utils/formatters.js';
import ResourceTablePage from '../management/ResourceTablePage.jsx';
import './FinancePage.css';

const columns = [
  {
    key: 'description',
    label: 'Descrição',
    render: (value, transaction) => (
      <div>
        <strong>{value}</strong>
        <small className="cell-subtitle">{transaction.category}</small>
      </div>
    ),
  },
  { key: 'date', label: 'Data', render: (value) => dateBR(value) },
  { key: 'method', label: 'Método' },
  { key: 'type', label: 'Tipo', render: (value) => <Badge>{value}</Badge> },
  {
    key: 'amount',
    label: 'Valor',
    render: (value, transaction) => (
      <strong className={transaction.type === 'Entrada' ? 'amount-positive' : 'amount-negative'}>
        {transaction.type === 'Entrada' ? '+ ' : '− '}{currency(value)}
      </strong>
    ),
  },
];

export default function FinancePage({ data, meta, filtered, edit, remove, exportCsv }) {
  const income = data.transactions
    .filter((transaction) => transaction.type === 'Entrada')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const expenses = data.transactions
    .filter((transaction) => transaction.type === 'Saída')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return (
    <>
      <div className="finance-metrics">
        <MetricCard label="Entradas registradas" value={currency(income)} sub="Lançamentos de entrada" icon="trend" />
        <MetricCard label="Saídas registradas" value={currency(expenses)} sub="Lançamentos de saída" icon="wallet" />
        <MetricCard label="Saldo do período" value={currency(income - expenses)} sub="Saldo demonstrativo" icon="wallet" />
      </div>
      <ResourceTablePage title={meta[0]} rows={filtered} columns={columns} onEdit={edit} onDelete={remove} onExport={exportCsv} />
    </>
  );
}
