import EventList from '../../components/ui/EventList.jsx';
import MemberFeatureGrid from './MemberFeatureGrid.jsx';
import MemberDonation from './MemberDonation.jsx';
import './MemberHomeSection.css';
import '../../components/ui/Panel.css';

export default function MemberHomeSection({ events, scales, onDonate }) {
  return (
    <>
      <MemberFeatureGrid eventCount={events.length} scaleCount={scales.length} />
      <section className="panel member-panel">
        <div className="panel-heading"><div><h2>Próximos eventos</h2><p>Participe das atividades da comunidade</p></div></div>
        <EventList items={events} emptyText="Nenhum evento cadastrado." />
      </section>
      <MemberDonation onDonate={onDonate} />
    </>
  );
}
