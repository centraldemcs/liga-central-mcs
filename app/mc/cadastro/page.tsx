'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default function McCadastro() {
  const supabase = createClient()
  const router = useRouter()
  const [etapa, setEtapa] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome_completo: '', nome_artistico: '', data_nascimento: '',
    cidade: '', estado: 'SP', whatsapp: '', email: '', senha: '', aceite_termos: false,
  })

  function set(field: string, value: any) { setForm(f => ({ ...f, [field]: value })) }

  async function avancar() {
    setErro('')
    if (etapa === 1) {
      if (!form.nome_completo || !form.nome_artistico || !form.data_nascimento) { setErro('Preencha todos os campos.'); return }
      setEtapa(2)
    } else if (etapa === 2) {
      if (!form.cidade || !form.estado || !form.whatsapp) { setErro('Preencha todos os campos.'); return }
      setEtapa(3)
    } else if (etapa === 3) {
      if (!form.email || !form.senha) { setErro('Preencha todos os campos.'); return }
      if (!form.aceite_termos) { setErro('Aceite os termos para continuar.'); return }
      setLoading(true)

      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.senha })
      if (authError) {
        if (authError.message.includes('already registered')) {
          setErro('Este e-mail já está cadastrado. Use a opção Entrar abaixo.')
        } else {
          setErro(authError.message)
        }
        setLoading(false)
        return
      }

      if (authData.user) {
        // PRIMEIRO cria o profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: authData.user.id, tipo: 'mc' })

        if (profileError) { setErro('Erro ao criar perfil: ' + profileError.message); setLoading(false); return }

        // Verifica se já existe MC com esse nome artístico sem profile
        const { data: mcExistente } = await supabase
          .from('mcs')
          .select('id')
          .ilike('nome_artistico', form.nome_artistico.trim())
          .is('profile_id', null)
          .single()

        if (mcExistente) {
          // Linka com MC existente
          const { error: updateError } = await supabase
            .from('mcs')
            .update({
              profile_id: authData.user.id,
              nome_completo: form.nome_completo,
              data_nascimento: form.data_nascimento,
              cidade: form.cidade,
              estado: form.estado,
              whatsapp: form.whatsapp,
              email: form.email,
              aceite_termos: form.aceite_termos,
            })
            .eq('id', mcExistente.id)

          if (updateError) { setErro('Erro ao linkar MC: ' + updateError.message); setLoading(false); return }
        } else {
          // Cria MC novo
          const { error: mcError } = await supabase.from('mcs').insert({
            profile_id: authData.user.id,
            nome_completo: form.nome_completo,
            nome_artistico: form.nome_artistico,
            data_nascimento: form.data_nascimento,
            cidade: form.cidade,
            estado: form.estado,
            whatsapp: form.whatsapp,
            email: form.email,
            aceite_termos: form.aceite_termos,
          })
          if (mcError) { setErro('Erro ao cadastrar MC: ' + mcError.message); setLoading(false); return }
        }

        router.push('/mc/dashboard')
      }
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '14px 16px', color: '#fff', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.45)', marginBottom: '6px', display: 'block' }

  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: 'Barlow, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <Link href="/" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '1px', display: 'block', marginBottom: '32px' }}>
          Voltar
        </Link>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,168,0,0.7)', marginBottom: '6px' }}>Liga Central de MC's</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '42px', textTransform: 'uppercase', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
            Filiar à <span style={{ color: '#F5A800' }}>Liga</span>
          </h1>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Crie seu perfil de MC</p>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ flex: 1, height: '3px', background: n <= etapa ? '#F5A800' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
          ))}
        </div>

        {erro && (
          <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', padding: '12px 16px', marginBottom: '20px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: '#ff6b6b', textTransform: 'uppercase' }}>
            {erro}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {etapa === 1 && (
            <>
              <div>
                <label style={labelStyle}>Nome Completo</label>
                <input style={inputStyle} placeholder="Seu nome completo" value={form.nome_completo} onChange={e => set('nome_completo', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Nome Artístico</label>
                <input style={inputStyle} placeholder="Como você é conhecido na Liga" value={form.nome_artistico} onChange={e => set('nome_artistico', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Data de Nascimento</label>
                <input type="date" style={inputStyle} value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} />
              </div>
            </>
          )}

          {etapa === 2 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Cidade</label>
                  <input style={inputStyle} placeholder="Sua cidade" value={form.cidade} onChange={e => set('cidade', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.estado} onChange={e => set('estado', e.target.value)}>
                    {ESTADOS.map(uf => <option key={uf} value={uf} style={{ background: '#222' }}>{uf}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <input style={inputStyle} placeholder="(11) 99999-9999" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
              </div>
            </>
          )}

          {etapa === 3 && (
            <>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input type="email" style={inputStyle} placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Senha</label>
                <input type="password" style={inputStyle} placeholder="Mínimo 6 caracteres" value={form.senha} onChange={e => set('senha', e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.aceite_termos} onChange={e => set('aceite_termos', e.target.checked)} style={{ marginTop: '3px', accentColor: '#F5A800', width: '16px', height: '16px', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', lineHeight: 1.4 }}>
                  Aceito os termos da Liga Central de MC's e autorizo o uso dos meus dados para fins de ranking e premiação.
                </span>
              </label>
            </>
          )}

          <button
            onClick={avancar}
            disabled={loading}
            style={{ background: '#F5A800', color: '#111', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '16px', textTransform: 'uppercase', padding: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)', letterSpacing: '1px' }}
          >
            {loading ? 'Criando conta...' : etapa === 3 ? 'Criar conta na Liga' : 'Continuar →'}
          </button>

          {etapa > 1 && (
            <button onClick={() => setEtapa(e => e - 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '1px' }}>
              Voltar
            </button>
          )}
        </div>

        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', textAlign: 'center', marginTop: '24px' }}>
          Já tem conta?{' '}
          <Link href="/mc/login" style={{ color: '#F5A800', textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>
    </main>
  )
}
