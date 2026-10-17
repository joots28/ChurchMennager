import Badge from '../../components/ui/Badge.jsx';
import './MemberProfile.css';
import '../../components/ui/Panel.css';

export default function MemberProfile({ user }) {
  return (
    <section className="panel profile-panel">
      <div className="avatar-large">{user.name.slice(0, 1).toUpperCase()}</div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <Badge>{user.role}</Badge>
      <p className="muted">As alterações de cadastro devem ser solicitadas à administração da igreja.</p>
    </section>
  );
}
