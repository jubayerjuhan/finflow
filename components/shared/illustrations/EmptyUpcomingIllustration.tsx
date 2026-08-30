export default function EmptyUpcomingIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" {...props}>
      <rect x="24" y="30" width="72" height="66" rx="10" fill="currentColor" opacity="0.08" />
      <rect x="24" y="30" width="72" height="66" rx="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="24" y="30" width="72" height="16" rx="8" fill="currentColor" opacity="0.18" />
      <rect x="38" y="20" width="4" height="14" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="78" y="20" width="4" height="14" rx="2" fill="currentColor" opacity="0.35" />
      <circle cx="60" cy="70" r="16" fill="currentColor" opacity="0.12" />
      <path d="M53 70l5 5 9-10" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
