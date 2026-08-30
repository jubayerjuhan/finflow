export default function EmptyBudgetIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" {...props}>
      <circle cx="60" cy="60" r="42" fill="currentColor" opacity="0.06" />
      <circle cx="60" cy="60" r="42" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <circle cx="60" cy="60" r="26" stroke="currentColor" strokeOpacity="0.28" strokeWidth="2" />
      <circle cx="60" cy="60" r="10" fill="currentColor" opacity="0.35" />
      <path
        d="M60 18a42 42 0 0 1 29.7 71.7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
