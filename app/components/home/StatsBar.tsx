interface StatsBarProps {
  totalMcs: number
  totalBatalhas: number
  winRateLider: number
}

export default function StatsBar({ totalMcs, totalBatalhas, winRateLider }: StatsBarProps) {
  return (
    <div style={{
      background: '#F5A800', padding: '18px 40px',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
    }}>
      <StatItem value={totalMcs.toString()} label="MCs Ativos" />
      <div style={{ width: '1px', height: '36px', background: 'rgba(0,0,0,0.18)' }} />
      <StatItem value={totalBatalhas.toString()} label="Batalhas Filiadas" />
      <div style={{ width: '1px', height: '36px', background: 'rgba(0,0,0,0.18)' }} />
      <StatItem value="R$250" label="Premiação Semanal" />
      <div style={{ width: '1px', height: '36px', background: 'rgba(0,0,0,0.18)' }} />
      <StatItem value="R$10.000" label="Premiação Anual" />
      <div style={{ width: '1px', height: '36px', background: 'rgba(0,0,0,0.18)' }} />
      <StatItem value={`${winRateLider.toFixed(1)}%`} label="Win-Rate do Líder da Semana" />
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
        fontSize: '30px', color: '#111', lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
        letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.55)', marginTop: '2px',
      }}>
        {label}
      </div>
    </div>
  )
}