'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'

// Fix ícone padrão do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Ícone customizado amarelo
const yellowIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#F5A800" stroke="#111" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#111"/>
    </svg>
  `),
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
})

interface Batalha {
  id: string
  nome: string
  cidade: string
  estado: string
  slug: string
  lat: number
  lng: number
}

export default function MapaLeaflet({ batalhas }: { batalhas: Batalha[] }) {
  return (
    <>
      <style>{`
        .leaflet-container {
          background: #1a1a1a !important;
          border-radius: 8px;
          border: 1px solid rgba(245,168,0,0.2);
        }
        .leaflet-popup-content-wrapper {
          background: #1a1a1a !important;
          border: 1px solid rgba(245,168,0,0.3) !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
          color: white !important;
        }
        .leaflet-popup-tip {
          background: #1a1a1a !important;
        }
        .leaflet-popup-close-button {
          color: rgba(255,255,255,0.5) !important;
        }
      `}</style>
      <MapContainer
        center={[-15.7801, -47.9292]}
        zoom={4}
        style={{ height: '560px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {batalhas.map((b) => (
          <Marker key={b.id} position={[b.lat, b.lng]} icon={yellowIcon}>
            <Popup>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", minWidth: '160px' }}>
                <p style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                  {b.cidade} — {b.estado}
                </p>
                <p style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '20px', textTransform: 'uppercase', color: '#fff', marginBottom: '10px', lineHeight: 1 }}>
                  {b.nome}
                </p>
                <a href={`/batalhas/${b.slug}`} style={{ background: '#F5A800', color: '#111', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '12px', textTransform: 'uppercase', padding: '6px 14px', textDecoration: 'none', display: 'inline-block', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>
                  Ver Batalha →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  )
}