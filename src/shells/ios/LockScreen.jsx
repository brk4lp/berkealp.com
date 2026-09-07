import { useEffect, useRef, useState } from 'react'
import StatusBar from './StatusBar.jsx'
import { sound } from '../../lib/sound.js'

/**
 * iOS 5 kilit ekranı: büyük saat/tarih + "kaydırarak aç" slider.
 * Slider knob'u eşiği geçince onUnlock. Erişilebilirlik için tıkla/Enter de açar.
 */
export default function LockScreen({ onUnlock }) {
  const [now, setNow] = useState(new Date())
  const [offset, setOffset] = useState(0)
  const trackRef = useRef(null)
  const drag = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 20)
    return () => clearInterval(id)
  }, [])

  const maxOffset = () => {
    const track = trackRef.current
    if (!track) return 220
    return track.clientWidth - 66 // knob genişliği + kenar boşluğu
  }

  const onPointerDown = (e) => {
    drag.current = { startX: e.clientX }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    setOffset(Math.max(0, Math.min(dx, maxOffset())))
  }

  const onPointerUp = (e) => {
    if (!drag.current) return
    drag.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* yoksay */
    }
    if (offset >= maxOffset() * 0.75) {
      sound.unlock()
      onUnlock()
    } else {
      setOffset(0) // eşiğe ulaşmadıysa geri kaydır
    }
  }

  const onPointerCancel = () => {
    drag.current = null
    setOffset(0)
  }

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const progress = offset / (maxOffset() || 1)

  return (
    <div className="shell shell-ios ios-lock">
      <StatusBar />

      <div className="ios-lock-clock">
        <div className="ios-lock-time">{time}</div>
        <div className="ios-lock-date">{date}</div>
      </div>

      <div className="ios-lock-slider">
        <div className="ios-slider-track" ref={trackRef}>
          <span
            className="ios-slider-label"
            style={{ opacity: 1 - progress * 1.6 }}
          >
            slide to unlock
          </span>
          <button
            className="ios-slider-knob"
            style={{ transform: `translateX(${offset}px)` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                sound.unlock()
                onUnlock()
              }
            }}
            aria-label="Slide to unlock"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
