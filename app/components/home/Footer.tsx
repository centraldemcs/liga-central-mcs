export default function Footer() {
  return (
    <footer style={{
      padding: '32px 40px',
      borderTop: '1px solid rgba(245,168,0,0.12)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
    }}>
      <p style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: '12px', color: 'rgba(255,255,255,0.28)',
      }}>
        © 2026 <span style={{ color: '#F5A800' }}>Liga Central de MC's</span> · Todos os direitos reservados
      </p>
      <p style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: '12px', color: 'rgba(255,255,255,0.28)',
      }}>
        centraldemcs.com.br
      </p>
    </footer>
  )
}