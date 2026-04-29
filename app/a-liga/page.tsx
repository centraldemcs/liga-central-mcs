import Link from 'next/link'

export default function ALigaPage() {
  return (
    <main style={{ background: '#111', minHeight: '100vh', fontFamily: 'Barlow, sans-serif' }}>

      <div style={{ borderBottom: '1px solid rgba(245,168,0,0.2)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Liga Central de MC's</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '42px', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
            A <span style={{ color: '#F5A800' }}>Liga</span>
          </h1>
        </div>
        <Link href="/" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#F5A800', textDecoration: 'none', letterSpacing: '1px', borderBottom: '1px solid rgba(245,168,0,0.4)', paddingBottom: '2px' }}>
          Inicio
        </Link>
      </div>

      <div style={{ padding: '60px 40px', maxWidth: '800px', margin: '0 auto' }}>

        {/* O QUE É */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '32px', textTransform: 'uppercase', color: '#F5A800', marginBottom: '20px' }}>
            O Que É
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '16px' }}>
            A Liga Central de MC's é o maior sistema de ranking de batalhas de rima do Brasil. Unimos batalhas filiadas de todo o país em uma única competição, onde cada MC acumula pontos, Twolalas e títulos ao longo da temporada. Para se filiar à liga a batalha precisa estar com a distribuição de royalties ativa em uma das distribuidoras parceiras da Liga.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
            Nosso objetivo é profissionalizar o cenário do freestyle, dar visibilidade aos MCs e criar um ecossistema competitivo justo e transparente para toda a cultura hip-hop brasileira.
          </p>
        </div>

        {/* COMO FUNCIONA */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '32px', textTransform: 'uppercase', color: '#F5A800', marginBottom: '24px' }}>
            Como Funciona
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { num: '01', titulo: 'Batalhas Filiadas', desc: 'Batalhas de todo o Brasil se filiam à Liga e seus resultados passam a contar para o ranking geral.' },
              { num: '02', titulo: 'Pontuação', desc: 'Cada vitória em uma batalha filiada gera pontos para o MC. Twolalas valem bônus especial.' },
              { num: '03', titulo: 'Ranking Semanal', desc: 'Todo domingo o ranking é atualizado e zerado com os resultados da semana.' },
              { num: '04', titulo: 'Ranking Anual', desc: 'Paralelo ao ranking semanal, um ranking geral é contabilizado em paralelo ao longo do ano.' },
              { num: '05', titulo: 'Premiação', desc: 'O MC líder do ranking semanal recebe R$250 toda semana. O MC líder do ranking anual recebe R$10.000 no final do ano.' },
              { num: '06', titulo: 'Copa Central de Freestyle', desc: 'Dia 12/12 faremos em São Paulo um confronto mata-mata entre os 16 mais bem classificados do Brasil com a maior premiação individual das batalhas de rima do Brasil.' },
            ].map((item) => (
              <div key={item.num} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '32px', color: 'rgba(245,168,0,0.3)', lineHeight: 1, marginBottom: '8px' }}>{item.num}</p>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: '#fff', marginBottom: '8px' }}>{item.titulo}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PRESIDENTE */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '32px', textTransform: 'uppercase', color: '#F5A800', marginBottom: '24px' }}>
            Liderança
          </h2>
          <div style={{ background: '#F5A800', padding: '36px 40px', display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', border: '3px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '28px', color: '#111' }}>JT</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '4px' }}>Presidente da Liga</p>
              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '36px', textTransform: 'uppercase', color: '#111', lineHeight: 1, marginBottom: '8px' }}>Jotapê</h3>
              <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', lineHeight: 1.6 }}>Fundador e presidente da Liga Central de MC's, Jotapê lidera o movimento de profissionalização do freestyle no Brasil.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/mc/cadastro" style={{ background: '#F5A800', color: '#111', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '15px', textTransform: 'uppercase', padding: '14px 32px', textDecoration: 'none', clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>
            Quero ser MC
          </Link>
          <Link href="/batalha/cadastro" style={{ background: 'transparent', color: '#F5A800', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '15px', textTransform: 'uppercase', padding: '13px 32px', textDecoration: 'none', border: '1.5px solid rgba(245,168,0,0.4)', clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>
            Filiar minha Batalha
          </Link>
        </div>

      </div>
    </main>
  )
}