'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const faseLabel: any = {
  oitavas: 'Oitavas',
  quartas: 'Quartas',
  semifinal: 'Semifinal',
  final: 'Final',
}

export default function MCDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [mc, setMc] = useState<any>(null)
  const [pontos, setPontos] = useState(0)
  const [posicao, setPosicao] = useState(0)
  const [historico, setHistorico] = useState<any[]>([])
  const [confrontos, setConfrontos] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/mc/login'); return }

      const { data: mcData } = await supabase
        .from('mcs').select('*').eq('profile_id', user.id).single()
      if (!mcData) { router.push('/mc/login'); return }
      setMc(mcData)

      // Pontos totais
      const { data: pts } = await supabase
        .from('pontuacoes').select('pontos').eq('mc_id', mcData.id)
      const total = pts?.reduce((acc, p) => acc + p.pontos, 0) || 0
      setPontos(total)

      // Posição no ranking
      const { data: ranking } = await supabase
        .from('ranking_geral').select('id')
      const pos = ranking?.findIndex((r: any) => r.id === mcData.id)
      setPosicao(pos !== undefined && pos >= 0 ? pos + 1 : 0)

      // Histórico de pontuações
      const { data: hist } = await supabase
        .from('pontuacoes')
        .select(`pontos, bonus_lavada, created_at, confrontos ( fase, placar, vencedor_id, mc_a_id, mc_b_id, noites ( data, batalhas ( nome ) ) )`)
        .eq('mc_id', mcData.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setHistorico(hist || [])

      // Todos os confrontos para calcular rivalidades
      const { data: cfr } = await supabase
        .from('confrontos')
        .select(`id, vencedor_id, mc_a_id, mc_b_id, mcs_a:mc_a_id(nome_artistico), mcs_b:mc_b_id(nome_artistico)`)
        .or(`mc_a_id.eq.${mcData.id},mc_b_id.eq.${mcData.id}`)
      setConfrontos(cfr || [])

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <main style={{ background: '#111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Carregando...</p>
    </main>
  )

  // Calcula stats de rivalidade
  const twolalas = historico.filter(h => h.bonus_lavada).length
  const totalConfrontos = confrontos.length
  const vitorias = confrontos.filter(c => c.vencedor_id === mc.id).length
  const winRate = totalConfrontos > 0 ? Math.round((vitorias / totalConfrontos) * 1000) / 10 : 0

  // Mapa de adversários
  const adversarioMap: Record<string, { nome: string; total: number; vitorias: number; derrotas: number }> = {}
  confrontos.forEach(c => {
    const adversarioId = c.mc_a_id === mc.id ? c.mc_b_id : c.mc_a_id
    const adversarioNome = c.mc_a_id === mc.id
      ? (c.mcs_b as any)?.nome_artistico
      : (c.mcs_a as any)?.nome_artistico
    if (!adversarioNome) return
    if (!adversarioMap[adversarioId]) {
      adversarioMap[adversarioId] = { nome: adversarioNome, total: 0, vitorias: 0, derrotas: 0 }
    }
    adversarioMap[adversarioId].total++
    if (c.vencedor_id === mc.id) adversarioMap[adversarioId].vitorias++
    else adversarioMap[adversarioId].derrotas++
  })

  const adversarios = Object.values(adversarioMap).sort((a, b) => b.total - a.total)
  const carrasco = Object.values(adversarioMap).sort((a, b) => b.derrotas - a.derrotas)[0]
  const sacoDePancada = Object.values(adversarioMap).sort((a, b) => b.vitorias - a.vitorias)[0]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: '#F5A800', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)', marginBottom: '4px' }}>Dashboard do MC</p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '48px', lineHeight: 1, textTransform: 'uppercase', color: '#111' }}>{mc.nome_artistico}</h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', marginTop: '4px' }}>{mc.cidade} — {mc.estado}</p>
        </div>
        <button onClick={handleLogout} style={{ background: '#111', color: '#F5A800', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '13px', textTransform: 'uppercase', padding: '10px 20px', border: 'none', cursor: 'pointer', clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
          Sair
        </button>
      </div>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>

        {/* STATS PRINCIPAIS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          <StatCard label="Pontuação" value={pontos.toString()} sub="pts totais" />
          <StatCard label="Posição" value={posicao > 0 ? `#${posicao}` : '-'} sub="no ranking" />
          <StatCard label="Win-Rate" value={`${winRate}%`} sub="*a partir semana #2" />
          <StatCard label="Twolalas" value={twolalas.toString()} sub="lavadas" />
          <StatCard label="Confrontos" value={totalConfrontos.toString()} sub="disputados" />
        </div>

        {/* RIVALIDADES */}
        {adversarios.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>
              Rivalidades
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>

              {/* Carrasco */}
              {carrasco && carrasco.derrotas > 0 && (
                <div style={{ background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.2)', padding: '20px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,100,100,0.7)', marginBottom: '6px' }}>💀 Carrasco</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase', color: '#fff', marginBottom: '4px' }}>{carrasco.nome}</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{carrasco.derrotas} derrota{carrasco.derrotas > 1 ? 's' : ''} em {carrasco.total} confronto{carrasco.total > 1 ? 's' : ''}</p>
                </div>
              )}

              {/* Saco de Pancada */}
              {sacoDePancada && sacoDePancada.vitorias > 0 && (
                <div style={{ background: 'rgba(245,168,0,0.08)', border: '1px solid rgba(245,168,0,0.2)', padding: '20px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,168,0,0.7)', marginBottom: '6px' }}>👊 Saco de Pancada</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase', color: '#fff', marginBottom: '4px' }}>{sacoDePancada.nome}</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{sacoDePancada.vitorias} vitória{sacoDePancada.vitorias > 1 ? 's' : ''} em {sacoDePancada.total} confronto{sacoDePancada.total > 1 ? 's' : ''}</p>
                </div>
              )}

              {/* Adversário mais frequente */}
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

        {/* HISTÓRICO */}
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '28px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '12px' }}>
            Histórico
          </h2>

          {historico.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Nenhuma batalha registrada ainda.</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>Seus resultados vão aparecer aqui conforme o admin registrar as batalhas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {historico.map((h, i) => {
                const confronto = h.confrontos as any
                const noite = confronto?.noites as any
                const batalha = noite?.batalhas as any
                const venceu = confronto?.vencedor_id === mc.id
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: venceu ? 'rgba(245,168,0,0.07)' : 'rgba(255,255,255,0.03)', border: venceu ? '1px solid rgba(245,168,0,0.2)' : '1px solid rgba(255,255,255,0.06)', padding: '14px 18px', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                    <div>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', color: '#fff', textTransform: 'uppercase' }}>{batalha?.nome || 'Batalha'}</p>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{faseLabel[confronto?.fase] || confronto?.fase} · {confronto?.placar}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '18px', color: '#F5A800' }}>+{h.pontos} pts</p>
                      {h.bonus_lavada && <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', color: '#F5A800', letterSpacing: '1px', textTransform: 'uppercase' }}>twolala</p>}
                    </div>
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