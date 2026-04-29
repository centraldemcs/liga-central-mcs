'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const MapaLeaflet = dynamic(() => import('../components/MapaLeaflet'), { ssr: false })
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
export default function MapaPage() {
  const [batalhas, setBatalhas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('batalhas').select('id, nome, cidade, estado, slug, status').eq('status', 'aprovada')
      const lista = (data || []).map((b: any) => {
        const c = getCoords(b.cidade)
        return c ? { ...b, lat: c.lat, lng: c.lng } : null
      }).filter(Boolean)
      setBatalhas(lista)
      setLoading(false)
    }
    load()
  }, [])
  function toggleSelect(b: any) { setSelected(selected && selected.id === b.id ? null : b) }
  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: 'Barlow, sans-serif' }}>
      <div style={{ borderBottom: '1px solid rgba(245,168,0,0.2)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Liga Central de MCs</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '42px', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>Batalhas <span style={{ color: '#F5A800' }}>Filiadas</span></h1>
        </div>
        <Link href="/" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none' }}>Inicio</Link>
      </div>
      <div style={{ display: 'flex', height: 'calc(100vh - 100px)', minHeight: '500px' }}>
        <div style={{ flex: 1.4, minWidth: 0 }}>
          {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><p style={{ color: 'rgba(255,255,255,0.3)' }}>Carregando...</p></div> : <MapaLeaflet batalhas={batalhas} selected={selected} onSelect={toggleSelect} />}
        </div>
        <div style={{ width: '1px', background: 'rgba(245,168,0,0.15)' }} />
        <div style={{ width: '320px', overflowY: 'auto', padding: '24px' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '22px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(245,168,0,0.2)', paddingBottom: '10px' }}><span style={{ color: '#F5A800' }}>{batalhas.length}</span> Batalhas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {batalhas.map((b: any) => (
              <div key={b.id} onClick={() => toggleSelect(b)} style={{ padding: '12px 16px', cursor: 'pointer', background: selected && selected.id === b.id ? 'rgba(245,168,0,0.12)' : 'rgba(255,255,255,0.035)', border: selected && selected.id === b.id ? '1px solid rgba(245,168,0,0.4)' : '1px solid rgba(255,255,255,0.06)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '16px', textTransform: 'uppercase', color: selected && selected.id === b.id ? '#F5A800' : '#fff', marginBottom: '2px' }}>{b.nome}</p>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{b.cidade} - {b.estado}</p>
                {selected && selected.id === b.id && (
                  <a href={'/batalhas/' + b.slug} style={{ display: 'inline-block', marginTop: '10px', background: '#F5A800', color: '#111', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '12px', textTransform: 'uppercase', padding: '6px 14px', textDecoration: 'none', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>Ver Batalha</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
