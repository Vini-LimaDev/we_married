import { useState, useEffect, useMemo } from 'react'
import {
  listarPresentes,
  listarCategoriasPresentes,
  reservarPresente,
  contribuirPresente,
} from '../services/api'
import { PIX_KEY } from '../config/wedding'
import './Presentes.css'

const LABEL_CATEGORIA = {
  geral: 'Geral',
  lua_de_mel: 'Lua de mel',
  casa: 'Casa nova',
  afeto: 'Momentos',
}

export default function Presentes({ showNotification }) {
  const [presentes, setPresentes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState(null)

  useEffect(() => {
    carregarTudo()
  }, [])

  const carregarTudo = async () => {
    try {
      const [dadosPresentes, dadosCategorias] = await Promise.all([
        listarPresentes(),
        listarCategoriasPresentes(),
      ])
      setPresentes(dadosPresentes)
      setCategorias(dadosCategorias)
    } catch (error) {
      console.error('Erro ao carregar presentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const presentesFiltrados = useMemo(() => {
    if (categoriaAtiva === 'todas') return presentes
    return presentes.filter((p) => p.categoria === categoriaAtiva)
  }, [presentes, categoriaAtiva])

  const handleReservar = async (presenteId) => {
    const nome = prompt('Digite seu nome para reservar este presente:')
    if (!nome || nome.trim() === '') return

    setProcessando(presenteId)
    try {
      await reservarPresente(presenteId, nome.trim())
      showNotification('Presente reservado com sucesso! 💛')
      await carregarTudo()
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erro ao reservar presente'
      showNotification(msg)
    } finally {
      setProcessando(null)
    }
  }

  const handleContribuir = async (presente) => {
    const nome = prompt('Digite seu nome:')
    if (!nome || nome.trim() === '') return

    const valorStr = prompt('Quanto você gostaria de contribuir? (ex: 50)')
    const valor = parseFloat((valorStr || '').replace(',', '.'))
    if (!valor || valor <= 0) {
      showNotification('Valor inválido.')
      return
    }

    setProcessando(presente.id)
    try {
      await contribuirPresente(presente.id, nome.trim(), valor)
      showNotification('Contribuição registrada com sucesso! Muito obrigado 💛')
      await carregarTudo()
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erro ao registrar contribuição'
      showNotification(msg)
    } finally {
      setProcessando(null)
    }
  }

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY)
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

      {categorias.length > 1 && (
        <div className="gifts-filtros fade-in">
          <button
            className={`filtro-btn ${categoriaAtiva === 'todas' ? 'ativo' : ''}`}
            onClick={() => setCategoriaAtiva('todas')}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              className={`filtro-btn ${categoriaAtiva === cat ? 'ativo' : ''}`}
              onClick={() => setCategoriaAtiva(cat)}
            >
              {LABEL_CATEGORIA[cat] || cat}
            </button>
          ))}
        </div>
      )}

      <div className="gifts-grid fade-in">
        {presentesFiltrados.map((presente) => {
          const isCota = presente.tipo === 'cota'
          const percentual = isCota && presente.valor_meta
            ? Math.min(100, Math.round((presente.valor_arrecadado / presente.valor_meta) * 100))
            : null
          const completo = isCota && percentual >= 100

          return (
            <div
              key={presente.id}
              className={`gift-card ${!isCota && presente.reservado ? 'reserved' : ''} ${completo ? 'reserved' : ''}`}
              onClick={() => {
                if (processando) return
                if (isCota) {
                  if (!completo) handleContribuir(presente)
                } else if (!presente.reservado) {
                  handleReservar(presente.id)
                }
              }}
            >
              {!isCota && presente.reservado && (
                <div className="gift-badge reserved-badge">Reservado</div>
              )}
              {isCota && (
                <div className="gift-badge cota-badge">
                  {completo ? 'Meta atingida!' : 'Contribua'}
                </div>
              )}
              <div className="gift-emoji">{presente.emoji}</div>
              <div className="gift-name">{presente.nome}</div>
              <p className="gift-desc">{presente.descricao}</p>

              {isCota ? (
                <div className="gift-cota">
                  <div className="gift-progress-track">
                    <div className="gift-progress-fill" style={{ width: `${percentual || 0}%` }} />
                  </div>
                  <div className="gift-progress-info">
                    <span>
                      R$ {presente.valor_arrecadado.toLocaleString('pt-BR')}
                      {presente.valor_meta ? ` de R$ ${presente.valor_meta.toLocaleString('pt-BR')}` : ''}
                    </span>
                    <span>{presente.num_contribuintes} contribuiu(íram)</span>
                  </div>
                </div>
              ) : (
                <div className="gift-price">{presente.preco}</div>
              )}

              {processando === presente.id && (
                <div className="gift-loading">Processando...</div>
              )}
            </div>
          )
        })}
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
