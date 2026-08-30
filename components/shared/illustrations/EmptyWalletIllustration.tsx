export default function EmptyWalletIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" {...props}>
      <rect x="20" y="38" width="80" height="54" rx="12" fill="currentColor" opacity="0.08" />
      <rect x="20" y="38" width="80" height="54" rx="12" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M20 54h80" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <circle cx="82" cy="72" r="9" fill="currentColor" opacity="0.3" />
      <rect x="30" y="66" width="24" height="6" rx="3" fill="currentColor" opacity="0.2" />
    </svg>
  );
}
