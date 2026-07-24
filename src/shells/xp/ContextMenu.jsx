import { useEffect } from 'react'

/**
 * İmleç konumunda açılan XP tarzı bağlam menüsü.
 * items: [{ label, onClick } | { separator: true }]
 * Dışa tık / Escape / scroll ile kapanır.
 */
export default function ContextMenu({ x, y, items, onClose }) {
  useEffect(() => {
    const close = () => onClose()
    const onKey = (e) => e.key === 'Escape' && onClose()
    // pointerdown yakalama fazında: menü öğesine tık önce onClick çalışsın diye
    // kapatmayı bir tık geciktirmek yerine, menü içi tıkları durduruyoruz (aşağıda).
    window.addEventListener('pointerdown', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Ekran dışına taşmayı kabaca engelle
  const style = {
    left: Math.min(x, window.innerWidth - 180),
    top: Math.min(y, window.innerHeight - 40 - items.length * 24),
  }

  return (
    <ul
      className="xp-context-menu"
      style={style}
      role="menu"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {items.map((it, i) =>
        it.separator ? (
          <li key={i} className="xp-context-sep" />
        ) : (
          <li key={i}>
            <button
              className="xp-context-item"
              role="menuitem"
              onClick={() => {
                it.onClick?.()
                onClose()
              }}
            >
              {it.label}
            </button>
          </li>
        ),
      )}
    </ul>
  )
}
