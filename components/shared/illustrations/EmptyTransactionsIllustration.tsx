export default function EmptyTransactionsIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" {...props}>
      <rect x="28" y="18" width="64" height="88" rx="10" fill="currentColor" opacity="0.08" />
      <rect x="28" y="18" width="64" height="88" rx="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="40" y="34" width="40" height="6" rx="3" fill="currentColor" opacity="0.3" />
      <rect x="40" y="48" width="28" height="5" rx="2.5" fill="currentColor" opacity="0.2" />
      <rect x="40" y="62" width="40" height="6" rx="3" fill="currentColor" opacity="0.3" />
      <rect x="40" y="76" width="24" height="5" rx="2.5" fill="currentColor" opacity="0.2" />
      <circle cx="88" cy="88" r="16" fill="currentColor" opacity="0.12" />
      <path d="M88 81v14M81 88h14" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
