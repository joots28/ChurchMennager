import PageHeading from '../ui/PageHeading.jsx';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import PageRenderer from '../../features/pages/PageRenderer.jsx';
import './AdminLayout.css';

export default function AdminLayout({
  user, logout, data, setData, module, setModule, query, setQuery,
  mobileNav, setMobileNav, theme, toggleTheme, demo, meta,
  handleAction, filtered, tell, edit, remove, exportCsv
}) {
  const actionLabels = {
    events: 'Criar evento',
    members: 'Novo membro',
    finance: 'Novo lançamento',
    roles: 'Novo cargo',
    scales: 'Nova escala'
  };

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        logout={logout}
        data={data}
        module={module}
        setModule={setModule}
        setQuery={setQuery}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
      />

      <main className="main-area">
        <Topbar user={user} meta={meta} demo={demo} theme={theme} toggleTheme={toggleTheme} setMobileNav={setMobileNav} />
        <div className="page-content">
          {module !== 'dashboard' && module !== 'settings' && (
            <PageHeading
              title={meta[0]}
              subtitle={meta[1]}
              actionLabel={actionLabels[module] || 'Novo ministério'}
              onAction={handleAction}
              search={query}
              onSearch={setQuery}
            />
          )}
          {module === 'settings' && <PageHeading title={meta[0]} subtitle={meta[1]} />}
          <PageRenderer
            module={module}
            data={data}
            setData={setData}
            filtered={filtered}
            meta={meta}
            setModule={setModule}
            demo={demo}
            tell={tell}
            edit={edit}
            remove={remove}
            exportCsv={exportCsv}
          />
        </div>
      </main>
    </div>
  );
}
