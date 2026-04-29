import Link from 'next/link'

export interface McDestaque {
  nome: string
  slug: string
  semana: number
  pontos: number
  twolalas: number
  winRate: number
  totalBatalhas: number
}

export default function McDestaqueCard({ mc }: { mc: McDestaque }) {
  return (
    <div style={{ padding: '0 40px 52px' }}>
      <div style={{
        background: '#F5A800', padding: '36px 40px',
        display: 'flex', gap: '36px', alignItems: 'center', flexWrap: 'wrap',
        clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
      }}>
        {/* Esquerda */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
            letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '6px',
          }}>
            🏆 MC Destaque · Semana #{mc.semana}
          </p>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
            fontSize: '50px', lineHeight: 0.95, textTransform: 'uppercase', color: '#111', marginBottom: '14px',
          }}>
            {mc.nome}
          </h2>
          <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap' }}>
            <StatSpot value={mc.pontos.toString()} label="Pontos" />
            <StatSpot value={mc.twolalas.toString()} label="Twolalas" />
            <StatSpot value={`${mc.winRate.toFixed(1)}%`} label="Win-Rate" />
            <StatSpot value={mc.totalBatalhas.toString()} label="Batalhas" />
          </div>
        </div>

        {/* Direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          <Link href={`/mcs/${mc.slug}`} style={{
            background: '#111', color: '#F5A800',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
            fontSize: '13px', textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none',
            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
            display: 'block', textAlign: 'center',
          }}>
            Ver Estatísticas
          </Link>
          <Link href={`/mcs/${mc.slug}`} style={{
            background: '#111', color: '#F5A800',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
            fontSize: '13px', textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none',
            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
            display: 'block', textAlign: 'center',
          }}>
            Ver Batalhas
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatSpot({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
        fontSize: '26px', color: '#111', lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
        letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)',
      }}>
        {label}
      </div>
    </div>
  )
}