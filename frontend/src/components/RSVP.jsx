import { useState } from 'react'
import { criarRSVP } from '../services/api'
import './RSVP.css'

export default function RSVP({ showNotification }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    confirmado: true,
    num_convidados: 1,
    restricao_alimentar: 'nenhuma',
    mensagem: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value === 'true' : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await criarRSVP({
        ...formData,
        restricao_alimentar: formData.restricao_alimentar === 'nenhuma' ? null : formData.restricao_alimentar,
        mensagem: formData.mensagem || null
      })

      const msg = formData.confirmado
        ? 'Presença confirmada! Mal podemos esperar para te ver. 🎊'
        : 'Mensagem enviada. Sentiremos sua falta!'

      showNotification(msg)

      // Resetar formulário
      setFormData({
        nome: '',
        email: '',
        confirmado: true,
        num_convidados: 1,
        restricao_alimentar: 'nenhuma',
        mensagem: ''
      })
    } catch (error) {
      console.error('Erro ao enviar RSVP:', error)
      showNotification('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rsvp-wrapper" id="rsvp">
      <div className="rsvp-container">
        <div className="section-header fade-in">
          <span className="section-tag">Confirme sua presença</span>
          <h2 className="section-title">Você <em>Vem?</em></h2>
          <div className="ornament-line"></div>
          <p className="rsvp-sub">
            Responda até o dia 1º de Maio para que possamos organizar tudo com
            carinho para você.
          </p>
        </div>
        <form className="rsvp-form fade-in" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Confirmação</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="confirmado"
                  value="true"
                  checked={formData.confirmado === true}
                  onChange={handleChange}
                />
                Estarei lá! 🎉
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="confirmado"
                  value="false"
                  checked={formData.confirmado === false}
                  onChange={handleChange}
                />
                Infelizmente não poderei 😢
              </label>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Número de convidados</label>
              <select
                name="num_convidados"
                value={formData.num_convidados}
                onChange={handleChange}
              >
                <option value="1">Somente eu</option>
                <option value="2">Eu + 1</option>
                <option value="3">Eu + 2</option>
                <option value="4">Eu + 3 ou mais</option>
              </select>
            </div>
            <div className="form-group">
              <label>Restrição alimentar?</label>
              <select
                name="restricao_alimentar"
                value={formData.restricao_alimentar}
                onChange={handleChange}
              >
                <option value="nenhuma">Nenhuma</option>
                <option value="vegetariano">Vegetariano</option>
                <option value="vegano">Vegano</option>
                <option value="sem glúten">Sem glúten</option>
                <option value="sem lactose">Sem lactose</option>
                <option value="outra">Outra</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Mensagem (opcional)</label>
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              placeholder="Deixe um recado para os noivos..."
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Confirmar Presença'}
          </button>
        </form>
      </div>
    </div>
  )
}
