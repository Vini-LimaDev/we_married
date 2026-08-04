import { useState, useEffect, useCallback, useRef } from 'react'
import './Galeria.css'

// Placeholders — substitua cada 'src' pelas fotos reais do casal
// (mantenha proporção ~4:5 ou 1:1 para melhor enquadramento)
const FOTOS = [
  { src: 'https://picsum.photos/seed/casal1/900/1100', legenda: 'O primeiro encontro' },
  { src: 'https://picsum.photos/seed/casal2/900/1100', legenda: 'O pedido' },
  { src: 'https://picsum.photos/seed/casal3/900/1100', legenda: 'Ensaio pré-casamento' },
  { src: 'https://picsum.photos/seed/casal4/900/1100', legenda: 'Viagem juntos' },
  { src: 'https://picsum.photos/seed/casal5/900/1100', legenda: 'Em família' },
]

const AUTOPLAY_MS = 5000

export default function Galeria() {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const timerRef = useRef(null)

  const proxima = useCallback(() => {
    setIndice((i) => (i + 1) % FOTOS.length)
  }, [])

  const anterior = useCallback(() => {
    setIndice((i) => (i - 1 + FOTOS.length) % FOTOS.length)
  }, [])

  useEffect(() => {
    if (pausado) return
    timerRef.current = setInterval(proxima, AUTOPLAY_MS)
    return () => clearInterval(timerRef.current)
  }, [pausado, proxima])

  return (
    <section id="galeria" className="galeria-section">
      <div className="section-header fade-in">
        <span className="section-tag">Nossa jornada</span>
        <h2 className="section-title">Galeria de <em>Fotos</em></h2>
        <div className="ornament-line"></div>
      </div>

      <div
        className="carrossel"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        <button className="carrossel-nav prev" onClick={anterior} aria-label="Foto anterior">
          ‹
        </button>

        <div className="carrossel-viewport">
          {FOTOS.map((foto, i) => (
            <div
              key={foto.src}
              className={`carrossel-slide ${i === indice ? 'ativo' : ''}`}
              style={{ backgroundImage: `url(${foto.src})` }}
            >
              <div className="carrossel-legenda">{foto.legenda}</div>
            </div>
          ))}
        </div>

        <button className="carrossel-nav next" onClick={proxima} aria-label="Próxima foto">
          ›
        </button>
      </div>

      <div className="carrossel-dots">
        {FOTOS.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === indice ? 'ativo' : ''}`}
            onClick={() => setIndice(i)}
            aria-label={`Ir para foto ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
