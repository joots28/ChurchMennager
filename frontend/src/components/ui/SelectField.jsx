import './FormField.css';
import './SelectField.css';

export default function SelectField({ label, name, value, onChange, options, required = false }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <span aria-hidden="true"> *</span>}</span>
      <span className="select-shell">
        <select name={name} value={value ?? ''} onChange={event => onChange(name, event.target.value)} required={required}>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}
