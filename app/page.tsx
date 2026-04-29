import { createServerClient } from '@/lib/supabase-server'
import Navbar from './components/home/Navbar'
import Hero from './components/home/Hero'
import StatsBar from './components/home/StatsBar'
import RankingSemanal from './components/home/RankingSemanal'
import McDestaqueCard from './components/home/McDestaqueCard'
import Footer from './components/home/Footer'
import type { RankingEntry } from './components/home/RankingSemanal'
import type { McDestaque } from './components/home/McDestaqueCard'

export const revalidate = 300

export default async function HomePage() {
  const supabase = createServerClient()

  const { data: config } = await supabase
    .from('liga_config')
    .select('semana_atual')
    .single()

  const SEMANA_ATUAL = config?.semana_atual ?? 2

  // Batalhas para o dropdown
  const { data: batalhasMenu } = await supabase
    .from('batalhas')
    .select('id, nome, slug')
    .eq('status', 'aprovada')
    .order('nome', { ascending: true })

  // Top 5 MCs do ranking geral para o dropdown
  const { data: mcsMenu } = await supabase
    .from('ranking_geral')
    .select('id, nome_artistico')
    .limit(5)

  const batalhasNav = (batalhasMenu ?? []).map(b => ({
    id: b.id,
    titulo: b.nome,
    slug: b.slug,
  }))

  const mcsNav = (mcsMenu ?? []).map(mc => ({
    id: mc.id,
    nome: mc.nome_artistico,
    slug: mc.nome_artistico.toLowerCase().replace(/\s+/g, '-').replace(/\./g, ''),
  }))

  const { data: rankingRaw } = await supabase
    .from('ranking_semanal_view')
    .select('id, nome_artistico, total_pontos, total_lavadas')
    .eq('semana', SEMANA_ATUAL)
    .order('total_pontos', { ascending: false })
    .order('total_lavadas', { ascending: false })
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

  const { count: totalBatalhas } = await supabase
    .from('batalhas')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'aprovada')

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
          <Navbar batalhas={batalhasNav} mcs={mcsNav} />
          <Hero semanaAtual={SEMANA_ATUAL} />
          <StatsBar
            totalMcs={totalMcs ?? 0}
            totalBatalhas={totalBatalhas ?? 0}
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
      <Navbar batalhas={batalhasNav} mcs={mcsNav} />
      <Hero semanaAtual={SEMANA_ATUAL} />
      <StatsBar
        totalMcs={totalMcs ?? 0}
        totalBatalhas={totalBatalhas ?? 0}
        winRateLider={winRateLider}
      />
      <RankingSemanal semana={SEMANA_ATUAL} ranking={ranking} />
      <Footer />
    </main>
  )
}