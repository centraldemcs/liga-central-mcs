'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const MapaMcsLeaflet = dynamic(() => import('../components/MapaMcsLeaflet'), { ssr: false })
const cidades: Record<string, [number, number]> = {
  'sao paulo': [-23.5505, -46.6333],
  'são paulo': [-23.5505, -46.6333],
  'rio de janeiro': [-22.9068, -43.1729],
  'belo horizonte': [-19.9191, -43.9386],
  'salvador': [-12.9714, -38.5014],
  'fortaleza': [-3.7172, -38.5433],
  'curitiba': [-25.4284, -49.2733],
  'manaus': [-3.1190, -60.0217],
  'recife': [-8.0476, -34.8770],
  'porto alegre': [-30.0346, -51.2177],
  'belém': [-1.4558, -48.5044],
  'goiânia': [-16.6869, -49.2648],
  'campinas': [-22.9099, -47.0626],
  'vitória': [-20.3222, -40.3381],
  'florianópolis': [-27.5954, -48.5480],
  'cuiabá': [-15.5989, -56.0949],
  'campo grande': [-20.4697, -54.6201],
  'natal': [-5.7945, -35.2110],
  'joão pessoa': [-7.1195, -34.8450],
  'maceió': [-9.6658, -35.7350],
  'aracaju': [-10.9472, -37.0731],
  'teresina': [-5.0892, -42.8019],
  'são luís': [-2.5297, -44.3028],
}
function getCoords(cidade: string) {
  const c = cidades[cidade.toLowerCase().trim()]
  return c ? { lat: c[0], lng: c[1] } : null
}
export default function MapaMcsPage() {
  const [mcs, setMcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('ranking_geral').select('id, nome_artistico, total_pontos, total_lavadas, cidade, estado')
      const lista = (data || []).map((mc: any) => {
        const c = getCoords(mc.cidade)
        return c ? { ...mc, lat: c.lat, lng: c.lng } : null
      }).filter(Boolean)
      setMcs(lista)
      setLoading(false)
    }
    load()
  }, [])
  function toggleSelect(mc: any) { setSelected(selected && selected.id === mc.id ? null : mc) }
  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: 'Barlow, sans-serif' }}>
      <div style={{ borderBottom: '1px solid rgba(245,168,0,0.2)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Liga Central de MCs</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '42px', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>MCs <span style={{ color: '#F5A800' }}>no Brasil</span></h1>
        </div>
        <Link href="/mcs" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none', letterSpacing: '1px', borderBottom: '1px solid rgba(245,168,0,0.4)', paddingBottom: '2px' }}>MCs</Link>
      </div>
      <div style={{ display: 'flex', height: 'calc(100vh - 100px)', minHeight: '500px' }}>
        <div style={{ flex: 1.4, minWidth: 0 }}>
          {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><p style={{ color: 'rgba(255,255,255,0.3)' }}>Carregando...</p></div> : <MapaMcsLeaflet mcs={mcs} selected={selected} onSelect={toggleSelect} />}
        </div>
        <div style={{ width: '1px', background: 'rgba(245,168,0,0.15)' }} />
        <div style={{ width: '320px', overflowY: 'auto', padding: '24px' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '22px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '10px' }}><span style={{ color: '#F5A800' }}>{mcs.length}</span> MCs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mcs.map((mc: any, i: number) => {
              const slug = mc.nome_artistico.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
              return (
                <div key={mc.id} onClick={() => toggleSelect(mc)} style={{ padding: '12px 16px', cursor: 'pointer', background: selected && selected.id === mc.id ? 'rgba(245,168,0,0.12)' : 'rgba(255,255,255,0.035)', border: selected && selected.id === mc.id ? '1px solid rgba(245,168,0,0.4)' : '1px solid rgba(255,255,255,0.06)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '16px', textTransform: 'uppercase', color: selected && selected.id === mc.id ? '#F5A800' : '#fff', marginBottom: '2px' }}>{i === 0 ? '👑 ' : ''}{mc.nome_artistico}</p>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '14px', color: '#F5A800', flexShrink: 0, marginLeft: '8px' }}>{mc.total_pontos} pts</span>
                  </div>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{mc.cidade} - {mc.estado}</p>
                  {selected && selected.id === mc.id && (
                    <a href={'/mcs/' + slug} style={{ display: 'inline-block', marginTop: '10px', background: '#F5A800', color: '#111', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '12px', textTransform: 'uppercase', padding: '6px 14px', textDecoration: 'none', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>Ver Perfil</a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
