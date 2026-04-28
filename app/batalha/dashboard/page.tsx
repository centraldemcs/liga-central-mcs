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
        .from('batalhas')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (!batalhaData) { router.push('/batalha/login'); return }
      setBatalha(batalhaData)

      const { data: noitesData } = await supabase
        .from('noites')
        .select('*, confrontos(count)')
        .eq('batalha_id', batalhaData.id)
        .order('data', { ascending: false })
        .limit(5)

      setNoites(noitesData || [])

      const { data: ptsData } = await supabase
        .from('pontuacoes')
        .select('mc_id, pontos, mcs(nome_artistico, cidade)')
        .eq('batalha_id', batalhaData.id)

      if (ptsData) {
        const map: any = {}
        ptsData.forEach((p: any) => {
          if (!map[p.mc_id]) map[p.mc_id] = { mc: p.mcs, pontos: 0 }
          map[p.mc_id].pontos += p.pontos
        })
        const sorted = Object.values(map).sort((a: any, b: any) => b.pontos - a.pontos)
        setMcs(sorted)
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
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-zinc-500">Carregando...</p>
    </main>
  )

  const statusLabel: any = { pendente: 'Aguardando aprovação', aprovada: 'Aprovada', recusada: 'Recusada' }
  const statusColor: any = { pendente: 'text-amber-400', aprovada: 'text-emerald-400', recusada: 'text-red-400' }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-zinc-500 text-sm">Painel da batalha</p>
            <h1 className="text-xl font-bold">{batalha.nome}</h1>
          </div>
          <button onClick={handleLogout} className="text-zinc-500 hover:text-white text-sm transition-colors">
            Sair
          </button>
        </div>

        <div className="bg-zinc-900 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-xs">Status</p>
            <p className={`font-medium ${statusColor[batalha.status]}`}>{statusLabel[batalha.status]}</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-xs">Distribuidora</p>
            <p className="font-medium capitalize">{batalha.distribuidora}</p>
          </div>
        </div>

        {batalha.status === 'pendente' && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm font-medium mb-1">Cadastro em análise</p>
            <p className="text-zinc-400 text-xs">Nossa equipe validará os dados em até 5 dias úteis. Após aprovação, seus resultados poderão ser registrados pelo admin da Liga.</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Noites</p>
            <p className="text-2xl font-bold">{noites.length}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">MCs</p>
            <p className="text-2xl font-bold">{mcs.length}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Cidade</p>
            <p className="text-sm font-medium">{batalha.cidade}</p>
          </div>
        </div>

        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">MCs da batalha</h2>
        {mcs.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-center mb-6">
            <p className="text-zinc-500 text-sm">Nenhum resultado registrado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {mcs.slice(0, 8).map((m: any, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl p-4 flex items-center gap-3">
                <span className="text-zinc-600 text-sm w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{m.mc?.nome_artistico}</p>
                  <p className="text-zinc-500 text-xs">{m.mc?.cidade}</p>
                </div>
                <p className="text-emerald-400 font-bold">{m.pontos} pts</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Últimas noites</h2>
        {noites.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <p className="text-zinc-500 text-sm">Nenhuma noite registrada ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {noites.map((n: any, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{new Date(n.data).toLocaleDateString('pt-BR')}</p>
                  <p className="text-zinc-500 text-xs">{n.formato} · {n.vagas} vagas · {n.rounds} rounds</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
