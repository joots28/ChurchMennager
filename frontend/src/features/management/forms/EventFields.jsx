import InputField from '../../../components/ui/InputField.jsx';
import SelectField from '../../../components/ui/SelectField.jsx';

export default function EventFields({ form, changeForm }) {
  return (
    <>
      <InputField label="Nome do evento" name="title" value={form.title} onChange={changeForm} maxLength={180} minLength={2} required />
      <InputField label="Data" name="date" type="date" value={form.date} onChange={changeForm} required />
      <InputField label="Horário" name="time" type="time" value={form.time} onChange={changeForm} required />
      <InputField label="Local (opcional)" name="location" value={form.location} onChange={changeForm} maxLength={180} />
      <SelectField label="Ministério" name="ministry" value={form.ministry} onChange={changeForm} options={['Todos', 'Louvor', 'Recepção', 'Ministério Infantil', 'Comunicação', 'Assistência', 'Jovens']} required />
      <SelectField label="Status" name="status" value={form.status} onChange={changeForm} options={['Planejado', 'Confirmado', 'Cancelado']} required />
      <InputField label="Descrição (opcional)" name="description" value={form.description} onChange={changeForm} maxLength={1000} />
    </>
  );
}
