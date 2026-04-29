import Link from 'next/link'

interface HeroProps {
  semanaAtual: number
}

export default function Hero({ semanaAtual }: HeroProps) {
  return (
    <section style={{
      position: 'relative', minHeight: '480px', display: 'flex',
      alignItems: 'center', overflow: 'hidden', padding: '56px 40px',
    }}>
      {/* Grid de fundo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          repeating-linear-gradient(90deg, rgba(245,168,0,0.025) 0px, rgba(245,168,0,0.025) 1px, transparent 1px, transparent 60px),
          repeating-linear-gradient(0deg, rgba(245,168,0,0.025) 0px, rgba(245,168,0,0.025) 1px, transparent 1px, transparent 60px)
        `,
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute', right: '-60px', top: '-80px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(245,168,0,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '580px' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(245,168,0,0.12)', border: '1px solid rgba(245,168,0,0.35)',
          padding: '5px 14px', marginBottom: '22px',
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' as const,
          color: '#F5A800', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#F5A800', display: 'inline-block',
            animation: 'pulse 1.5s infinite',
          }} />
          Temporada 2026 · Semana #{semanaAtual}
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
          fontSize: '68px', lineHeight: 0.92, textTransform: 'uppercase', color: '#fff', marginBottom: '10px',
        }}>
          Liga<br />
          <span style={{ color: '#F5A800' }}>Central</span><br />
          de MC's
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '17px',
          color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px',
        }}>
          Batalhas · Ranking
        </p>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/ranking" style={{
            background: '#F5A800', color: '#111',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
            fontSize: '15px', textTransform: 'uppercase', padding: '13px 30px', textDecoration: 'none',
            clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
          }}>
            Ver Ranking
          </Link>
          <Link href="/batalhas" style={{
            background: 'transparent', color: '#fff',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic',
            fontSize: '15px', textTransform: 'uppercase', padding: '12px 30px', textDecoration: 'none',
            border: '1.5px solid rgba(255,255,255,0.25)',
            clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
          }}>
            Ver Batalhas
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  )
}