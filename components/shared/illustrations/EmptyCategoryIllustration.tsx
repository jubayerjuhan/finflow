export default function EmptyCategoryIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" {...props}>
      <rect x="24" y="24" width="30" height="30" rx="9" fill="currentColor" opacity="0.16" />
      <rect x="66" y="24" width="30" height="30" rx="9" fill="currentColor" opacity="0.1" />
      <rect x="24" y="66" width="30" height="30" rx="9" fill="currentColor" opacity="0.1" />
      <rect x="66" y="66" width="30" height="30" rx="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="5 5" />
    </svg>
  );
}
