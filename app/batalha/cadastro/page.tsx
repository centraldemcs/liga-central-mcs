'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default function CadastroBatalha() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    nome: '',
    cidade: '',
    estado: '',
    distribuidora: '',
    spotify_url: '',
    sem_spotify: false,
    resp_nome: '',
    resp_email: '',
    resp_senha: '',
    resp_telefone: '',
    resp_cpf: '',
    resp_nascimento: '',
  })

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setErro('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.resp_email,
      password: form.resp_senha,
    })

    if (signUpError || !data.user) {
      setErro(signUpError?.message || 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, tipo: 'organizador' })

    if (profileError) {
      setErro('Erro ao criar perfil.')
      setLoading(false)
      return
    }

    const { error: batalhaError } = await supabase
      .from('batalhas')
      .insert({
        profile_id: data.user.id,
        nome: form.nome,
        cidade: form.cidade,
        estado: form.estado,
        distribuidora: form.distribuidora,
        spotify_url: form.sem_spotify ? null : form.spotify_url,
        responsavel_nome: form.resp_nome,
        responsavel_email: form.resp_email,
        responsavel_telefone: form.resp_telefone,
        responsavel_cpf: form.resp_cpf,
        responsavel_nascimento: form.resp_nascimento,
        status: 'pendente',
      })

    if (batalhaError) {
      setErro('Erro ao salvar dados da batalha.')
      setLoading(false)
      return
    }

    router.push('/batalha/dashboard')
  }

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/batalha/login" className="text-zinc-500 hover:text-white text-sm mb-8 block transition-colors">
          ← voltar
        </Link>

        <h1 className="text-2xl font-bold mb-1">Cadastrar batalha</h1>
        <p className="text-zinc-400 text-sm mb-8">Filie sua batalha à Liga Central</p>

        <div className="flex gap-2 mb-8">
          {[1,2].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${step >= n ? 'bg-blue-500' : 'bg-zinc-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Nome da batalha</label>
              <input className={inputClass} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Liga do Povo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Cidade</label>
                <input className={inputClass} value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Cidade" />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Estado</label>
                <select className={inputClass} value={form.estado} onChange={e => set('estado', e.target.value)}>
                  <option value="">UF</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Distribuidora</label>
              <div className="flex gap-3">
                {['audiolink','musicpro'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set('distribuidora', d)}
                    className={`flex-1 py-3 rounded-lg border font-medium text-sm transition-colors ${form.distribuidora === d ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                  >
                    {d === 'audiolink' ? 'Audiolink' : 'MusicPro'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Perfil no Spotify</label>
              <input className={inputClass} value={form.spotify_url} onChange={e => set('spotify_url', e.target.value)} placeholder="https://open.spotify.com/..." disabled={form.sem_spotify} />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.sem_spotify} onChange={e => set('sem_spotify', e.target.checked)} className="accent-blue-500" />
                <span className="text-sm text-zinc-400">Ainda não temos perfil no Spotify</span>
              </label>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.nome || !form.cidade || !form.estado || !form.distribuidora}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Nome do responsável</label>
              <input className={inputClass} value={form.resp_nome} onChange={e => set('resp_nome', e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">CPF</label>
              <input className={inputClass} value={form.resp_cpf} onChange={e => set('resp_cpf', e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Data de nascimento</label>
              <input type="date" className={inputClass} value={form.resp_nascimento} onChange={e => set('resp_nascimento', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Telefone</label>
              <input className={inputClass} value={form.resp_telefone} onChange={e => set('resp_telefone', e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">E-mail</label>
              <input type="email" className={inputClass} value={form.resp_email} onChange={e => set('resp_email', e.target.value)} placeholder="contato@batalha.com" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Senha</label>
              <input type="password" className={inputClass} value={form.resp_senha} onChange={e => set('resp_senha', e.target.value)} placeholder="mínimo 6 caracteres" />
            </div>

            {erro && <p className="text-red-400 text-sm">{erro}</p>}

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="flex-1 border border-zinc-700 text-zinc-400 font-semibold py-3 rounded-lg hover:bg-zinc-900 transition-colors">
                ← Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.resp_nome || !form.resp_email || !form.resp_senha}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
