const STYLES = {
  placed:    { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  color: '#60a5fa' },
  confirmed: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', color: '#a78bfa' },
  delivered: { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.3)',  color: '#4ade80' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  color: '#f87171' },
}

export default function StatusBadge({ status }) {
  const s = STYLES[status] || STYLES.placed
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
      letterSpacing: '1px', padding: '3px 10px', borderRadius: '999px',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}
