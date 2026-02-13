import { useState, useEffect } from 'react'
import './Countdown.css'

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--'
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date('2025-06-14T16:00:00')
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
      }
    }, 1000)

    // Calcula imediatamente na montagem
    const initial = calculateTimeLeft()
    if (initial) setTimeLeft(initial)

    return () => clearInterval(timer)
  }, [])

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
