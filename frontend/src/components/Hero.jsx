import './Hero.css'

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-bg-pattern"></div>
      <div className="hero-ornament">&amp;</div>
      <div className="hero-content">
        <span className="hero-label">Nos casamos</span>
        <div className="hero-names">
          Maria Clara<span className="amp">&amp;</span>Victor
        </div>
        <div className="hero-divider"></div>
        <p className="hero-date">x de Mês de 2026 · São Paulo</p>
      </div>
    </div>
  )
}
