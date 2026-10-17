import './Badge.css';

export default function Badge({ children }) {
  const status = String(children).toLowerCase();
  const variant = status.includes('inativ') || status.includes('pend') || status.includes('saída')
    ? 'warning'
    : status.includes('planej')
      ? 'info'
      : 'success';

  return <span className={`badge badge-${variant}`}>{children}</span>;
}
