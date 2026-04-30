'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const DIAS = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo']
const DISTRIBUIDORAS = ['Audiolink','MusicPro','Outra']

export default function BatalhasCadastro() {
  const supabase = createClient()
  const router = useRouter()
  const [etapa, setEtapa] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [outraDistribuidora, setOutraDistribuidora] = useState('')
  const [form, setForm] = useState({
    nome: '', cidade: '', estado: 'SP', endereco: '',
    dias_semana: '', horario: '', instagram: '',
    distribuidora: '', spotify_url: '', sem_spotify: false,
    responsavel_nome: '', responsavel_email: '', responsavel_telefone: '',
    responsavel_cpf: '', responsavel_nascimento: '', senha: '',
  })

  function set(field: string, value: any) { setForm(f => ({ ...f, [field]: value })) }

  function getDistribuidoraFinal() {
    return form.distribuidora === 'Outra' ? outraDistribuidora : form.distribuidora
  }

  async function avancar() {
    setErro('')
    if (etapa === 1) {
      if (!form.nome || !form.cidade || !form.estado) { setErro('Preencha todos os campos obrigatórios.'); return }
      setEtapa(2)
    } else if (etapa === 2) {
      if (!form.distribuidora) { setErro('Selecione a distribuidora.'); return }
      if (form.distribuidora === 'Outra' && !outraDistribuidora) { setErro('Informe o nome da distribuidora.'); return }
      if (!form.sem_spotify && !form.spotify_url) { setErro('Informe o perfil no Spotify ou marque que não tem.'); return }
      setEtapa(3)
    } else if (etapa === 3) {
      if (!form.responsavel_nome || !form.responsavel_email || !form.responsavel_telefone || !form.responsavel_cpf || !form.responsavel_nascimento) {
        setErro('Preencha todos os campos do responsável.'); return
      }
      if (!form.senha) { setErro('Defina uma senha.'); return }
      setLoading(true)
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.responsavel_email, password: form.senha })
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
        const slug = form.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
        const { error: batError } = await supabase.from('batalhas').insert({
          nome: form.nome,
          slug,
          cidade: form.cidade,
          estado: form.estado,
          endereco: form.endereco,
          dias_semana: form.dias_semana,
          horario: form.horario,
          instagram: form.instagram,
          distribuidora: getDistribuidoraFinal(),
          spotify_url: form.sem_spotify ? null : form.spotify_url,
          responsavel_nome: form.responsavel_nome,
          responsavel_email: form.responsavel_email,
          responsavel_telefone: form.responsavel_telefone,
          responsavel_cpf: form.responsavel_cpf,
          responsavel_nascimento: form.responsavel_nascimento,
          status: 'pendente',
          organizador_id: authData.user.id,
        })
        if (batError) { setErro(batError.message); setLoading(false); return }
        await supabase.from('profiles').upsert({ id: authData.user.id, tipo: 'organizador' })
        router.push('/batalha/dashboard')
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
            Filiar <span style={{ color: '#F5A800' }}>Batalha</span>
          </h1>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Cadastre sua batalha na Liga</p>
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
                <label style={labelStyle}>Nome da Batalha *</label>
                <input style={inputStyle} placeholder="Ex: Batalha do Carrão" value={form.nome} onChange={e => set('nome', e.target.value)} />
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', textTransform: 'uppercase' }}>Digite exatamente como aparece no ranking da Liga</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Cidade *</label>
                  <input style={inputStyle} placeholder="Cidade" value={form.cidade} onChange={e => set('cidade', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Estado *</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.estado} onChange={e => set('estado', e.target.value)}>
                    {ESTADOS.map(uf => <option key={uf} value={uf} style={{ background: '#222' }}>{uf}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Endereço</label>
                <input style={inputStyle} placeholder="Rua, número, bairro" value={form.endereco} onChange={e => set('endereco', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Dia da Semana</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.dias_semana} onChange={e => set('dias_semana', e.target.value)}>
                    <option value="" style={{ background: '#222' }}>Selecione</option>
                    {DIAS.map(d => <option key={d} value={d} style={{ background: '#222' }}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Horário</label>
                  <input style={inputStyle} placeholder="Ex: 19:00" value={form.horario} onChange={e => set('horario', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Instagram</label>
                <input style={inputStyle} placeholder="@suabatalha" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
              </div>
            </>
          )}

          {etapa === 2 && (
            <>
              <div>
                <label style={labelStyle}>Distribuidora *</label>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', textTransform: 'uppercase' }}>Para se filiar à Liga sua batalha precisa ter distribuição ativa em uma das parceiras</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {DISTRIBUIDORAS.map(d => (
                    <button key={d} onClick={() => set('distribuidora', d)} style={{ padding: '12px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer', background: form.distribuidora === d ? 'rgba(245,168,0,0.15)' : 'rgba(255,255,255,0.04)', border: form.distribuidora === d ? '1px solid rgba(245,168,0,0.5)' : '1px solid rgba(255,255,255,0.08)', color: form.distribuidora === d ? '#F5A800' : 'rgba(255,255,255,0.5)', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>
                      {d}
                    </button>
                  ))}
                </div>
                {form.distribuidora === 'Outra' && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={labelStyle}>Qual distribuidora?</label>
                    <input style={inputStyle} placeholder="Nome da distribuidora" value={outraDistribuidora} onChange={e => setOutraDistribuidora(e.target.value)} />
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Perfil no Spotify</label>
                <input style={{ ...inputStyle, opacity: form.sem_spotify ? 0.4 : 1 }} placeholder="https://open.spotify.com/..." value={form.spotify_url} onChange={e => set('spotify_url', e.target.value)} disabled={form.sem_spotify} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px' }}>
                  <input type="checkbox" checked={form.sem_spotify} onChange={e => set('sem_spotify', e.target.checked)} style={{ accentColor: '#F5A800', width: '16px', height: '16px' }} />
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Ainda não temos perfil no Spotify</span>
                </label>
              </div>
            </>
          )}

          {etapa === 3 && (
            <>
              <div style={{ background: 'rgba(245,168,0,0.08)', border: '1px solid rgba(245,168,0,0.2)', padding: '16px', marginBottom: '4px' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '16px', textTransform: 'uppercase', color: '#F5A800', marginBottom: '4px' }}>Dados do Responsável</p>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Pessoa responsável pela batalha na Liga.</p>
              </div>
              <div>
                <label style={labelStyle}>Nome Completo *</label>
                <input style={inputStyle} placeholder="Nome do responsável" value={form.responsavel_nome} onChange={e => set('responsavel_nome', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>CPF *</label>
                  <input style={inputStyle} placeholder="000.000.000-00" value={form.responsavel_cpf} onChange={e => set('responsavel_cpf', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Nascimento *</label>
                  <input type="date" style={inputStyle} value={form.responsavel_nascimento} onChange={e => set('responsavel_nascimento', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Telefone *</label>
                <input style={inputStyle} placeholder="(11) 99999-9999" value={form.responsavel_telefone} onChange={e => set('responsavel_telefone', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>E-mail *</label>
                <input type="email" style={inputStyle} placeholder="seu@email.com" value={form.responsavel_email} onChange={e => set('responsavel_email', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Senha *</label>
                <input type="password" style={inputStyle} placeholder="Mínimo 6 caracteres" value={form.senha} onChange={e => set('senha', e.target.value)} />
              </div>
            </>
          )}

          <button
            onClick={avancar}
            disabled={loading}
            style={{ background: '#F5A800', color: '#111', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '16px', textTransform: 'uppercase', padding: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)', letterSpacing: '1px' }}
          >
            {loading ? 'Enviando...' : etapa === 3 ? 'Enviar para aprovação' : 'Continuar →'}
          </button>

          {etapa > 1 && (
            <button onClick={() => setEtapa(e => e - 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '1px' }}>
              Voltar
            </button>
          )}
        </div>

        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', textAlign: 'center', marginTop: '24px' }}>
          Já tem conta?{' '}
          <Link href="/batalha/login" style={{ color: '#F5A800', textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>
    </main>
  )
}
