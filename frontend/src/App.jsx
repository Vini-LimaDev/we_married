import { useState } from 'react'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import Historia from './components/Historia'
import Galeria from './components/Galeria'
import Evento from './components/Evento'
import RSVP from './components/RSVP'
import Presentes from './components/Presentes'
import Footer from './components/Footer'
import Navigation from './components/Navigation'
import Notification from './components/Notification'

function App() {
  const [notification, setNotification] = useState({ show: false, message: '' })

  const showNotification = (message) => {
    setNotification({ show: true, message })
    setTimeout(() => {
      setNotification({ show: false, message: '' })
    }, 3500)
  }

  return (
    <>
      <Navigation />
      <Hero />
      <Countdown />
      <Historia />
      <Galeria />
      <Evento />
      <RSVP showNotification={showNotification} />
      <Presentes showNotification={showNotification} />
      <Footer />
      <Notification notification={notification} />
    </>
  )
}

export default App
