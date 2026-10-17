import Icon from '../Icon.jsx';
import Button from './Button.jsx';
import './PageHeading.css';

export default function PageHeading({ title, subtitle, actionLabel, onAction, actionIcon = 'plus', search, onSearch }) { return <div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="page-tools">{onSearch && <label className="search-box"><Icon name="search" size={18}/><input value={search} onChange={e => onSearch(e.target.value)} placeholder="Pesquisar..." /></label>}{actionLabel && <Button icon={actionIcon} onClick={onAction}>{actionLabel}</Button>}</div></div>; }
