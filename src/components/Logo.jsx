export default function Logo({ size = 80, color = '#FFC72C' }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 100 80" aria-hidden>
      <path
        d="M10 78 C 12 4, 40 4, 50 58 C 60 4, 88 4, 90 78"
        fill="none"
        stroke={color}
        strokeWidth="13"
        strokeLinejoin="round"
      />
    </svg>
  );
}
