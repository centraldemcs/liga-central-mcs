import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function BatalhaPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = createServerClient()
  const { slug } = await params

  const { data: batalha } = await supabase
    .from('batalhas')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!batalha) return notFound()

  const { data: noites } = await supabase
    .from('noites')
    .select('*, confrontos(count)')
    .eq('batalha_id', batalha.id)
    .order('data', { ascending: false })

  const { data: ptsData } = await supabase
    .from('pontuacoes')
    .select('mc_id, pontos, mcs(nome_artistico, cidade)')
    .eq('batalha_id', batalha.id)

  const mcMap: any = {}
  ptsData?.forEach((p: any) => {
    if (!mcMap[p.mc_id]) mcMap[p.mc_id] = { mc: p.mcs, pontos: 0 }
    mcMap[p.mc_id].pontos += p.pontos
  })
  const ranking = Object.values(mcMap).sort((a: any, b: any) => b.pontos - a.pontos)

  const { data: titulos } = await supabase
    .from('confrontos')
    .select('vencedor_id, mcs:vencedor_id(nome_artistico)')
    .eq('fase', 'final')
    .in('noite_id', noites?.map(n => n.id) ?? [])

  const tituloMap: any = {}
  titulos?.forEach((t: any) => {
    if (!t.vencedor_id) return
    if (!tituloMap[t.vencedor_id]) tituloMap[t.vencedor_id] = { nome: t.mcs?.nome_artistico, total: 0 }
    tituloMap[t.vencedor_id].total++
  })
  const maiorCampeao = Object.values(tituloMap).sort((a: any, b: any) => b.total - a.total)[0] as any

  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ background: '#F5A800', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '4px' }}>
            Batalha Filiada · {batalha.cidade} — {batalha.estado}
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '52px', lineHeight: 1, textTransform: 'uppercase', color: '#111' }}>
            {batalha.nome}
          </h1>
          {batalha.dias_semana && (
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', marginTop: '4px' }}>
              {batalha.dias_semana} {batalha.horario && `· ${batalha.horario}`}
            </p>
          )}
        </div>
        <Link href="/" style={{ background: '#111', color: '#F5A800', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '13px', textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none', clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
          ← Início
        </Link>
      </div>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          <StatCard label="Noites" value={(noites?.length ?? 0).toString()} />
          <StatCard label="MCs" value={ranking.length.toString()} />
          <StatCard label="Cidade" value={batalha.cidade} />
          {maiorCampeao && <StatCard label="Maior Campeão" value={maiorCampeao.nome} sub={`${maiorCampeao.total} título${maiorCampeao.total > 1 ? 's' : ''}`} />}
        </div>

        {batalha.descricao && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>Sobre</h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{batalha.descricao}</p>
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>Informações</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {batalha.endereco && <InfoCard icon="📍" label="Endereço" value={batalha.endereco} />}
            {batalha.dias_semana && <InfoCard icon="📅" label="Quando" value={`${batalha.dias_semana}${batalha.horario ? ` às ${batalha.horario}` : ''}`} />}
            {batalha.instagram && <InfoCard icon="📸" label="Instagram" value={`@${batalha.instagram}`} />}
            {batalha.distribuidora && <InfoCard icon="🎵" label="Distribuidora" value={batalha.distribuidora} />}
          </div>
        </div>

        {ranking.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>Ranking da Batalha</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {ranking.slice(0, 10).map((m: any, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: i === 0 ? 'rgba(245,168,0,0.1)' : 'rgba(255,255,255,0.035)', border: i === 0 ? '1px solid rgba(245,168,0,0.4)' : '1px solid rgba(255,255,255,0.06)', padding: '12px 18px', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: i === 0 ? '22px' : '18px', color: i === 0 ? '#F5A800' : 'rgba(255,255,255,0.25)', minWidth: '32px', textAlign: 'center' }}>
                    {i === 0 ? '👑' : `${i + 1}º`}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '18px', textTransform: 'uppercase', color: '#fff' }}>{m.mc?.nome_artistico}</p>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{m.mc?.cidade}</p>
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '18px', color: '#F5A800' }}>{m.pontos} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>Histórico de Noites</h2>
          {!noites || noites.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Nenhuma noite registrada ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {noites.map((n: any, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 18px', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                  <div>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '18px', color: '#fff', textTransform: 'uppercase' }}>
                      {new Date(n.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                      {n.formato} · {n.vagas} vagas · {n.rounds} rounds
                    </p>
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: '#F5A800', background: 'rgba(245,168,0,0.1)', padding: '4px 10px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {n.confrontos?.[0]?.count || 0} confrontos
                  </span>
                </div>
              ))}
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
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '24px', color: '#F5A800', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px', fontStyle: 'italic' }}>{sub}</p>}
    </div>
  )
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{icon} {label}</p>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: '#fff' }}>{value}</p>
    </div>
  )
}