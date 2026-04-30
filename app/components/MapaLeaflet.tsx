'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
const makeIcon = (selected: boolean) => new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="' + (selected ? '#fff' : '#F5A800') + '" stroke="' + (selected ? '#F5A800' : '#111') + '" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="' + (selected ? '#F5A800' : '#111') + '"/></svg>'),
  iconSize: [selected ? 32 : 24, selected ? 48 : 36],
  iconAnchor: [selected ? 16 : 12, selected ? 48 : 36],
  popupAnchor: [0, selected ? -48 : -36],
})
function FlyTo({ selected }: { selected: any }) {
  const map = useMap()
  useEffect(() => { if (selected) map.flyTo([selected.lat, selected.lng], 10, { duration: 1 }) }, [selected])
  return null
}
interface Batalha { id: string; nome: string; cidade: string; estado: string; slug: string; lat: number; lng: number }
interface Props { batalhas: Batalha[]; selected: any; onSelect: (b: any) => void }
export default function MapaLeaflet({ batalhas, selected, onSelect }: Props) {
  return (
    <>
      <style>{'.leaflet-container{background:#1a1a1a !important;height:100% !important;}.leaflet-popup-content-wrapper{background:#1a1a1a !important;border:1px solid rgba(245,168,0,0.3) !important;border-radius:4px !important;color:white !important;}.leaflet-popup-tip{background:#1a1a1a !important;}'}</style>
      <MapContainer center={[-15.7801, -47.9292]} zoom={4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer attribution='OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <FlyTo selected={selected} />
        {batalhas.map((b) => (
          <Marker key={b.id} position={[b.lat, b.lng]} icon={makeIcon(selected?.id === b.id)} eventHandlers={{ click: () => onSelect(b) }}>
            <Popup>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', minWidth: '160px' }}>
                <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{b.cidade} - {b.estado}</p>
                <p style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '20px', textTransform: 'uppercase', color: '#fff', marginBottom: '10px', lineHeight: 1 }}>{b.nome}</p>
                <a href={'/batalhas/' + b.slug} style={{ background: '#F5A800', color: '#111', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '12px', textTransform: 'uppercase', padding: '6px 14px', textDecoration: 'none', display: 'inline-block', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>Ver Batalha</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  )
}
