import { useState, useEffect } from 'react'
import './Countdown.css'
import { DATA_CASAMENTO } from '../config/wedding'

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--'
  })
  const [jaCasaram, setJaCasaram] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date(DATA_CASAMENTO)
      const now = new Date()
      const diff = weddingDate - now

      if (diff <= 0) {
        return null
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      }
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft)
      } else {
        setJaCasaram(true)
        clearInterval(timer)
      }
    }, 1000)

    // Calcula imediatamente na montagem
    const initial = calculateTimeLeft()
    if (initial) {
      setTimeLeft(initial)
    } else {
      setJaCasaram(true)
    }

    return () => clearInterval(timer)
  }, [])

  if (jaCasaram) {
    return (
      <div className="countdown-section">
        <p className="countdown-label">Já somos casados! 💍</p>
      </div>
    )
  }

  return (
    <div className="countdown-section">
      <p className="countdown-label">Faltam</p>
      <div className="countdown">
        <div className="countdown-item">
          <span className="countdown-num">{timeLeft.days}</span>
          <span className="countdown-unit">Dias</span>
        </div>
        <span className="countdown-sep">·</span>
        <div className="countdown-item">
          <span className="countdown-num">{timeLeft.hours}</span>
          <span className="countdown-unit">Horas</span>
        </div>
        <span className="countdown-sep">·</span>
        <div className="countdown-item">
          <span className="countdown-num">{timeLeft.minutes}</span>
          <span className="countdown-unit">Minutos</span>
        </div>
        <span className="countdown-sep">·</span>
        <div className="countdown-item">
          <span className="countdown-num">{timeLeft.seconds}</span>
          <span className="countdown-unit">Segundos</span>
        </div>
      </div>
    </div>
  )
}
