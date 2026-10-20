export default function Badge({ children, variant = 'forest', className = '' }) {
  const variantStyles = {
    forest: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    honey: 'bg-amber-50 text-amber-800 border-amber-200',
    ochre: 'bg-orange-50 text-orange-800 border-orange-200',
    neutral: 'bg-stone-100 text-stone-800 border-stone-200',
  };

  const currentStyle = variantStyles[variant] || variantStyles.forest;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      {children}
    </span>
  );
}
