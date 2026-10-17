import './Avatar.css';

export default function Avatar({ label, variant = 'default', className = '' }) {
  const classes = ['avatar', variant === 'blue' ? 'avatar-blue' : '', className].filter(Boolean).join(' ');
  return <span className={classes} aria-label={label}>{label}</span>;
}
