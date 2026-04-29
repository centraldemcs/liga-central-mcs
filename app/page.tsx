import { createServerClient } from '@/lib/supabase-server'
import Navbar from './components/home/Navbar'
import Hero from './components/home/Hero'
import StatsBar from './components/home/StatsBar'
import RankingSemanal from './components/home/RankingSemanal'
import McDestaqueCard from './components/home/McDestaqueCard'
import Footer from './components/home/Footer'
import type { RankingEntry } from './components/home/RankingSemanal'
import type { McDestaque } from './components/home/McDestaqueCard'

const SEMANA_ATUAL = 2

export const revalidate = 300

export default async function HomePage() {
  const supabase = createServerClient()

  const { data: rankingRaw } = await supabase
    .from('ranking_geral')
    .select('id, nome_artistico, total_pontos, total_lavadas')
    .limit(5)

  const ranking: RankingEntry[] = (rankingRaw ?? []).map((mc, index) => ({
    posicao: index + 1,
    nome: mc.nome_artistico,
    slug: mc.nome_artistico.toLowerCase().replace(/\s+/g, '-').replace(/\./g, ''),
    pontos: Number(mc.total_pontos),
    twolalas: Number(mc.total_lavadas),
  }))

  const { count: totalMcs } = await supabase
    .from('mcs')
    .select('*', { count: 'exact', head: true })

  const { data: batalhasData } = await supabase
    .from('batalhas')
    .select('id')
    .like('id', 'b1000000%')

  const totalBatalhas = batalhasData?.length ?? 5

  let winRateLider = 0
  const lider = ranking[0]

  if (lider) {
    const { data: mcLider } = await supabase
      .from('mcs')
      .select('id')
      .eq('nome_artistico', lider.nome)
      .single()

    if (mcLider) {
      const { data: confrontosMc } = await supabase
        .from('confrontos')
        .select('id, vencedor_id')
        .or(`mc_a_id.eq.${mcLider.id},mc_b_id.eq.${mcLider.id}`)

      const total = confrontosMc?.length ?? 0
      const vitorias = confrontosMc?.filter(c => c.vencedor_id === mcLider.id).length ?? 0
      winRateLider = total > 0 ? Math.round((vitorias / total) * 1000) / 10 : 0

      const mcDestaque: McDestaque = {
        nome: lider.nome,
        slug: lider.slug,
        semana: SEMANA_ATUAL,
        pontos: lider.pontos,
        twolalas: lider.twolalas,
        winRate: winRateLider,
        totalBatalhas: total,
      }

      return (
        <main style={{ background: '#111111', minHeight: '100vh' }}>
          <Navbar />
          <Hero semanaAtual={SEMANA_ATUAL} />
          <StatsBar
            totalMcs={totalMcs ?? 0}
            totalBatalhas={totalBatalhas}
            winRateLider={winRateLider}
          />
          <RankingSemanal semana={SEMANA_ATUAL} ranking={ranking} />
          <McDestaqueCard mc={mcDestaque} />
          <Footer />
        </main>
      )
    }
  }

  return (
    <main style={{ background: '#111111', minHeight: '100vh' }}>
      <Navbar />
      <Hero semanaAtual={SEMANA_ATUAL} />
      <StatsBar
        totalMcs={totalMcs ?? 0}
        totalBatalhas={totalBatalhas}
        winRateLider={winRateLider}
      />
      <RankingSemanal semana={SEMANA_ATUAL} ranking={ranking} />
      <Footer />
    </main>
  )
}