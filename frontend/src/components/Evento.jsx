import './Evento.css'

export default function Evento() {
  return (
    <section id="cerimonia" className="evento-section">
      <div className="section-header fade-in">
        <span className="section-tag">Onde e quando</span>
        <h2 className="section-title">O <em>Evento</em></h2>
        <div className="ornament-line"></div>
      </div>
      <div className="event-grid fade-in">
        <div className="event-card">
          <span className="event-type">Cerimônia</span>
          <div className="event-name">Igreja Nossa<br/>Senhora da Paz</div>
          <ul className="event-details">
            <li><span className="event-icon">📅</span> Sábado, 14 de Junho de 2025</li>
            <li><span className="event-icon">🕔</span> 16h00 — Chegar com 15 min de antecedência</li>
            <li><span className="event-icon">📍</span> Rua das Flores, 482 — Jardins, São Paulo</li>
            <li><span className="event-icon">👗</span> Traje: Esporte Fino</li>
          </ul>
          <a href="#" className="map-btn">Ver no mapa</a>
        </div>
        <div className="event-card">
          <span className="event-type">Recepção</span>
          <div className="event-name">Espaço<br/>Villa Serena</div>
          <ul className="event-details">
            <li><span className="event-icon">📅</span> Sábado, 14 de Junho de 2025</li>
            <li><span className="event-icon">🕕</span> 18h30 — Jantar às 20h</li>
            <li><span className="event-icon">📍</span> Alameda dos Ipês, 120 — Morumbi, SP</li>
            <li><span className="event-icon">🅿️</span> Estacionamento gratuito disponível</li>
          </ul>
          <a href="#" className="map-btn">Ver no mapa</a>
        </div>
      </div>
    </section>
  )
}
