'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function Ranking() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('ranking_geral')
        .select('*')
        .limit(50)
      setRanking(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Ranking</h1>
            <p className="text-zinc-500 text-sm">Liga Central de MCs</p>
          </div>
          <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
            ← início
          </Link>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-center py-12">Carregando...</p>
        ) : ranking.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Nenhum MC no ranking ainda.</p>
            <p className="text-zinc-600 text-sm mt-1">Os resultados aparecerão aqui conforme as batalhas forem registradas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((mc, i) => (
              <div key={mc.id} className={`rounded-xl p-4 flex items-center gap-4 ${i === 0 ? 'bg-amber-500/10 border border-amber-500/20' : i === 1 ? 'bg-zinc-800/50' : i === 2 ? 'bg-zinc-800/30' : 'bg-zinc-900'}`}>
                <span className={`text-lg font-bold min-w-8 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-700' : 'text-zinc-600'}`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{mc.nome_artistico}</p>
                  <p className="text-zinc-500 text-xs">{mc.cidade} · {mc.estado} · {mc.total_noites} batalha{mc.total_noites !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${i === 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{mc.total_pontos}</p>
                  <p className="text-zinc-600 text-xs">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
