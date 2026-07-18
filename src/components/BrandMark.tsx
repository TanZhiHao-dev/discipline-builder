// Discipline Builder logo mark — three ascending bars ("building up,
// step by step"). Uses currentColor so it inherits the surrounding text color.
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="2.5" y="14" width="4.6" height="7.5" rx="1.5" fill="currentColor" />
      <rect x="9.7" y="8.5" width="4.6" height="13" rx="1.5" fill="currentColor" />
      <rect x="16.9" y="3" width="4.6" height="18.5" rx="1.5" fill="currentColor" />
    </svg>
  );
}
