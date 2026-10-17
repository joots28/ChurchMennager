import EmptyState from '../../components/ui/EmptyState.jsx';
import HomePage from '../home/HomePage.jsx';
import MembersPage from '../members/MembersPage.jsx';
import MinistriesPage from '../ministries/MinistriesPage.jsx';
import EventsPage from '../events/EventsPage.jsx';
import FinancePage from '../finance/FinancePage.jsx';
import ScalesPage from '../scales/ScalesPage.jsx';
import RolesPage from '../roles/RolesPage.jsx';
import SettingsPage from '../settings/SettingsPage.jsx';

const pages = {
  dashboard: HomePage,
  members: MembersPage,
  ministries: MinistriesPage,
  events: EventsPage,
  finance: FinancePage,
  scales: ScalesPage,
  roles: RolesPage,
  settings: SettingsPage,
};

export default function PageRenderer({ module, ...pageProps }) {
  const Page = pages[module];
  return Page ? <Page {...pageProps} /> : <EmptyState />;
}
