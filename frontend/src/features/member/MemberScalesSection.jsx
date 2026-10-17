import EventList from '../../components/ui/EventList.jsx';
import '../../components/ui/Panel.css';

export default function MemberScalesSection({ scales }) {
  return (
    <section className="panel">
      <div className="panel-heading"><div><h2>Minhas escalas</h2><p>Confira os próximos serviços</p></div></div>
      <EventList items={scales} kind="scales" showStatus showFullDate emptyText="Nenhuma escala cadastrada." />
    </section>
  );
}
