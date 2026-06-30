interface Props { pct: number }

const R = 32
const CIRC = 2 * Math.PI * R

export default function ProgressCircle({ pct }: Props) {
  const offset   = CIRC - (pct / 100) * CIRC
  const complete  = pct === 100

  return (
    <div className="progress-circle-wrap">
      <svg className="progress-svg" width="80" height="80" viewBox="0 0 80 80">
        <circle className="progress-bg"   cx="40" cy="40" r={R} />
        <circle
          className={`progress-fill${complete ? ' complete' : ''}`}
          cx="40" cy="40" r={R}
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
        />
        <text
          className={`progress-text${complete ? ' complete' : ''}`}
          x="40" y="40"
          style={{ transform: 'rotate(90deg)', transformOrigin: '40px 40px' }}
        >
          {pct}%
        </text>
      </svg>
    </div>
  )
}
