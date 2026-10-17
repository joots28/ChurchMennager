import { useState } from 'react';
import SectionLabel from '../../components/ui/SectionLabel.jsx';
import MemberTopbar from './MemberTopbar.jsx';
import MemberTabNavigation from './MemberTabNavigation.jsx';
import MemberHomeSection from './MemberHomeSection.jsx';
import MemberEventsSection from './MemberEventsSection.jsx';
import MemberScalesSection from './MemberScalesSection.jsx';
import MemberProfile from './MemberProfile.jsx';
import './MemberPortal.css';
import '../../components/ui/SectionLabel.css';

export default function MemberPortal({ user, data, onLogout, onDonate, theme, onToggleTheme }) {
  const [section, setSection] = useState('home');
  const upcomingEvents = [...data.events].sort((a, b) => a.date.localeCompare(b.date));
  const upcomingScales = [...data.scales].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="member-portal">
      <MemberTopbar user={user} theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout} />
      <main className="member-main">
        <div className="member-welcome">
          <SectionLabel>ÁREA DO MEMBRO</SectionLabel>
          <h1>Olá, {user.name.split(' ')[0]}!</h1>
          <p>Acompanhe sua comunidade, eventos e escalas.</p>
        </div>
        <MemberTabNavigation active={section} onChange={setSection} />

        {section === 'home' && <MemberHomeSection events={upcomingEvents} scales={upcomingScales} onDonate={onDonate} />}
        {section === 'events' && <MemberEventsSection events={upcomingEvents} />}
        {section === 'scales' && <MemberScalesSection scales={upcomingScales} />}
        {section === 'profile' && <MemberProfile user={user} />}

        <p className="member-footer">ChurchManager · {data.settings.churchName}</p>
      </main>
    </div>
  );
}
