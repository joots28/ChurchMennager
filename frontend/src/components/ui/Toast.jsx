import Icon from '../Icon.jsx';
import './Toast.css';

export default function Toast({ message }) {
  if (!message) return null;
  return <div className="toast" role="status"><Icon name="check" size={18} />{message}</div>;
}
