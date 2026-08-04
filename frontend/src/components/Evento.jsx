import './Evento.css'
import MapaEvento from './MapaEvento'
import { LOCAIS, DATA_CASAMENTO_EXTENSO } from '../config/wedding'

export default function Evento() {
  const scrollToMapa = (e) => {
    e.preventDefault()
    document.getElementById('mapa-casamento')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="cerimonia" className="evento-section">
      <div className="section-header fade-in">
        <span className="section-tag">Onde e quando</span>
        <h2 className="section-title">O <em>Evento</em></h2>
        <div className="ornament-line"></div>
      </div>
      <div className="event-grid fade-in">
        <div className="event-card">
          <span className="event-type">{LOCAIS.cerimonia.tipo}</span>
          <div className="event-name">Igreja Nossa<br/>Senhora da Paz</div>
          <ul className="event-details">
            <li><span className="event-icon">📅</span> {DATA_CASAMENTO_EXTENSO}</li>
            <li><span className="event-icon">🕔</span> {LOCAIS.cerimonia.horario}</li>
            <li><span className="event-icon">📍</span> {LOCAIS.cerimonia.endereco}</li>
            <li><span className="event-icon">👗</span> Traje: Esporte Fino</li>
          </ul>
          <a href="#mapa-casamento" className="map-btn" onClick={scrollToMapa}>Ver no mapa</a>
        </div>
        <div className="event-card">
          <span className="event-type">{LOCAIS.recepcao.tipo}</span>
          <div className="event-name">Espaço<br/>Villa Serena</div>
          <ul className="event-details">
            <li><span className="event-icon">📅</span> {DATA_CASAMENTO_EXTENSO}</li>
            <li><span className="event-icon">🕕</span> {LOCAIS.recepcao.horario}</li>
            <li><span className="event-icon">📍</span> {LOCAIS.recepcao.endereco}</li>
            <li><span className="event-icon">🅿️</span> Estacionamento gratuito disponível</li>
          </ul>
          <a href="#mapa-casamento" className="map-btn" onClick={scrollToMapa}>Ver no mapa</a>
        </div>
      </div>
      <div id="mapa-casamento">
        <MapaEvento locais={[LOCAIS.cerimonia, LOCAIS.recepcao]} />
      </div>
    </section>
  )
}
