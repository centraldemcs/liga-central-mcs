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
        .limit(100)
      setRanking(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Ranking</h1>
            <p className="text-zinc-500 text-sm">Liga Central de MCs</p>
          </div>
          <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
            ← início
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
            <span className="text-zinc-500 text-xs">Líder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/30"></div>
            <span className="text-zinc-500 text-xs">Classificados para a Copa Nacional Central de MC's (top 16)</span>
          </div>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-center py-12">Carregando...</p>
        ) : ranking.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Nenhum MC no ranking ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-2 text-zinc-500 font-medium w-8">#</th>
                  <th className="text-left py-2 px-2 text-zinc-500 font-medium">MC</th>
                  <th className="text-center py-2 px-2 text-zinc-500 font-medium w-10" title="Batalhas">B</th>
                  <th className="text-center py-2 px-2 text-zinc-500 font-medium w-10" title="Títulos">T</th>
                  <th className="text-center py-2 px-2 text-zinc-500 font-medium w-10" title="Lavadas">L</th>
                  <th className="text-center py-2 px-2 text-zinc-500 font-medium w-12" title="Pontos">PTS</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((mc, i) => {
                  const isLider = i === 0
                  const isClassificado = i > 0 && i < 16
                  const rowClass = isLider
                    ? 'bg-amber-500/10 border-l-2 border-amber-500'
                    : isClassificado
                    ? 'bg-emerald-500/5 border-l-2 border-emerald-500/40'
                    : 'border-l-2 border-transparent'

                  return (
                    <tr key={mc.id} className={`border-b border-zinc-900 ${rowClass}`}>
                      <td className="py-3 px-2">
                        <span className={`font-bold ${isLider ? 'text-amber-400' : isClassificado ? 'text-emerald-400' : 'text-zinc-600'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium">{mc.nome_artistico}</span>
                      </td>
                      <td className="py-3 px-2 text-center text-zinc-400">{mc.total_noites}</td>
                      <td className="py-3 px-2 text-center text-zinc-400">{mc.total_titulos}</td>
                      <td className="py-3 px-2 text-center text-zinc-400">{mc.total_lavadas}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`font-bold text-base ${isLider ? 'text-amber-400' : isClassificado ? 'text-emerald-400' : 'text-zinc-300'}`}>
                          {mc.total_pontos}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="flex items-center gap-6 mt-4 text-xs text-zinc-600">
              <span>B = Batalhas</span>
              <span>T = Títulos</span>
              <span>L = Lavadas</span>
              <span>PTS = Pontos</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
