import './Hero.css'

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-bg-pattern"></div>
      <div className="hero-ornament">&amp;</div>
      <div className="hero-content">
        <span className="hero-label">Nos casamos</span>
        <div className="hero-names">
          Sofia<span className="amp">&amp;</span>Rafael
        </div>
        <div className="hero-divider"></div>
        <p className="hero-date">14 de Junho de 2025 · São Paulo</p>
      </div>
      <div className="hero-scroll">
        <span>Descer</span>
        <div className="hero-scroll-line"></div>
      </div>
    </div>
  )
}
