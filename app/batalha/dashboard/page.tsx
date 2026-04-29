'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardBatalha() {
  const [batalha, setBatalha] = useState<any>(null)
  const [mcs, setMcs] = useState<any[]>([])
  const [noites, setNoites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/batalha/login'); return }

      const { data: batalhaData } = await supabase
        .from('batalhas').select('*').eq('profile_id', user.id).single()
      if (!batalhaData) { router.push('/batalha/login'); return }
      setBatalha(batalhaData)

      const { data: noitesData } = await supabase
        .from('noites').select('*, confrontos(count)')
        .eq('batalha_id', batalhaData.id)
        .order('data', { ascending: false }).limit(5)
      setNoites(noitesData || [])

      const { data: ptsData } = await supabase
        .from('pontuacoes').select('mc_id, pontos, mcs(nome_artistico, cidade)')
        .eq('batalha_id', batalhaData.id)

      if (ptsData) {
        const map: any = {}
        ptsData.forEach((p: any) => {
          if (!map[p.mc_id]) map[p.mc_id] = { mc: p.mcs, pontos: 0 }
          map[p.mc_id].pontos += p.pontos
        })
        setMcs(Object.values(map).sort((a: any, b: any) => b.pontos - a.pontos))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <main style={{ background: '#111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' }}>Carregando...</p>
    </main>
  )

  const statusLabel: any = { pendente: 'Aguardando aprovação', aprovada: 'Aprovada', recusada: 'Recusada' }
  const statusColor: any = { pendente: '#F5A800', aprovada: '#4ade80', recusada: '#f87171' }
  const statusBg: any = { pendente: 'rgba(245,168,0,0.08)', aprovada: 'rgba(74,222,128,0.08)', recusada: 'rgba(248,113,113,0.08)' }
  const statusBorder: any = { pendente: 'rgba(245,168,0,0.25)', aprovada: 'rgba(74,222,128,0.25)', recusada: 'rgba(248,113,113,0.25)' }

  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: '#F5A800', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '4px' }}>Painel da Batalha</p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '48px', lineHeight: 1, textTransform: 'uppercase', color: '#111' }}>{batalha.nome}</h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', marginTop: '4px' }}>{batalha.cidade} — {batalha.estado}</p>
        </div>
        <button onClick={handleLogout} style={{ background: '#111', color: '#F5A800', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '13px', textTransform: 'uppercase', padding: '10px 20px', border: 'none', cursor: 'pointer', clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
          Sair
        </button>
      </div>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>

        {/* STATUS */}
        <div style={{ background: statusBg[batalha.status], border: `1px solid ${statusBorder[batalha.status]}`, padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          <div>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Status</p>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '22px', color: statusColor[batalha.status], textTransform: 'uppercase' }}>{statusLabel[batalha.status]}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Distribuidora</p>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '22px', color: '#fff', textTransform: 'uppercase' }}>{batalha.distribuidora}</p>
          </div>
        </div>

        {/* AVISO PENDENTE */}
        {batalha.status === 'pendente' && (
          <div style={{ background: 'rgba(245,168,0,0.08)', border: '1px solid rgba(245,168,0,0.2)', padding: '20px 24px', marginBottom: '24px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '16px', color: '#F5A800', textTransform: 'uppercase', marginBottom: '6px' }}>Cadastro em análise</p>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Nossa equipe validará os dados em até 5 dias úteis. Após aprovação, seus resultados poderão ser registrados pelo admin da Liga.</p>
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          <StatCard label="Noites" value={noites.length.toString()} />
          <StatCard label="MCs" value={mcs.length.toString()} />
          <StatCard label="Cidade" value={batalha.cidade} />
        </div>

        {/* MCS DA BATALHA */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>
            MCs da Batalha
          </h2>
          {mcs.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Nenhum resultado registrado ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {mcs.slice(0, 8).map((m: any, i) => (
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
          )}
        </div>

        {/* ÚLTIMAS NOITES */}
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>
            Últimas Noites
          </h2>
          {noites.length === 0 ? (
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px 16px', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '32px', color: '#F5A800', lineHeight: 1 }}>{value}</p>
    </div>
  )
}