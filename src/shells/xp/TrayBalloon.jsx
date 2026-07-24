import { useEffect, useState } from 'react'

/**
 * Sistem tepsisinden çıkan sarı XP balon bildirimi.
 * Oturumda bir kez gösterilir; ×/otomatik kapanır.
 */
export default function TrayBalloon() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let shown = false
    try {
      shown = sessionStorage.getItem('welcome-balloon') === '1'
    } catch {
      /* yoksay */
    }
    if (shown) return
    const showId = setTimeout(() => setShow(true), 1500)
    const hideId = setTimeout(() => setShow(false), 9000)
    try {
      sessionStorage.setItem('welcome-balloon', '1')
    } catch {
      /* yoksay */
    }
    return () => {
      clearTimeout(showId)
      clearTimeout(hideId)
    }
  }, [])

  if (!show) return null

  return (
    <div className="xp-balloon" role="status">
      <button
        className="xp-balloon-close"
        onClick={() => setShow(false)}
        aria-label="Close"
      >
        ✕
      </button>
      <p className="xp-balloon-title">Welcome!</p>
      <p className="xp-balloon-body">
        Double-click an icon to open a window. Right-click the desktop for more.
      </p>
    </div>
  )
}
