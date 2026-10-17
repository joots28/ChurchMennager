import InputField from '../../../components/ui/InputField.jsx';
import './RoleFields.css';

const permissions = ['Membros', 'Eventos', 'Financeiro', 'Relatórios', 'Configurações', 'Perfil', 'Escalas'];

export default function RoleFields({ form, changeForm }) {
  function togglePermission(permission, checked) {
    const current = form.permissions || [];
    changeForm('permissions', checked ? [...new Set([...current, permission])] : current.filter(item => item !== permission));
  }

  return (
    <>
      <InputField label="Nome do cargo" name="name" value={form.name} onChange={changeForm} maxLength={120} minLength={2} required />
      <InputField label="Descrição (opcional)" name="description" value={form.description} onChange={changeForm} maxLength={500} />
      <fieldset className="permission-fieldset">
        <legend>Permissões registradas</legend>
        <p>As permissões são informativas nesta versão; o acesso real à API continua controlado pela função do usuário.</p>
        {permissions.map(permission => (
          <label key={permission}>
            <input type="checkbox" checked={(form.permissions || []).includes(permission)} onChange={event => togglePermission(permission, event.target.checked)} />
            {permission}
          </label>
        ))}
      </fieldset>
    </>
  );
}
