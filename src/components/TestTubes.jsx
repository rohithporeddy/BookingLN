export default function TestTubes({ size = 100 }) {
  return (
    <div style={{ textAlign: 'center', padding: '28px 0 20px', marginBottom: '28px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 110 95"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tubeStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="liquid2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Left test tube — tilted left */}
        <g transform="rotate(-22, 30, 43)">
          {/* Rim */}
          <line x1="18" y1="8" x2="42" y2="8" stroke="url(#tubeStroke)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Body */}
          <path
            d="M 20 8 L 20 64 Q 20 76 30 76 Q 40 76 40 64 L 40 8 Z"
            fill="rgba(59,130,246,0.07)"
            stroke="url(#tubeStroke)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Liquid fill — bottom third */}
          <path
            d="M 20 56 L 20 64 Q 20 76 30 76 Q 40 76 40 64 L 40 56 Z"
            fill="url(#liquid)"
          />
          {/* Bubble */}
          <circle cx="26" cy="50" r="2" fill="#60a5fa" opacity="0.5" />
          <circle cx="33" cy="44" r="1.2" fill="#93c5fd" opacity="0.4" />
        </g>

        {/* Right test tube — tilted right */}
        <g transform="rotate(22, 80, 43)">
          {/* Rim */}
          <line x1="68" y1="8" x2="92" y2="8" stroke="url(#tubeStroke)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Body */}
          <path
            d="M 70 8 L 70 64 Q 70 76 80 76 Q 90 76 90 64 L 90 8 Z"
            fill="rgba(124,58,237,0.07)"
            stroke="url(#tubeStroke)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Liquid fill — bottom half */}
          <path
            d="M 70 44 L 70 64 Q 70 76 80 76 Q 90 76 90 64 L 90 44 Z"
            fill="url(#liquid2)"
            opacity="0.9"
          />
          {/* Bubbles */}
          <circle cx="84" cy="38" r="2" fill="#a78bfa" opacity="0.55" />
          <circle cx="76" cy="32" r="1.3" fill="#818cf8" opacity="0.4" />
        </g>
      </svg>
    </div>
  )
}
