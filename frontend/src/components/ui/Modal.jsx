import Icon from '../Icon.jsx';
import Button from './Button.jsx';
import './Modal.css';
import './IconButton.css';

export default function Modal({ title, children, onClose, onSubmit, saving = false }) { return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fechar"><Icon name="close"/></button></header><form onSubmit={onSubmit}><div className="modal-body">{children}</div><footer className="modal-footer"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button></footer></form></section></div>; }
