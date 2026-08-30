export default function EmptySearchIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" {...props}>
      <circle cx="52" cy="52" r="26" fill="currentColor" opacity="0.08" />
      <circle cx="52" cy="52" r="26" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
      <path d="M71 71l18 18" stroke="currentColor" strokeOpacity="0.4" strokeWidth="4" strokeLinecap="round" />
      <path d="M42 52h20M52 42v20" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
