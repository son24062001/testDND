// ─── Icon ─────────────────────────────────────────────────────────────────────
interface IconProps {
  d: string;
  size?: number;
}

export function Icon({ d, size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}