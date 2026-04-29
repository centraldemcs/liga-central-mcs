import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function BatalhasPage() {
  const supabase = createServerClient()

  const { data: batalhas } = await supabase
    .from('batalhas')
    .select('id, nome, cidade, estado, slug, distribuidora, dias_semana, horario')
    .eq('status', 'aprovada')
    .order('nome', { ascending: true })

  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: 'Barlow, sans-serif' }}>

      <div style={{ borderBottom: '1px solid rgba(245,168,0,0.2)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Liga Central de MC's</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '42px', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
            Batalhas <span style={{ color: '#F5A800' }}>Filiadas</span>
          </h1>
        </div>
        <Link href="/" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none', letterSpacing: '1px', borderBottom: '1px solid rgba(245,168,0,0.4)', paddingBottom: '2px' }}>
          Inicio
        </Link>
      </div>

      <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/mapa" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(245,168,0,0.1)', border: '1px solid rgba(245,168,0,0.3)', padding: '12px 24px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '15px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none', clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>
          Ver no Mapa do Brasil
        </Link>
      </div>

      <style>{`
        .batalha-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
        .batalha-card:hover { background: rgba(245,168,0,0.08); border-color: rgba(245,168,0,0.3); }
      `}</style>

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {(batalhas ?? []).map((b) => (
            <Link key={b.id} href={'/batalhas/' + b.slug} style={{ textDecoration: 'none' }}>
              <div className="batalha-card" style={{ padding: '24px', clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
                  {b.cidade} — {b.estado}
                </p>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase', color: '#fff', lineHeight: 1, marginBottom: '12px' }}>
                  {b.nome}
                </h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {b.dias_semana && (
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#F5A800', background: 'rgba(245,168,0,0.1)', padding: '3px 8px', borderRadius: '3px' }}>
                      {b.dias_semana}
                    </span>
                  )}
                  {b.distribuidora && (
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '3px' }}>
                      {b.distribuidora}
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: '#F5A800', marginTop: '16px', letterSpacing: '0.5px' }}>
                  Ver batalha →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}