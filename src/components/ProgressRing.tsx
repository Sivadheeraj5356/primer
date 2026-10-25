export function ProgressRing({ value, size = 56, label }: { value: number; size?: number; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size }} title={label}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e7e0cd" strokeWidth="6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="#1f5c45" strokeWidth="6" fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.24, fontWeight: 700, color: '#1f5c45' }}>
        {pct}%
      </span>
    </div>
  )
}
