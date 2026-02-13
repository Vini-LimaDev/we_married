import { useState, useEffect } from 'react'
import { listarPresentes, reservarPresente } from '../services/api'
import './Presentes.css'

export default function Presentes({ showNotification }) {
  const [presentes, setPresentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [reservando, setReservando] = useState(null)

  useEffect(() => {
    carregarPresentes()
  }, [])

  const carregarPresentes = async () => {
    try {
      const data = await listarPresentes()
      setPresentes(data)
    } catch (error) {
      console.error('Erro ao carregar presentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReservar = async (presenteId) => {
    const nome = prompt('Digite seu nome para reservar este presente:')
    if (!nome || nome.trim() === '') return

    setReservando(presenteId)
    try {
      await reservarPresente(presenteId, nome.trim())
      showNotification('Presente reservado com sucesso! 💛')
      await carregarPresentes() // Recarregar lista
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erro ao reservar presente'
      showNotification(msg)
    } finally {
      setReservando(null)
    }
  }

  const copyPix = () => {
    navigator.clipboard.writeText('sofia.rafael@casamento.com.br')
      .then(() => showNotification('Chave PIX copiada! 💛'))
      .catch(() => showNotification('Erro ao copiar chave PIX'))
  }

  if (loading) {
    return (
      <section id="presentes" className="presentes-section">
        <div className="section-header">
          <span className="section-tag">Carregando...</span>
        </div>
      </section>
    )
  }

  return (
    <section id="presentes" className="presentes-section">
      <div className="section-header fade-in">
        <span className="section-tag">Sua presença já é um presente</span>
        <h2 className="section-title">Lista de <em>Presentes</em></h2>
        <div className="ornament-line"></div>
      </div>
      <p className="gifts-intro fade-in">
        Sua presença no nosso dia especial já é mais que suficiente. Mas se quiser
        nos presentear, aqui estão algumas ideias — ou sinta-se à vontade para usar
        nosso PIX.
      </p>
      <div className="gifts-grid fade-in">
        {presentes.map((presente) => (
          <div
            key={presente.id}
            className={`gift-card ${presente.reservado ? 'reserved' : ''}`}
            onClick={() => !presente.reservado && handleReservar(presente.id)}
          >
            {presente.reservado && (
              <div className="gift-badge reserved-badge">Reservado</div>
            )}
            <div className="gift-emoji">{presente.emoji}</div>
            <div className="gift-name">{presente.nome}</div>
            <p className="gift-desc">{presente.descricao}</p>
            <div className="gift-price">{presente.preco}</div>
            {reservando === presente.id && (
              <div className="gift-loading">Reservando...</div>
            )}
          </div>
        ))}
      </div>
      <div className="pix-card fade-in">
        <div className="pix-icon">🔑</div>
        <div className="pix-title">Chave PIX</div>
        <p className="pix-text">
          Prefere praticidade? Envie seu carinho via PIX. Cada centavo vai para nossa
          vida nova.
        </p>
        <div className="pix-key" onClick={copyPix} title="Clique para copiar">
          sofia.rafael@casamento.com.br
        </div>
      </div>
    </section>
  )
}
