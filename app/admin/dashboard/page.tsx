'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ mcs: 0, batalhas: 0, pendentes: 0, confrontos: 0 })
  const [batalhasPendentes, setBatalhasPendentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', user.id)
        .single()

      if (profile?.tipo !== 'admin') { router.push('/'); return }

      const [mcs, batalhas, confrontos, pendentes] = await Promise.all([
        supabase.from('mcs').select('id', { count: 'exact' }),
        supabase.from('batalhas').select('id', { count: 'exact' }),
        supabase.from('confrontos').select('id', { count: 'exact' }),
        supabase.from('batalhas').select('*').eq('status', 'pendente'),
      ])

      setStats({
        mcs: mcs.count || 0,
        batalhas: batalhas.count || 0,
        confrontos: confrontos.count || 0,
        pendentes: pendentes.data?.length || 0,
      })
      setBatalhasPendentes(pendentes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function aprovarBatalha(id: string) {
    await supabase.from('batalhas').update({ status: 'aprovada' }).eq('id', id)
    setBatalhasPendentes(prev => prev.filter(b => b.id !== id))
    setStats(prev => ({ ...prev, pendentes: prev.pendentes - 1 }))
  }

  async function recusarBatalha(id: string) {
    await supabase.from('batalhas').update({ status: 'recusada' }).eq('id', id)
    setBatalhasPendentes(prev => prev.filter(b => b.id !== id))
    setStats(prev => ({ ...prev, pendentes: prev.pendentes - 1 }))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <p className="text-zinc-500">Carregando...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Liga Central de MCs</p>
            <h1 className="text-xl font-bold">Painel Admin</h1>
          </div>
          <button onClick={handleLogout} className="text-zinc-500 hover:text-white text-sm transition-colors">
            Sair
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">MCs filiados</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.mcs}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Batalhas</p>
            <p className="text-3xl font-bold">{stats.batalhas}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Confrontos</p>
            <p className="text-3xl font-bold">{stats.confrontos}</p>
          </div>
          <div className={`rounded-xl p-4 ${stats.pendentes > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-zinc-900'}`}>
            <p className="text-zinc-500 text-xs mb-1">Pendentes</p>
            <p className={`text-3xl font-bold ${stats.pendentes > 0 ? 'text-amber-400' : ''}`}>{stats.pendentes}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <Link href="/admin/confrontos" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-lg text-center text-sm transition-colors">
            Cadastrar confrontos
          </Link>
          <Link href="/ranking" className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white font-semibold py-3 rounded-lg text-center text-sm transition-colors">
            Ver ranking
          </Link>
        </div>

        {batalhasPendentes.length > 0 && (
          <>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Batalhas aguardando aprovação</h2>
            <div className="flex flex-col gap-3">
              {batalhasPendentes.map(b => (
                <div key={b.id} className="bg-zinc-900 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{b.nome}</p>
                      <p className="text-zinc-500 text-xs">{b.cidade} · {b.estado} · {b.distribuidora}</p>
                      <p className="text-zinc-500 text-xs mt-1">Resp: {b.responsavel_nome} · {b.responsavel_email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => aprovarBatalha(b.id)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 rounded-lg text-sm transition-colors"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => recusarBatalha(b.id)}
                      className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {batalhasPendentes.length === 0 && (
          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <p className="text-zinc-500 text-sm">Nenhuma batalha pendente de aprovação.</p>
          </div>
        )}
      </div>
    </main>
  )
}
