'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default function CadastroMC() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    nome_completo: '',
    nome_artistico: '',
    data_nascimento: '',
    whatsapp: '',
    email: '',
    senha: '',
    cidade: '',
    estado: '',
    spotify_url: '',
    sem_spotify: false,
    aceite_termos: false,
    opt_in_email: false,
    opt_in_whatsapp: false,
  })

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.aceite_termos) {
      setErro('Você precisa aceitar os termos para continuar.')
      return
    }
    setLoading(true)
    setErro('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    })

    if (signUpError || !data.user) {
      setErro(signUpError?.message || 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, tipo: 'mc' })

    if (profileError) {
      setErro('Erro ao criar perfil.')
      setLoading(false)
      return
    }

    // Verifica se já existe MC com esse nome artístico no banco
    const { data: mcExistente } = await supabase
      .from('mcs')
      .select('id, nome_artistico')
      .ilike('nome_artistico', form.nome_artistico.trim())
      .is('profile_id', null)
      .single()

    if (mcExistente) {
      // Vincula o perfil ao MC existente e atualiza os dados
      const { error: updateError } = await supabase
        .from('mcs')
        .update({
          profile_id: data.user.id,
          nome_completo: form.nome_completo,
          data_nascimento: form.data_nascimento,
          whatsapp: form.whatsapp,
          email: form.email,
          cidade: form.cidade,
          estado: form.estado,
          spotify_url: form.sem_spotify ? null : form.spotify_url,
          aceite_termos: form.aceite_termos,
          opt_in_email: form.opt_in_email,
          opt_in_whatsapp: form.opt_in_whatsapp,
        })
        .eq('id', mcExistente.id)

      if (updateError) {
        setErro('Erro ao vincular perfil existente.')
        setLoading(false)
        return
      }
    } else {
      // Cria novo MC do zero
      const { error: mcError } = await supabase
        .from('mcs')
        .insert({
          profile_id: data.user.id,
          nome_completo: form.nome_completo,
          nome_artistico: form.nome_artistico,
          data_nascimento: form.data_nascimento,
          whatsapp: form.whatsapp,
          email: form.email,
          cidade: form.cidade,
          estado: form.estado,
          spotify_url: form.sem_spotify ? null : form.spotify_url,
          aceite_termos: form.aceite_termos,
          opt_in_email: form.opt_in_email,
          opt_in_whatsapp: form.opt_in_whatsapp,
        })

      if (mcError) {
        setErro('Erro ao salvar dados do MC.')
        setLoading(false)
        return
      }
    }

    router.push('/mc/dashboard')
  }

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/mc/login" className="text-zinc-500 hover:text-white text-sm mb-8 block transition-colors">
          ← voltar
        </Link>

        <h1 className="text-2xl font-bold mb-1">Filiar à Liga</h1>
        <p className="text-zinc-400 text-sm mb-8">Crie seu perfil de MC</p>

        <div className="flex gap-2 mb-8">
          {[1,2].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${step >= n ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Nome completo</label>
              <input className={inputClass} value={form.nome_completo} onChange={e => set('nome_completo', e.target.value)} placeholder="Seu nome completo" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Nome artístico</label>
              <input className={inputClass} value={form.nome_artistico} onChange={e => set('nome_artistico', e.target.value)} placeholder="Como você é conhecido na Liga" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Data de nascimento</label>
              <input type="date" className={inputClass} value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Cidade</label>
                <input className={inputClass} value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Sua cidade" />
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
              <label className="text-sm text-zinc-400 block mb-1">WhatsApp</label>
              <input className={inputClass} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">E-mail</label>
              <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Senha</label>
              <input type="password" className={inputClass} value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="mínimo 6 caracteres" />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.nome_completo || !form.nome_artistico || !form.email || !form.senha || !form.cidade || !form.estado}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Perfil no Spotify</label>
              <input
                className={inputClass}
                value={form.spotify_url}
                onChange={e => set('spotify_url', e.target.value)}
                placeholder="https://open.spotify.com/artist/..."
                disabled={form.sem_spotify}
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.sem_spotify} onChange={e => set('sem_spotify', e.target.checked)} className="accent-emerald-500" />
                <span className="text-sm text-zinc-400">Ainda não tenho perfil no Spotify</span>
              </label>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.aceite_termos} onChange={e => set('aceite_termos', e.target.checked)} className="accent-emerald-500 mt-0.5" />
                <span className="text-sm text-zinc-400">Li e aceito os <span className="text-emerald-400">Termos de Filiação</span> da Liga Central de MC's</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.opt_in_email} onChange={e => set('opt_in_email', e.target.checked)} className="accent-emerald-500 mt-0.5" />
                <span className="text-sm text-zinc-400">Quero receber novidades da Liga por e-mail</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.opt_in_whatsapp} onChange={e => set('opt_in_whatsapp', e.target.checked)} className="accent-emerald-500 mt-0.5" />
                <span className="text-sm text-zinc-400">Quero receber comunicados via WhatsApp</span>
              </label>
            </div>

            {erro && <p className="text-red-400 text-sm">{erro}</p>}

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="flex-1 border border-zinc-700 text-zinc-400 font-semibold py-3 rounded-lg hover:bg-zinc-900 transition-colors">
                ← Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.aceite_termos}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Salvando...' : 'Filiar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
