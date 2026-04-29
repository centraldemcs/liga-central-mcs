'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RankingPage() {
  const [aba, setAba] = useState<'anual' | 'semanal'>('semanal')
  const [rankingAnual, setRankingAnual] = useState<any[]>([])
  const [rankingSemanal, setRankingSemanal] = useState<any[]>([])
  const [semanaAtual, setSemanaAtual] = useState(2)
  const [semanaVendo, setSemanaVendo] = useState(2)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: anual } = await supabase
        .from('ranking_geral')
        .select('id, nome_artistico, total_pontos, total_lavadas, total_noites, total_titulos')

      setRankingAnual(anual || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    async function loadSemanal() {
      const supabase = createClient()
      const { data } = await supabase
        .from('ranking_semanal_view')
        .select('id, nome_artistico, total_pontos, total_lavadas')
        .eq('semana', semanaVendo)
        .order('total_pontos', { ascending: false })
        .order('total_lavadas', { ascending: false })

      setRankingSemanal(data || [])
    }
    loadSemanal()
  }, [semanaVendo])

  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>

      {/* HEADER */}
      <div style={{ borderBottom: '1px solid rgba(245,168,0,0.2)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Liga Central de MC's</p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '42px', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
            Ranking <span style={{ color: '#F5A800' }}>{aba === 'semanal' ? 'Semanal' : 'Anual'}</span>
          </h1>
        </div>
        <Link href="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none', letterSpacing: '1px', borderBottom: '1px solid rgba(245,168,0,0.4)', paddingBottom: '2px' }}>
          ← Início
        </Link>
      </div>

      {/* ABAS */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setAba('semanal')}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '16px', textTransform: 'uppercase', padding: '16px 32px', background: 'none', border: 'none', cursor: 'pointer', color: aba === 'semanal' ? '#F5A800' : 'rgba(255,255,255,0.4)', borderBottom: aba === 'semanal' ? '2px solid #F5A800' : '2px solid transparent', letterSpacing: '0.5px' }}
        >
          Semanal
        </button>
        <button
          onClick={() => setAba('anual')}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '16px', textTransform: 'uppercase', padding: '16px 32px', background: 'none', border: 'none', cursor: 'pointer', color: aba === 'anual' ? '#F5A800' : 'rgba(255,255,255,0.4)', borderBottom: aba === 'anual' ? '2px solid #F5A800' : '2px solid transparent', letterSpacing: '0.5px' }}
        >
          Anual
        </button>
      </div>

      {/* LEGENDA */}
      <div style={{ padding: '16px 40px', display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F5A800' }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>Líder</span>
          </div>
          {aba === 'anual' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(100,200,100,0.8)' }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>Classificados Copa (top 16)</span>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO SEMANAL */}
        {aba === 'semanal' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSemanaVendo(v => Math.max(1, v - 1))}
              disabled={semanaVendo <= 1}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '14px', background: semanaVendo <= 1 ? 'rgba(255,255,255,0.05)' : 'rgba(245,168,0,0.1)', border: semanaVendo <= 1 ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(245,168,0,0.3)', color: semanaVendo <= 1 ? 'rgba(255,255,255,0.2)' : '#F5A800', padding: '6px 14px', cursor: semanaVendo <= 1 ? 'not-allowed' : 'pointer', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
            >
              ← Anterior
            </button>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '16px', color: '#fff', minWidth: '90px', textAlign: 'center' }}>
              Semana #{semanaVendo}
            </span>
            <button
              onClick={() => setSemanaVendo(v => Math.min(semanaAtual, v + 1))}
              disabled={semanaVendo >= semanaAtual}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '14px', background: semanaVendo >= semanaAtual ? 'rgba(255,255,255,0.05)' : 'rgba(245,168,0,0.1)', border: semanaVendo >= semanaAtual ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(245,168,0,0.3)', color: semanaVendo >= semanaAtual ? 'rgba(255,255,255,0.2)' : '#F5A800', padding: '6px 14px', cursor: semanaVendo >= semanaAtual ? 'not-allowed' : 'pointer', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>

      {/* TABELA */}
      <div style={{ padding: '24px 40px' }}>
        {loading ? (
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textAlign: 'center', padding: '40px' }}>Carregando...</p>
        ) : (
          <>
            {/* Header da tabela */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px', gap: '8px', padding: '8px 18px', marginBottom: '6px' }}>
              {['#', 'MC', aba === 'anual' ? 'B' : '', 'L', 'PTS'].filter(Boolean).map((h, i) => (
                <span key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textAlign: i > 1 ? 'center' : 'left' }}>{h}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(aba === 'anual' ? rankingAnual : rankingSemanal).map((mc, i) => {
                const isLider = i === 0
                const isClassificado = aba === 'anual' && i > 0 && i < 16
                const slug = mc.nome_artistico.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
                return (
                  <Link key={mc.id} href={'/mcs/' + slug} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px', gap: '8px',
                      padding: '14px 18px', alignItems: 'center',
                      background: isLider ? 'rgba(245,168,0,0.1)' : isClassificado ? 'rgba(100,200,100,0.04)' : 'rgba(255,255,255,0.03)',
                      border: isLider ? '1px solid rgba(245,168,0,0.35)' : isClassificado ? '1px solid rgba(100,200,100,0.15)' : '1px solid rgba(255,255,255,0.05)',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                    }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: isLider ? '22px' : '18px', color: isLider ? '#F5A800' : isClassificado ? 'rgba(100,200,100,0.8)' : 'rgba(255,255,255,0.3)' }}>
                        {isLider ? '👑' : (i + 1) + 'º'}
                      </span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '18px', textTransform: 'uppercase', color: '#fff' }}>
                        {mc.nome_artistico}
                      </span>
                      {aba === 'anual' && (
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{mc.total_noites}</span>
                      )}
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '15px', color: mc.total_lavadas > 0 ? '#F5A800' : 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{mc.total_lavadas}</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '18px', color: isLider ? '#F5A800' : isClassificado ? 'rgba(100,200,100,0.9)' : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{mc.total_pontos}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {aba === 'anual' && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                {['B = Batalhas', 'L = Twolalas', 'PTS = Pontos'].map(l => (
                  <span key={l} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px' }}>{l}</span>
                ))}
              </div>
            )}

            {aba === 'semanal' && rankingSemanal.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '16px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Nenhum resultado para esta semana.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}