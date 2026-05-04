'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminConfrontos() {
  const [batalhas, setBatalhas] = useState<any[]>([])
  const [mcs, setMcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ batalha_id: '', data: '', formato: '1x1', vagas: 8, rounds: 3 })
  const [confrontos, setConfrontos] = useState<any[]>([])
  const [faseAtual, setFaseAtual] = useState('')
  const [noiteId, setNoiteId] = useState<string | null>(null)
  const [etapa, setEtapa] = useState<'config' | 'confrontos'>('config')

  const numMcs = parseInt(form.formato.split('x')[0])

  // Times: arrays de MCs por lado
  const [timeA, setTimeA] = useState<(any | null)[]>([null])
  const [timeB, setTimeB] = useState<(any | null)[]>([null])
  const [searchA, setSearchA] = useState<string[]>([''])
  const [searchB, setSearchB] = useState<string[]>([''])
  const [placar, setPlacar] = useState('')
  const [vencedor, setVencedor] = useState('')

  useEffect(() => {
    const n = numMcs
    setTimeA(Array(n).fill(null))
    setTimeB(Array(n).fill(null))
    setSearchA(Array(n).fill(''))
    setSearchB(Array(n).fill(''))
    setPlacar('')
    setVencedor('')
  }, [form.formato])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }
      const { data: profile } = await supabase.from('profiles').select('tipo').eq('id', user.id).single()
      if (profile?.tipo !== 'admin') { router.push('/'); return }
      const { data: bats } = await supabase.from('batalhas').select('id, nome, cidade').eq('status', 'aprovada')
      const { data: mcList } = await supabase.from('mcs').select('id, nome_artistico, cidade')
      setBatalhas(bats || [])
      setMcs(mcList || [])
      setLoading(false)
    }
    load()
  }, [])

  function getFases() {
    if (form.vagas === 16) return ['oitavas', 'quartas', 'semifinal', 'final']
    if (form.vagas === 8) return ['quartas', 'semifinal', 'final']
    return ['semifinal', 'final']
  }

  function getMatchesPorFase(fase: string) {
    if (fase === 'oitavas') return 8
    if (fase === 'quartas') return 4
    if (fase === 'semifinal') return 2
    return 1
  }

  function getPlacaresValidos() {
    if (form.rounds === 3) return ['2x0', '2x1']
    return ['3x0', '3x1', '3x2']
  }

  function isLavada(p: string) { return p === '2x0' || p === '3x0' }

  function getPontosLoser(fase: string) {
    if (form.vagas === 16) {
      if (fase === 'oitavas') return 0
      if (fase === 'quartas') return 1
      if (fase === 'semifinal') return 3
      if (fase === 'final') return 5
    }
    if (form.vagas === 8) {
      if (fase === 'quartas') return 0
      if (fase === 'semifinal') return 1
      if (fase === 'final') return 3
    }
    if (fase === 'semifinal') return 0
    if (fase === 'final') return 1
    return 0
  }

  function getPontosWinner() {
    if (form.vagas === 16) return 7
    if (form.vagas === 8) return 5
    return 3
  }

  async function criarNoite() {
    if (!form.batalha_id || !form.data) { setErro('Preencha todos os campos.'); return }
    setErro('')
    const { data, error } = await supabase.from('noites').insert({
      batalha_id: form.batalha_id, data: form.data,
      formato: form.formato, vagas: form.vagas, rounds: form.rounds,
    }).select().single()
    if (error) { setErro('Erro ao criar noite: ' + error.message); return }
    if (data) { setNoiteId(data.id); setFaseAtual(getFases()[0]); setEtapa('confrontos') }
  }

  async function cancelarNoite() {
    if (!noiteId) return
    if (!confirm('Tem certeza? Isso vai apagar todos os confrontos e pontos desta noite.')) return
    await supabase.from('pontuacoes').delete().eq('noite_id', noiteId)
    await supabase.from('confrontos').delete().eq('noite_id', noiteId)
    await supabase.from('noites').delete().eq('id', noiteId)
    setConfrontos([]); setNoiteId(null); setFaseAtual(''); setEtapa('config')
    resetCampos()
  }

  async function desfazerUltimo() {
    if (confrontos.length === 0) return
    const ultimo = confrontos[confrontos.length - 1]
    await supabase.from('pontuacoes').delete().eq('confronto_id', ultimo.confronto_id)
    await supabase.from('confrontos').delete().eq('id', ultimo.confronto_id)
    setConfrontos(confrontos.slice(0, -1))
    setFaseAtual(ultimo.fase)
    resetCampos()
  }

  function resetCampos() {
    const n = numMcs
    setTimeA(Array(n).fill(null)); setTimeB(Array(n).fill(null))
    setSearchA(Array(n).fill('')); setSearchB(Array(n).fill(''))
    setPlacar(''); setVencedor('')
  }

  async function criarMcNoBanco(nome: string) {
    const { data, error } = await supabase.from('mcs').insert({
      nome_completo: nome, nome_artistico: nome, data_nascimento: '1990-01-01',
      cidade: 'São Paulo', estado: 'SP', whatsapp: '',
      email: nome.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '') + Date.now() + '@ligacentral.com',
      aceite_termos: false,
    }).select().single()
    if (error) { setErro('Erro ao criar MC: ' + error.message); return null }
    setMcs(prev => [...prev, data])
    return data
  }

  async function salvarConfronto() {
    const timeACompleto = timeA.every(m => m !== null)
    const timeBCompleto = timeB.every(m => m !== null)
    if (!timeACompleto || !timeBCompleto || !placar || !vencedor) {
      setErro('Preencha todos os campos do confronto.'); return
    }
    setSalvando(true); setErro('')

    const vencedoresMcs = vencedor === 'a' ? timeA : timeB
    const perdedoresMcs = vencedor === 'a' ? timeB : timeA
    const lavada = isLavada(placar)
    const isFinal = faseAtual === 'final'

    const confrontoData: any = {
      noite_id: noiteId, fase: faseAtual, placar,
      rounds: form.rounds, lavada,
      mc_a_id: timeA[0]?.id, mc_b_id: timeB[0]?.id,
      vencedor_id: vencedoresMcs[0]?.id,
    }
    if (timeA[1]) confrontoData.mc_a2_id = timeA[1].id
    if (timeA[2]) confrontoData.mc_a3_id = timeA[2].id
    if (timeA[3]) confrontoData.mc_a4_id = timeA[3].id
    if (timeB[1]) confrontoData.mc_b2_id = timeB[1].id
    if (timeB[2]) confrontoData.mc_b3_id = timeB[2].id
    if (timeB[3]) confrontoData.mc_b4_id = timeB[3].id
    if (vencedoresMcs[1]) confrontoData.vencedor2_id = vencedoresMcs[1].id
    if (vencedoresMcs[2]) confrontoData.vencedor3_id = vencedoresMcs[2].id
    if (vencedoresMcs[3]) confrontoData.vencedor4_id = vencedoresMcs[3].id

    const { data: conf, error: confError } = await supabase.from('confrontos').insert(confrontoData).select().single()
    if (confError) { setErro('Erro ao salvar confronto: ' + confError.message); setSalvando(false); return }

    if (conf) {
      const pontuacoesParaInserir: any[] = []
      const ptsPerdedor = getPontosLoser(faseAtual)

      // Pontos para perdedores
      if (ptsPerdedor > 0) {
        perdedoresMcs.forEach((mc: any) => {
          if (mc) pontuacoesParaInserir.push({
            mc_id: mc.id, confronto_id: conf.id, noite_id: noiteId,
            batalha_id: form.batalha_id, pontos: ptsPerdedor, bonus_lavada: false,
          })
        })
      }

      // Pontos para vencedores
      if (isFinal) {
        const ptsVencedor = getPontosWinner() + (lavada ? 1 : 0)
        vencedoresMcs.forEach((mc: any) => {
          if (mc) pontuacoesParaInserir.push({
            mc_id: mc.id, confronto_id: conf.id, noite_id: noiteId,
            batalha_id: form.batalha_id, pontos: ptsVencedor, bonus_lavada: lavada,
          })
        })
      } else if (lavada) {
        vencedoresMcs.forEach((mc: any) => {
          if (mc) pontuacoesParaInserir.push({
            mc_id: mc.id, confronto_id: conf.id, noite_id: noiteId,
            batalha_id: form.batalha_id, pontos: 1, bonus_lavada: true,
          })
        })
      }

      if (pontuacoesParaInserir.length > 0) {
        const { error: ptsError } = await supabase.from('pontuacoes').insert(pontuacoesParaInserir)
        if (ptsError) { setErro('Erro ao salvar pontuacoes: ' + ptsError.message); setSalvando(false); return }
      }

      const novoConfronto = {
        confronto_id: conf.id, fase: faseAtual,
        timeA: [...timeA], timeB: [...timeB], placar,
        vencedores: vencedoresMcs, perdedores: perdedoresMcs,
        ptsPerdedor, ptsVencedor: isFinal ? getPontosWinner() + (lavada ? 1 : 0) : (lavada ? 1 : 0),
        lavada
      }

      const novosConfrontos = [...confrontos, novoConfronto]
      setConfrontos(novosConfrontos)

      const fases = getFases()
      const confrontosDaFase = novosConfrontos.filter(c => c.fase === faseAtual)
      const totalFase = getMatchesPorFase(faseAtual)

      if (confrontosDaFase.length >= totalFase) {
        const proxIdx = fases.indexOf(faseAtual) + 1
        if (proxIdx < fases.length) setFaseAtual(fases[proxIdx])
        else { setSucesso('Batalha encerrada! Todos os confrontos foram registrados.'); setEtapa('config') }
      }

      resetCampos()
    }
    setSalvando(false)
  }

  function getMcsFiltrados(search: string, excluir: any[]) {
    return mcs.filter(m =>
      m.nome_artistico.toLowerCase().includes(search.toLowerCase()) &&
      !excluir.filter(Boolean).some((e: any) => e.id === m.id)
    )
  }

  function renderBuscaMc(lado: 'a' | 'b', idx: number) {
    const time = lado === 'a' ? timeA : timeB
    const setTime = lado === 'a' ? setTimeA : setTimeB
    const searches = lado === 'a' ? searchA : searchB
    const setSearches = lado === 'a' ? setSearchA : setSearchB
    const mc = time[idx]
    const search = searches[idx]
    const excluir = [...timeA, ...timeB].filter(Boolean)

    return (
      <div key={idx}>
        <label className="text-xs text-zinc-500 block mb-1">MC {lado.toUpperCase()}{numMcs > 1 ? (idx + 1) : ''}</label>
        <input
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-600 text-sm"
          placeholder="Buscar MC..."
          value={search}
          onChange={e => {
            const newS = [...searches]; newS[idx] = e.target.value
            lado === 'a' ? setSearchA(newS) : setSearchB(newS)
            const newT = [...time]; newT[idx] = null
            setTime(newT)
          }}
        />
        {search && !mc && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg mt-1 max-h-32 overflow-y-auto">
            {getMcsFiltrados(search, excluir).slice(0, 5).map(m => (
              <div key={m.id} onClick={() => {
                const newT = [...time]; newT[idx] = m; setTime(newT)
                const newS = [...searches]; newS[idx] = m.nome_artistico
                lado === 'a' ? setSearchA(newS) : setSearchB(newS)
              }} className="px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm">
                {m.nome_artistico} <span className="text-zinc-500">{m.cidade}</span>
              </div>
            ))}
            {getMcsFiltrados(search, excluir).length === 0 && search.length >= 2 && (
              <div onClick={async () => {
                const novo = await criarMcNoBanco(search)
                if (novo) {
                  const newT = [...time]; newT[idx] = novo; setTime(newT)
                  const newS = [...searches]; newS[idx] = novo.nome_artistico
                  lado === 'a' ? setSearchA(newS) : setSearchB(newS)
                }
              }} className="px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-emerald-400">
                + Criar MC: <strong>{search}</strong>
              </div>
            )}
          </div>
        )}
        {mc && <p className="text-emerald-400 text-xs mt-1">✓ {mc.nome_artistico}</p>}
      </div>
    )
  }

  const faseLabel: any = { oitavas: 'Oitavas de final', quartas: 'Quartas de final', semifinal: 'Semifinal', final: 'Final' }
  const timeACompleto = timeA.every(m => m !== null)
  const timeBCompleto = timeB.every(m => m !== null)

  if (loading) return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <p className="text-zinc-500">Carregando...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-zinc-500 hover:text-white text-sm transition-colors">← voltar</Link>
            <h1 className="text-xl font-bold">Cadastrar confrontos</h1>
          </div>
          {etapa === 'confrontos' && (
            <button onClick={cancelarNoite} className="text-red-400 hover:text-red-300 text-sm transition-colors">Cancelar tudo</button>
          )}
        </div>

        {sucesso && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-emerald-400 text-sm">{sucesso}</div>}
        {erro && <p className="text-red-400 text-sm mb-4">{erro}</p>}

        {etapa === 'config' && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Batalha</label>
              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white" value={form.batalha_id} onChange={e => setForm(f => ({...f, batalha_id: e.target.value}))}>
                <option value="">Selecione a batalha</option>
                {batalhas.map(b => <option key={b.id} value={b.id}>{b.nome} — {b.cidade}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Data da noite</label>
              <input type="date" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white" value={form.data} onChange={e => setForm(f => ({...f, data: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Formato</label>
              <div className="flex gap-2">
                {['1x1','2x2','3x3','4x4'].map(f => (
                  <button key={f} onClick={() => setForm(prev => ({...prev, formato: f}))} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.formato === f ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 text-zinc-400'}`}>{f}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Vagas</label>
              <div className="flex gap-2">
                {[4,8,16].map(v => (
                  <button key={v} onClick={() => setForm(prev => ({...prev, vagas: v}))} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.vagas === v ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 text-zinc-400'}`}>{v}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Rounds</label>
              <div className="flex gap-2">
                {[3,5].map(r => (
                  <button key={r} onClick={() => setForm(prev => ({...prev, rounds: r}))} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.rounds === r ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 text-zinc-400'}`}>{r} rounds</button>
                ))}
              </div>
            </div>
            <button onClick={criarNoite} disabled={!form.batalha_id || !form.data} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold py-3 rounded-lg transition-colors mt-2">
              Começar a cadastrar →
            </button>
          </div>
        )}

        {etapa === 'confrontos' && (
          <div className="flex flex-col gap-4">
            <div className="bg-zinc-900 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-400">{faseLabel[faseAtual]}</span>
              <span className="text-zinc-500 text-xs">{confrontos.filter(c => c.fase === faseAtual).length}/{getMatchesPorFase(faseAtual)} confrontos</span>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-400 font-medium">Lado A</p>
              {Array.from({length: numMcs}).map((_, i) => renderBuscaMc('a', i))}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-400 font-medium">Lado B</p>
              {Array.from({length: numMcs}).map((_, i) => renderBuscaMc('b', i))}
            </div>

            {timeACompleto && timeBCompleto && (
              <>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Placar</label>
                  <div className="flex gap-2">
                    {getPlacaresValidos().map(p => (
                      <button key={p} onClick={() => setPlacar(p)} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${placar === p ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 text-zinc-400'}`}>
                        {p}{isLavada(p) ? ' 🔥' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                {placar && (
                  <div>
                    <label className="text-sm text-zinc-400 block mb-1">Vencedor</label>
                    <div className="flex gap-2">
                      <button onClick={() => setVencedor('a')} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${vencedor === 'a' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 text-zinc-400'}`}>
                        {timeA.filter(Boolean).map((m: any) => m.nome_artistico).join(' & ')}
                      </button>
                      <button onClick={() => setVencedor('b')} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${vencedor === 'b' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 text-zinc-400'}`}>
                        {timeB.filter(Boolean).map((m: any) => m.nome_artistico).join(' & ')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {vencedor && (
              <button onClick={salvarConfronto} disabled={salvando} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black font-semibold py-3 rounded-lg transition-colors">
                {salvando ? 'Salvando...' : 'Confirmar confronto →'}
              </button>
            )}

            {confrontos.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Registrados</p>
                  <button onClick={desfazerUltimo} className="text-amber-400 hover:text-amber-300 text-xs transition-colors">↩ Desfazer último</button>
                </div>
                {confrontos.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 text-sm">
                    <span className="text-zinc-400 text-xs">{faseLabel[c.fase]}</span>
                    <span>
                      <span className="text-emerald-400 font-medium">{c.vencedores.filter(Boolean).map((m: any) => m.nome_artistico).join(' & ')}</span>
                      {' '}def.{' '}
                      {c.perdedores.filter(Boolean).map((m: any) => m.nome_artistico).join(' & ')}
                    </span>
                    <span className="text-zinc-500">{c.placar}{c.lavada ? ' 🔥' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
