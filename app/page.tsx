import { createServerClient } from '@/lib/supabase-server'
import Navbar from './components/home/Navbar'
import Hero from './components/home/Hero'
import StatsBar from './components/home/StatsBar'
import RankingSemanal from './components/home/RankingSemanal'
import McDestaqueCard from './components/home/McDestaqueCard'
import Footer from './components/home/Footer'
import type { RankingEntry } from './components/home/RankingSemanal'
import type { McDestaque } from './components/home/McDestaqueCard'

export const revalidate = 600

export default async function HomePage() {
  const supabase = createServerClient()

  // Busca tudo em paralelo
  const [configRes, batalhasRes, mcsRes, totalMcsRes, totalBatalhasRes] = await Promise.all([
    supabase.from('liga_config').select('semana_atual').single(),
    supabase.from('batalhas').select('id, nome, slug').eq('status', 'aprovada').order('nome'),
    supabase.from('ranking_geral').select('id, nome_artistico').limit(5),
    supabase.from('mcs').select('*', { count: 'exact', head: true }),
    supabase.from('batalhas').select('*', { count: 'exact', head: true }).eq('status', 'aprovada'),
  ])

  const SEMANA_ATUAL = configRes.data?.semana_atual ?? 2

  const batalhasNav = (batalhasRes.data ?? []).map(b => ({ id: b.id, titulo: b.nome, slug: b.slug }))
  const mcsNav = (mcsRes.data ?? []).map(mc => ({
    id: mc.id, nome: mc.nome_artistico,
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

  let winRateLider = 0
  let mcDestaque: McDestaque | null = null
  const lider = ranking[0]

  if (lider) {
    const { data: mcLider } = await supabase
      .from('mcs').select('id').eq('nome_artistico', lider.nome).single()

    if (mcLider) {
      const { data: confrontosMc } = await supabase
        .from('confrontos').select('id, vencedor_id')
        .or(`mc_a_id.eq.${mcLider.id},mc_b_id.eq.${mcLider.id}`)

      const total = confrontosMc?.length ?? 0
      const vitorias = confrontosMc?.filter(c => c.vencedor_id === mcLider.id).length ?? 0
      winRateLider = total > 0 ? Math.round((vitorias / total) * 1000) / 10 : 0

      mcDestaque = {
        nome: lider.nome, slug: lider.slug, semana: SEMANA_ATUAL,
        pontos: lider.pontos, twolalas: lider.twolalas,
        winRate: winRateLider, totalBatalhas: total,
      }
    }
  }

  return (
    <main style={{ background: '#111111', minHeight: '100vh' }}>
      <Navbar batalhas={batalhasNav} mcs={mcsNav} />
      <Hero semanaAtual={SEMANA_ATUAL} />
      <StatsBar
        totalMcs={totalMcsRes.count ?? 0}
        totalBatalhas={totalBatalhasRes.count ?? 0}
        winRateLider={winRateLider}
      />
      <RankingSemanal semana={SEMANA_ATUAL} ranking={ranking} />
      {mcDestaque && <McDestaqueCard mc={mcDestaque} />}
      <Footer />
    </main>
  )
}