import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const faseLabel: any = {
  oitavas: 'Oitavas',
  quartas: 'Quartas',
  semifinal: 'Semifinal',
  final: 'Final',
}

export default async function McPerfilPage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient()
  const { slug } = params

  const { data: mcs } = await supabase.from('mcs').select('*')

  const mc = mcs?.find(m =>
    m.nome_artistico.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '') === slug
  )

  if (!mc) return notFound()

  const { data: ranking } = await supabase
    .from('ranking_geral')
    .select('id, nome_artistico, total_pontos, total_lavadas')

  const posicao = ranking ? ranking.findIndex(r => r.id === mc.id) + 1 : 0
  const rankingMc = ranking?.find(r => r.id === mc.id)

  const { data: confrontos } = await supabase
    .from('confrontos')
    .select(`id, vencedor_id, mc_a_id, mc_b_id, fase, placar, lavada,
      mcs_a:mc_a_id(nome_artistico),
      mcs_b:mc_b_id(nome_artistico),
      noites(data, batalhas(nome))`)
    .or(`mc_a_id.eq.${mc.id},mc_b_id.eq.${mc.id}`)
    .order('created_at', { ascending: false })

  const total = confrontos?.length ?? 0
  const vitorias = confrontos?.filter(c => c.vencedor_id === mc.id).length ?? 0
  const winRate = total > 0 ? Math.round((vitorias / total) * 1000) / 10 : 0
  const twolalas = rankingMc?.total_lavadas ?? 0

  const adversarioMap: Record<string, { nome: string; total: number; vitorias: number; derrotas: number }> = {}
  confrontos?.forEach((c: any) => {
    const advId = c.mc_a_id === mc.id ? c.mc_b_id : c.mc_a_id
    const advNome = c.mc_a_id === mc.id ? c.mcs_b?.nome_artistico : c.mcs_a?.nome_artistico
    if (!advNome) return
    if (!adversarioMap[advId]) adversarioMap[advId] = { nome: advNome, total: 0, vitorias: 0, derrotas: 0 }
    adversarioMap[advId].total++
    if (c.vencedor_id === mc.id) adversarioMap[advId].vitorias++
    else adversarioMap[advId].derrotas++
  })

  const adversarios = Object.values(adversarioMap).sort((a, b) => b.total - a.total)
  const carrasco = Object.values(adversarioMap).sort((a, b) => b.derrotas - a.derrotas)[0]
  const sacoDePancada = Object.values(adversarioMap).sort((a, b) => b.vitorias - a.vitorias)[0]

  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ background: '#F5A800', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '4px' }}>
            {posicao > 0 ? `#${posicao} no ranking` : "Liga Central de MC's"}
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '52px', lineHeight: 1, textTransform: 'uppercase', color: '#111' }}>
            {mc.nome_artistico}
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', marginTop: '4px' }}>
            {mc.cidade} — {mc.estado}
          </p>
        </div>
        <Link href="/ranking" style={{ background: '#111', color: '#F5A800', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '13px', textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none', clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
          ← Ranking
        </Link>
      </div>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          <StatCard label="Pontos" value={(rankingMc?.total_pontos ?? 0).toString()} sub="no ranking" />
          <StatCard label="Posição" value={posicao > 0 ? `#${posicao}` : '-'} sub="geral" />
          <StatCard label="Win-Rate" value={`${winRate}%`} sub="*a partir semana #2" />
          <StatCard label="Twolalas" value={twolalas.toString()} sub="lavadas" />
          <StatCard label="Confrontos" value={total.toString()} sub="disputados" />
        </div>

        {adversarios.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>
              Rivalidades
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {carrasco && carrasco.derrotas > 0 && (
                <div style={{ background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.2)', padding: '20px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,100,100,0.7)', marginBottom: '6px' }}>💀 Carrasco</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase', color: '#fff', marginBottom: '4px' }}>{carrasco.nome}</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{carrasco.derrotas} derrota{carrasco.derrotas > 1 ? 's' : ''} em {carrasco.total} confronto{carrasco.total > 1 ? 's' : ''}</p>
                </div>
              )}
              {sacoDePancada && sacoDePancada.vitorias > 0 && (
                <div style={{ background: 'rgba(245,168,0,0.08)', border: '1px solid rgba(245,168,0,0.2)', padding: '20px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,168,0,0.7)', marginBottom: '6px' }}>👊 Saco de Pancada</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase', color: '#fff', marginBottom: '4px' }}>{sacoDePancada.nome}</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{sacoDePancada.vitorias} vitória{sacoDePancada.vitorias > 1 ? 's' : ''} em {sacoDePancada.total} confronto{sacoDePancada.total > 1 ? 's' : ''}</p>
                </div>
              )}
              {adversarios[0] && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>🔄 Adversário Frequente</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase', color: '#fff', marginBottom: '4px' }}>{adversarios[0].nome}</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{adversarios[0].total} confronto{adversarios[0].total > 1 ? 's' : ''} · {adversarios[0].vitorias}V {adversarios[0].derrotas}D</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>
            Histórico
          </h2>
          {!confrontos || confrontos.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Nenhum confronto registrado ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {confrontos.map((c: any, i: number) => {
                const venceu = c.vencedor_id === mc.id
                const noite = c.noites as any
                const batalha = noite?.batalhas as any
                const advNome = c.mc_a_id === mc.id ? c.mcs_b?.nome_artistico : c.mcs_a?.nome_artistico
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: venceu ? 'rgba(245,168,0,0.07)' : 'rgba(255,50,50,0.05)', border: venceu ? '1px solid rgba(245,168,0,0.2)' : '1px solid rgba(255,50,50,0.15)', padding: '14px 18px', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '14px', color: venceu ? '#F5A800' : 'rgba(255,100,100,0.8)', textTransform: 'uppercase', minWidth: '40px' }}>
                        {venceu ? 'WIN' : 'DEF'}
                      </span>
                      <div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: '#fff', textTransform: 'uppercase' }}>
                          vs {advNome || 'Adversário'}
                        </p>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                          {batalha?.nome || 'Batalha'} · {faseLabel[c.fase] || c.fase} · {c.placar}
                        </p>
                      </div>
                    </div>
                    {c.lavada && (
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', color: '#F5A800', letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(245,168,0,0.15)', padding: '3px 8px', borderRadius: '3px' }}>
                        twolala
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px 16px', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '32px', color: '#F5A800', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px', fontStyle: 'italic' }}>{sub}</p>}
    </div>
  )
}