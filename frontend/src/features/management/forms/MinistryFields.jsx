import InputField from '../../../components/ui/InputField.jsx';
import SelectField from '../../../components/ui/SelectField.jsx';

export default function MinistryFields({ form, changeForm }) {
  return (
    <>
      <InputField label="Nome do ministério" name="name" value={form.name} onChange={changeForm} maxLength={160} minLength={2} required />
      <InputField label="Descrição (opcional)" name="description" value={form.description} onChange={changeForm} maxLength={500} />
      <InputField label="Coordenador (opcional)" name="coordinator" value={form.coordinator} onChange={changeForm} maxLength={160} />
      <SelectField label="Status" name="status" value={form.status} onChange={changeForm} options={['Ativo', 'Inativo']} required />
    </>
  );
}
