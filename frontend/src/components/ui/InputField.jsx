import Icon from '../Icon.jsx';
import './FormField.css';
import './InputField.css';

export default function InputField({
  label, name, value, onChange, placeholder, type = 'text', required = false,
  icon, min, max, step, minLength, maxLength, autoComplete, rightIcon, onRightClick
}) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <span aria-hidden="true"> *</span>}</span>
      <span className={`input-shell ${icon ? 'has-icon' : ''}`}>
        {icon && <Icon name={icon} size={18} />}
        <input
          name={name}
          type={type}
          value={value ?? ''}
          onChange={event => onChange(name, event.target.value)}
          placeholder={placeholder || ''}
          required={required}
          min={min}
          max={max}
          step={step}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
        />
        {rightIcon && (
          <button
            className="input-trailing"
            type="button"
            onClick={onRightClick}
            aria-label={type === 'password' ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Icon name={rightIcon} size={18} />
          </button>
        )}
      </span>
    </label>
  );
}
