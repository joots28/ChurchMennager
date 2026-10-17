import useChurchManager from './hooks/useChurchManager.js';
import Toast from './components/ui/Toast.jsx';
import DemoDisclaimer from './components/ui/DemoDisclaimer.jsx';
import Modal from './components/ui/Modal.jsx';
import Auth from './features/auth/Auth.jsx';
import MemberPortal from './features/member/MemberPortal.jsx';
import ManagementFields from './features/management/ManagementFields.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

export default function App() {
  const {
    user,
    data,
    setData,
    module,
    setModule,
    query,
    setQuery,
    dialog,
    setDialog,
    toast,
    mobileNav,
    setMobileNav,
    saving,
    form,
    theme,
    toggleTheme,
    demo,
    login,
    register,
    logout,
    filtered,
    handleAction,
    edit,
    remove,
    exportCsv,
    saveRecord,
    changeForm,
    tell,
    meta,
    humanRole
  } = useChurchManager();

  if (!user) {
    return <Auth onLogin={login} onRegister={register} theme={theme} onToggleTheme={toggleTheme} initialNotice={toast} />;
  }

  if (humanRole(user.role) === 'Membro') {
    return (
      <MemberPortal
        user={user}
        data={data}
        onLogout={logout}
        theme={theme}
        onToggleTheme={toggleTheme}
        onDonate={() => tell('A contribuição real não está conectada nesta demonstração. Nenhum pagamento foi feito.')}
      />
    );
  }

  return (
    <>
      <AdminLayout
        user={user}
        logout={logout}
        data={data}
        setData={setData}
        module={module}
        setModule={setModule}
        query={query}
        setQuery={setQuery}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        theme={theme}
        toggleTheme={toggleTheme}
        demo={demo}
        meta={meta}
        handleAction={handleAction}
        filtered={filtered}
        tell={tell}
        edit={edit}
        remove={remove}
        exportCsv={exportCsv}
      />

      {dialog && (
        <Modal
          title={`${dialog.mode === 'edit' ? 'Editar' : 'Adicionar'} ${({
            members: 'membro',
            ministries: 'ministério',
            events: 'evento',
            transactions: 'lançamento financeiro',
            roles: 'cargo',
            scales: 'escala'
          })[dialog.resource] || 'registro'}`}
          onClose={() => setDialog(null)}
          onSubmit={saveRecord}
          saving={saving}
        >
          <ManagementFields module={dialog.resource} form={form} changeForm={changeForm} />
        </Modal>
      )}

      <Toast message={toast} />
      {demo && <DemoDisclaimer />}
    </>
  );
}
