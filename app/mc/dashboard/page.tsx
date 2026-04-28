'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardMC() {
  const [mc, setMc] = useState<any>(null)
  const [pontos, setPontos] = useState(0)
  const [posicao, setPosicao] = useState(0)
  const [historico, setHistorico] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/mc/login'); return }

      const { data: mcData } = await supabase
        .from('mcs')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (!mcData) { router.push('/mc/login'); return }
      setMc(mcData)

      const { data: pts } = await supabase
        .from('pontuacoes')
        .select('pontos')
        .eq('mc_id', mcData.id)

      const total = pts?.reduce((acc, p) => acc + p.pontos, 0) || 0
      setPontos(total)

      const { data: ranking } = await supabase
        .from('ranking_geral')
        .select('id')

      const pos = ranking?.findIndex((r: any) => r.id === mcData.id)
      setPosicao(pos !== undefined && pos >= 0 ? pos + 1 : 0)

      const { data: hist } = await supabase
        .from('pontuacoes')
        .select(`
          pontos,
          bonus_lavada,
          created_at,
          confrontos (
            fase,
            placar,
            noites ( data, batalhas ( nome ) )
          )
        `)
        .eq('mc_id', mcData.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setHistorico(hist || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-zinc-500">Carregando...</p>
    </main>
  )

  const faseLabel: any = {
    oitavas: 'Oitavas de final',
    quartas: 'Quartas de final',
    semifinal: 'Semifinal',
    final: 'Final'
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-zinc-500 text-sm">Bem-vindo,</p>
            <h1 className="text-xl font-bold">{mc.nome_artistico}</h1>
          </div>
          <button onClick={handleLogout} className="text-zinc-500 hover:text-white text-sm transition-colors">
            Sair
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Pontuação</p>
            <p className="text-2xl font-bold text-emerald-400">{pontos}</p>
            <p className="text-zinc-600 text-xs">pts totais</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Posição</p>
            <p className="text-2xl font-bold">{posicao > 0 ? `#${posicao}` : '-'}</p>
            <p className="text-zinc-600 text-xs">no ranking</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Batalhas</p>
            <p className="text-2xl font-bold">{historico.length}</p>
            <p className="text-zinc-600 text-xs">participações</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-4 mb-6">
          <p className="text-zinc-500 text-xs mb-1">Cidade</p>
          <p className="font-medium">{mc.cidade} — {mc.estado}</p>
        </div>

        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Histórico</h2>

        {historico.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <p className="text-zinc-500 text-sm">Nenhuma batalha registrada ainda.</p>
            <p className="text-zinc-600 text-xs mt-1">Seus resultados vão aparecer aqui conforme o admin registrar as batalhas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {historico.map((h, i) => {
              const confronto = h.confrontos as any
              const noite = confronto?.noites as any
              const batalha = noite?.batalhas as any
              return (
                <div key={i} className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{batalha?.nome || 'Batalha'}</p>
                    <p className="text-zinc-500 text-xs">{faseLabel[confronto?.fase] || confronto?.fase} · {confronto?.placar}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">+{h.pontos} pts</p>
                    {h.bonus_lavada && <p className="text-amber-400 text-xs">lavada</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
