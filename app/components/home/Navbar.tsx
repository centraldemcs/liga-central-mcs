'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Batalha { id: string; titulo: string; slug: string }
interface MC { id: string; nome: string; slug: string }
interface NavbarProps { batalhas?: Batalha[]; mcs?: MC[] }

export default function Navbar({ batalhas = [], mcs = [] }: NavbarProps) {
  const [batalhasOpen, setBatalhasOpen] = useState(false)
  const [mcsOpen, setMcsOpen] = useState(false)
  const [entrarOpen, setEntrarOpen] = useState(false)
  const [inscrevaOpen, setInscrevaOpen] = useState(false)

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 40px', borderBottom: '1px solid rgba(245,168,0,0.2)', background: 'rgba(17,17,17,0.97)', position: 'sticky', top: 0, zIndex: 50 }}>
      
      {/* LOGO */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <svg width="34" height="38" viewBox="0 0 60 68" fill="none">
          <path d="M8 20L8 42L30 56L52 42V20L30 6L8 20Z" fill="none" stroke="#F5A800" strokeWidth="3.5"/>
          <ellipse cx="30" cy="24" rx="10" ry="12" fill="#F5A800"/>
          <rect x="24" y="26" width="12" height="2.5" rx="1.2" fill="#111"/>
          <rect x="24" y="30" width="12" height="2.5" rx="1.2" fill="#111"/>
          <rect x="24" y="34" width="12" height="2.5" rx="1.2" fill="#111"/>
          <rect x="28" y="36" width="4" height="7" fill="#F5A800"/>
          <path d="M20 40 Q20 48 30 48 Q40 48 40 40" fill="none" stroke="#F5A800" strokeWidth="3.2"/>
          <path d="M23 50L19 60H27L30 54L33 60H41L37 50" fill="#F5A800"/>
        </svg>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '16px', lineHeight: '1.1', color: '#fff', textTransform: 'uppercase' }}>
          Liga Central<br /><span style={{ color: '#F5A800' }}>De MC's</span>
        </span>
      </Link>

      {/* LINKS */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: '4px', listStyle: 'none' }}>
        <li>
          <Link href="/ranking" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 14px', display: 'block', letterSpacing: '0.5px' }}>Ranking</Link>
        </li>

        <li style={{ position: 'relative' }} onMouseEnter={() => setBatalhasOpen(true)} onMouseLeave={() => setBatalhasOpen(false)}>
          <button style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.5px' }}>
            Batalhas <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
          </button>
          {batalhasOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '200px', background: '#1a1a1a', border: '1px solid rgba(245,168,0,0.25)', zIndex: 100, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
              {batalhas.length > 0 ? batalhas.map((b) => (
                <Link key={b.id} href={'/batalhas/' + b.slug} style={{ display: 'block', padding: '10px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{b.titulo}</Link>
              )) : (
                <>
                  <Link href="/batalhas/semana-2" style={{ display: 'block', padding: '10px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Batalha Semana #2</Link>
                  <Link href="/batalhas/semana-1" style={{ display: 'block', padding: '10px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Batalha Semana #1</Link>
                </>
              )}
              <Link href="/batalhas" style={{ display: 'block', padding: '10px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none' }}>Ver Todas →</Link>
            </div>
          )}
        </li>

        <li style={{ position: 'relative' }} onMouseEnter={() => setMcsOpen(true)} onMouseLeave={() => setMcsOpen(false)}>
          <button style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.5px' }}>
            MCs <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
          </button>
          {mcsOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '200px', background: '#1a1a1a', border: '1px solid rgba(245,168,0,0.25)', zIndex: 100, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
              <Link href="/mcs" style={{ display: 'block', padding: '10px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Todos os MCs</Link>
              {mcs.slice(0, 4).map((mc) => (
                <Link key={mc.id} href={'/mcs/' + mc.slug} style={{ display: 'block', padding: '10px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{mc.nome}</Link>
              ))}
              <Link href="/mcs" style={{ display: 'block', padding: '10px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none' }}>Ver Todos →</Link>
            </div>
          )}
        </li>

        <li>
          <Link href="/sobre" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 14px', display: 'block', letterSpacing: '0.5px' }}>Sobre</Link>
        </li>
      </ul>

      {/* CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* ENTRAR */}
        <div style={{ position: 'relative' }} onMouseEnter={() => setEntrarOpen(true)} onMouseLeave={() => setEntrarOpen(false)}>
          <button style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'none', cursor: 'pointer', padding: '10px 16px', letterSpacing: '0.5px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '6px', clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
            Entrar <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
          </button>
          {entrarOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, minWidth: '200px', background: '#1a1a1a', border: '1px solid rgba(245,168,0,0.25)', zIndex: 100, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
              <Link href="/mc/login" style={{ display: 'block', padding: '12px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                🎤 Sou MC
              </Link>
              <Link href="/batalha/login" style={{ display: 'block', padding: '12px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                🏆 Sou Organizador
              </Link>
            </div>
          )}
        </div>

        {/* INSCREVA-SE */}
        <div style={{ position: 'relative' }} onMouseEnter={() => setInscrevaOpen(true)} onMouseLeave={() => setInscrevaOpen(false)}>
          <button style={{ background: '#F5A800', color: '#111', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '13px', textTransform: 'uppercase', padding: '10px 22px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
            Inscreva-se <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
          </button>
          {inscrevaOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, minWidth: '200px', background: '#1a1a1a', border: '1px solid rgba(245,168,0,0.25)', zIndex: 100, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
              <Link href="/mc/cadastro" style={{ display: 'block', padding: '12px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                🎤 Sou MC
              </Link>
              <Link href="/batalha/cadastro" style={{ display: 'block', padding: '12px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                🏆 Sou Organizador
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}