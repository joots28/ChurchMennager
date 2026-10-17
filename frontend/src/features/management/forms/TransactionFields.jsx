import InputField from '../../../components/ui/InputField.jsx';
import SelectField from '../../../components/ui/SelectField.jsx';

export default function TransactionFields({ form, changeForm }) {
  return (
    <>
      <InputField label="Descrição" name="description" value={form.description} onChange={changeForm} maxLength={180} minLength={2} required />
      <SelectField label="Tipo de movimentação" name="type" value={form.type} onChange={changeForm} options={['Entrada', 'Saída']} required />
      <InputField label="Valor (R$)" name="amount" type="number" min="0.01" max="9999999999.99" step="0.01" value={form.amount} onChange={changeForm} required />
      <SelectField label="Categoria" name="category" value={form.category} onChange={changeForm} options={['Ofertas', 'Contribuições', 'Doações', 'Despesas fixas', 'Manutenção', 'Eventos', 'Outros']} required />
      <InputField label="Data" name="date" type="date" value={form.date} onChange={changeForm} required />
      <SelectField label="Método" name="method" value={form.method} onChange={changeForm} options={['PIX', 'Transferência', 'Dinheiro', 'Cartão', 'Outro']} required />
    </>
  );
}
