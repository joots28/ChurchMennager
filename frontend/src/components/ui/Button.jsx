import Icon from '../Icon.jsx';
import './Button.css';

export default function Button({ children, icon, variant = 'primary', size = 'md', type = 'button', onClick, disabled = false, form }) {
  return <button form={form} type={type} className={`btn btn-${variant} btn-${size}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={17} />}{children}</button>;
}
