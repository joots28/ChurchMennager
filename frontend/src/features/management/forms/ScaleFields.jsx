import InputField from '../../../components/ui/InputField.jsx';
import SelectField from '../../../components/ui/SelectField.jsx';

export default function ScaleFields({ form, changeForm }) {
  return (
    <>
      <InputField label="Nome da escala" name="title" value={form.title} onChange={changeForm} maxLength={180} minLength={2} required />
      <SelectField label="Ministério" name="ministry" value={form.ministry} onChange={changeForm} options={['Louvor', 'Recepção', 'Ministério Infantil', 'Comunicação', 'Assistência', 'Jovens']} required />
      <InputField label="Data" name="date" type="date" value={form.date} onChange={changeForm} required />
      <InputField label="Horário" name="time" type="time" value={form.time} onChange={changeForm} required />
      <InputField label="Equipe (opcional, separe por vírgula)" name="members" value={form.members} onChange={changeForm} maxLength={8000} />
      <SelectField label="Status" name="status" value={form.status} onChange={changeForm} options={['Pendente', 'Confirmada', 'Concluída']} required />
    </>
  );
}
