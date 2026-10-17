import EventList from '../../components/ui/EventList.jsx';
import '../../components/ui/Panel.css';

export default function MemberEventsSection({ events }) {
  return (
    <section className="panel">
      <div className="panel-heading"><div><h2>Eventos da igreja</h2><p>Agenda da comunidade</p></div></div>
      <EventList items={events} showStatus showFullDate emptyText="Nenhum evento cadastrado." />
    </section>
  );
}
