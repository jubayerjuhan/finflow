export default function EmptyChartIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" {...props}>
      <path d="M28 92V38" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 92h64" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="38" y="66" width="12" height="26" rx="3" fill="currentColor" opacity="0.18" />
      <rect x="56" y="52" width="12" height="40" rx="3" fill="currentColor" opacity="0.28" />
      <rect x="74" y="72" width="12" height="20" rx="3" fill="currentColor" opacity="0.18" />
    </svg>
  );
}
