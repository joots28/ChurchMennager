import InputField from '../../../components/ui/InputField.jsx';
import SelectField from '../../../components/ui/SelectField.jsx';

export default function MemberFields({ form, changeForm }) {
  return (
    <>
      <InputField label="Nome completo" name="name" value={form.name} onChange={changeForm} maxLength={160} minLength={2} autoComplete="name" required />
      <InputField label="E-mail (opcional)" name="email" type="email" value={form.email} onChange={changeForm} maxLength={254} autoComplete="email" />
      <InputField label="Telefone (opcional)" name="phone" value={form.phone} onChange={changeForm} maxLength={40} autoComplete="tel" />
      <SelectField label="Ministério" name="ministry" value={form.ministry} onChange={changeForm} options={['Louvor', 'Recepção', 'Ministério Infantil', 'Comunicação', 'Assistência', 'Jovens', 'Todos']} required />
      <SelectField label="Cargo" name="role" value={form.role} onChange={changeForm} options={['Membro', 'Líder', 'Administrador', 'Tesouraria']} required />
      <SelectField label="Status" name="status" value={form.status} onChange={changeForm} options={['Ativo', 'Inativo']} required />
    </>
  );
}
