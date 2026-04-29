import Link from 'next/link'

export interface RankingEntry {
  posicao: number
  nome: string
  slug: string
  pontos: number
  twolalas: number
}

interface RankingSemanalProps {
  semana: number
  ranking: RankingEntry[]
}

export default function RankingSemanal({ semana, ranking }: RankingSemanalProps) {
  return (
    <section style={{ padding: '52px 40px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '18px', marginBottom: '28px',
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
            fontSize: '38px', textTransform: 'uppercase', color: '#fff', lineHeight: 1,
          }}>
            Ranking <span style={{ color: '#F5A800' }}>Semana #{semana}</span>
          </h2>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
            letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '4px',
          }}>
            Atualizado todo domingo
          </p>
        </div>
        <Link href="/ranking" style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px',
          letterSpacing: '1px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none',
          borderBottom: '1px solid rgba(245,168,0,0.4)', paddingBottom: '2px',
        }}>
          Ver todos →
        </Link>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {ranking.slice(0, 5).map((mc) => (
          <Link key={mc.slug} href={`/mcs/${mc.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: mc.posicao === 1 ? 'rgba(245,168,0,0.1)' : 'rgba(255,255,255,0.035)',
              border: mc.posicao === 1 ? '1px solid rgba(245,168,0,0.4)' : '1px solid rgba(255,255,255,0.06)',
              padding: '12px 18px', cursor: 'pointer',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            }}>
              {/* Posição */}
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
                fontSize: mc.posicao === 1 ? '24px' : '20px',
                color: mc.posicao === 1 ? '#F5A800' : 'rgba(255,255,255,0.22)',
                minWidth: '32px', textAlign: 'center',
              }}>
                {mc.posicao === 1 ? '👑' : `${mc.posicao}º`}
              </div>

              {/* Avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: mc.posicao === 1 ? 'rgba(245,168,0,0.22)' : 'rgba(245,168,0,0.18)',
                border: mc.posicao === 1 ? '1.5px solid #F5A800' : '1.5px solid rgba(245,168,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                fontSize: '13px', color: '#F5A800',
              }}>
                {mc.nome.slice(0, 2).toUpperCase()}
              </div>

              {/* Nome */}
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
                fontSize: '19px', textTransform: 'uppercase', color: '#fff', flex: 1,
              }}>
                {mc.nome}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: '17px', color: '#F5A800',
                }}>
                  {mc.pontos} pts
                </span>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
                  color: 'rgba(255,255,255,0.38)', background: 'rgba(255,255,255,0.07)',
                  padding: '3px 8px', borderRadius: '3px',
                }}>
                  {mc.twolalas} TWL
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}