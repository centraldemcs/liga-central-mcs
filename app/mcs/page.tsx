import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function McsPage() {
  const supabase = createServerClient()

  const { data: ranking } = await supabase
    .from('ranking_geral')
    .select('id, nome_artistico, total_pontos, total_lavadas, total_noites, cidade, estado')

  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: 'Barlow, sans-serif' }}>

      <div style={{ borderBottom: '1px solid rgba(245,168,0,0.2)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Liga Central de MC's</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '42px', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
            MCs <span style={{ color: '#F5A800' }}>Ativos</span>
          </h1>
        </div>
        <Link href="/" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none', letterSpacing: '1px', borderBottom: '1px solid rgba(245,168,0,0.4)', paddingBottom: '2px' }}>
          Inicio
        </Link>
      </div>

      <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/mapa-mcs" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(245,168,0,0.1)', border: '1px solid rgba(245,168,0,0.3)', padding: '12px 24px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '15px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none', clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>
          🗺️ Ver MCs no Mapa do Brasil
        </Link>
      </div>

      <style>{`
        .mc-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
        .mc-card:hover { background: rgba(245,168,0,0.08); border-color: rgba(245,168,0,0.3); }
      `}</style>

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {(ranking ?? []).map((mc, i) => {
            const slug = mc.nome_artistico.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
            const isLider = i === 0
            return (
              <Link key={mc.id} href={'/mcs/' + slug} style={{ textDecoration: 'none' }}>
                <div className="mc-card" style={{ padding: '20px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)', background: isLider ? 'rgba(245,168,0,0.1)' : undefined, borderColor: isLider ? 'rgba(245,168,0,0.4)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: isLider ? '22px' : '18px', color: isLider ? '#F5A800' : 'rgba(255,255,255,0.2)' }}>
                      {isLider ? '👑' : (i + 1) + 'º'}
                    </span>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '20px', color: '#F5A800' }}>
                      {mc.total_pontos} pts
                    </span>
                  </div>
                  <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '22px', textTransform: 'uppercase', color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
                    {mc.nome_artistico}
                  </h2>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>
                    {mc.cidade} — {mc.estado}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {mc.total_lavadas > 0 && (
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#F5A800', background: 'rgba(245,168,0,0.1)', padding: '3px 8px', borderRadius: '3px' }}>
                        {mc.total_lavadas} TWL
                      </span>
                    )}
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '3px' }}>
                      {mc.total_noites} batalhas
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}