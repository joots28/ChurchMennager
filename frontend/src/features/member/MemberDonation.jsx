import Button from '../../components/ui/Button.jsx';
import './MemberDonation.css';

export default function MemberDonation({ onDonate }) {
  return (
    <div className="member-donation">
      <div><h2>Contribua com a comunidade</h2><p>Consulte as orientações para realizar sua contribuição.</p></div>
      <Button icon="heart" onClick={onDonate}>Ver opções</Button>
    </div>
  );
}
