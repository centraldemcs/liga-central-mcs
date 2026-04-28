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

        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
          <span className="text-zinc-500 text-xs">Líder</span>
          <div className="w-3 h-3 rounded-full bg-emerald-500/30 ml-3"></div>
          <span className="text-zinc-500 text-xs">Classificados para a Copa Nacional Central de MC's (top 16)</span>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-center py-12">Carregando...</p>
        ) : ranking.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Nenhum MC no ranking ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((mc, i) => {
              const isLider = i === 0
              const isClassificado = i > 0 && i < 16
              const bgClass = isLider
                ? 'bg-amber-500/10 border border-amber-500/20'
                : isClassificado
                ? 'bg-emerald-500/5 border border-emerald-500/15'
                : 'bg-zinc-900'

              return (
                <div key={mc.id} className={`rounded-xl p-4 flex items-center gap-4 ${bgClass}`}>
                  <span className={`text-lg font-bold min-w-8 ${isLider ? 'text-amber-400' : isClassificado ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{mc.nome_artistico}</p>
                    <p className="text-zinc-500 text-xs">{mc.cidade} · {mc.estado} · {mc.total_noites} batalha{mc.total_noites !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isLider ? 'text-amber-400' : isClassificado ? 'text-emerald-400' : 'text-zinc-400'}`}>{mc.total_pontos}</p>
                    <p className="text-zinc-600 text-xs">pts</p>
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
