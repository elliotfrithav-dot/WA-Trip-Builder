interface ScoreRingProps {
  score: number
  size?: number
}

export function ScoreRing({ score, size = 56 }: ScoreRingProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const color = score >= 85 ? '#2b6d67' : score >= 65 ? '#c1622d' : '#a94a24'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e9e3d3" strokeWidth={5} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink-900">
        {score}
      </div>
    </div>
  )
}
