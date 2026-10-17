import Icon from '../../components/Icon.jsx';
import Button from '../../components/ui/Button.jsx';
import SectionLabel from '../../components/ui/SectionLabel.jsx';
import EventList from '../../components/ui/EventList.jsx';
import MetricCard from '../../components/ui/MetricCard.jsx';
import { currency, dateBR } from '../../utils/formatters.js';
import './HomePage.css';
import '../../components/ui/Panel.css';

function formatToday() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

export default function HomePage({ data, setModule }) {
  const currentDate = new Date();
  const today = [currentDate.getFullYear(), String(currentDate.getMonth() + 1).padStart(2, '0'), String(currentDate.getDate()).padStart(2, '0')].join('-');
  const income = data.transactions
    .filter((item) => item.type === 'Entrada')
    .reduce((total, item) => total + Number(item.amount), 0);
  const expenses = data.transactions
    .filter((item) => item.type === 'Saída')
    .reduce((total, item) => total + Number(item.amount), 0);
  const upcomingEvents = [...data.events]
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  const recentTransactions = [...data.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const upcomingCount = data.events.filter((event) => event.date >= today).length;

  return (
    <>
      <section className="welcome-strip">
        <div>
          <SectionLabel>VISÃO GERAL</SectionLabel>
          <h2>Bem-vindo ao ChurchManager</h2>
          <p>Acompanhe os principais indicadores da sua comunidade.</p>
        </div>
        <div className="welcome-date">
          <Icon name="calendar" size={17} />
          <span>{formatToday()}</span>
        </div>
      </section>

      <div className="metrics-grid">
        <MetricCard label="Membros cadastrados" value={data.members.length} sub="Pessoas cadastradas" icon="users" />
        <MetricCard label="Ministérios ativos" value={data.ministries.length} sub="Equipes cadastradas" icon="church" />
        <MetricCard label="Eventos próximos" value={upcomingCount} sub="Programados no calendário" icon="calendar" />
        <MetricCard label="Saldo financeiro" value={currency(income - expenses)} sub="Entradas menos saídas" icon="wallet" />
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Próximos eventos</h2>
              <p>O que está programado na comunidade</p>
            </div>
            <button className="link-button" onClick={() => setModule('events')}>
              Ver todos <Icon name="arrow" size={15} />
            </button>
          </div>
<EventList items={upcomingEvents} showStatus emptyText="Nenhum evento próximo." />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Movimentações recentes</h2>
              <p>Últimos lançamentos financeiros</p>
            </div>
            <button className="link-button" onClick={() => setModule('finance')}>
              Ver todos <Icon name="arrow" size={15} />
            </button>
          </div>
          {recentTransactions.length ? (
            <div className="recent-list">
              {recentTransactions.map((transaction) => (
                <div className="recent-row" key={transaction.id}>
                  <div className={`transaction-symbol ${transaction.type === 'Entrada' ? 'income' : 'expense'}`}>
                    <Icon name={transaction.type === 'Entrada' ? 'trend' : 'wallet'} size={17} />
                  </div>
                  <div className="recent-info">
                    <strong>{transaction.description}</strong>
                    <span>{dateBR(transaction.date)} · {transaction.category}</span>
                  </div>
                  <b className={transaction.type === 'Entrada' ? 'amount-positive' : 'amount-negative'}>
                    {transaction.type === 'Entrada' ? '+' : '−'} {currency(transaction.amount)}
                  </b>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhuma movimentação registrada." />
          )}
        </section>
      </div>

      <div className="quick-actions">
        <strong>Acesso rápido</strong>
        <Button variant="secondary" icon="users" onClick={() => setModule('members')}>Ver membros</Button>
        <Button variant="secondary" icon="calendar" onClick={() => setModule('events')}>Ver eventos</Button>
        <Button variant="secondary" icon="wallet" onClick={() => setModule('finance')}>Ver financeiro</Button>
      </div>
    </>
  );
}
