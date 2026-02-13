import './Historia.css'

export default function Historia() {
  return (
    <section id="historia" className="historia">
      <div className="section-header fade-in">
        <span className="section-tag">Como começou</span>
        <h2 className="section-title">Nossa <em>História</em></h2>
        <div className="ornament-line"></div>
      </div>
      <div className="story-grid fade-in">
        <div className="story-item">
          <div className="story-year">2019</div>
          <div className="story-event">Primeiro encontro</div>
          <p className="story-text">
            Nos conhecemos num sábado de chuva, numa livraria do centro. Rafael
            "acidentalmente" pegou o mesmo livro que eu estava olhando.
          </p>
        </div>
        <div className="story-item">
          <div className="story-year">2021</div>
          <div className="story-event">O pedido</div>
          <p className="story-text">
            Depois de dois anos e meio, Rafael organizou um jantar surpresa com
            todos os nossos amigos. Sim, chorei muito — e ele também.
          </p>
        </div>
        <div className="story-item">
          <div className="story-year">2025</div>
          <div className="story-event">O grande dia</div>
          <p className="story-text">
            Depois de tanto planejar, finalmente chegou o momento de dizer "sim"
            diante de todos que amamos.
          </p>
        </div>
      </div>
    </section>
  )
}
