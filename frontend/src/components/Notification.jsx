import './Notification.css'

export default function Notification({ notification }) {
  return (
    <div className={`notification ${notification.show ? 'show' : ''}`}>
      {notification.message}
    </div>
  )
}
