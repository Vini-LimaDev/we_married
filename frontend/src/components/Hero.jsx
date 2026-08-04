import './Hero.css'
import { NOIVOS, DATA_CASAMENTO_EXTENSO } from '../config/wedding'

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-bg-pattern"></div>
      <div className="hero-ornament">&amp;</div>
      <div className="hero-content">
        <span className="hero-label">Nos casamos</span>
        <div className="hero-names">
          {NOIVOS.nome1}<span className="amp">&amp;</span>{NOIVOS.nome2}
        </div>
        <div className="hero-divider"></div>
        <p className="hero-date">{DATA_CASAMENTO_EXTENSO} · São Paulo</p>
      </div>
    </div>
  )
}
