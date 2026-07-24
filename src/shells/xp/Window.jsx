import { useRef } from 'react'

/**
 * XP Luna pencere: sürüklenebilir başlık çubuğu + min/max/kapat.
 * Sürükleme pointer event'leri ile, harici bağımlılık yok.
 */
export default function Window({
  win,
  title,
  children,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onMove,
}) {
  const drag = useRef(null)

  const onPointerDown = (e) => {
    // Kontrol butonlarına (min/max/kapat) basıldıysa sürükleme başlatma;
    // aksi halde pointer capture butonun tıklamasını "çalar".
    if (e.target.closest('.xp-title-buttons')) return
    if (win.maximized) return
    onFocus()
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: win.x,
      originY: win.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onTitleDoubleClick = (e) => {
    // Butonlara hızlı basınca çift-tık maximize'ı tetiklenmesin.
    if (e.target.closest('.xp-title-buttons')) return
    onToggleMaximize()
  }

  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    const nextX = drag.current.originX + dx
    const nextY = Math.max(0, drag.current.originY + dy)
    onMove(nextX, nextY)
  }

  const onPointerUp = (e) => {
    drag.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* yoksay */
    }
  }

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 30px)', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  return (
    <div
      className={`xp-window${win.maximized ? ' is-max' : ''}${
        win.minimized ? ' is-min' : ''
      }`}
      style={style}
      onPointerDown={onFocus}
      aria-hidden={win.minimized || undefined}
    >
      <div
        className="xp-titlebar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onTitleDoubleClick}
      >
        <span className="xp-title-text">{title}</span>
        <div className="xp-title-buttons">
          <button
            className="xp-btn xp-min"
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            aria-label="Minimize"
            title="Minimize"
          >
            <span className="glyph-min" />
          </button>
          <button
            className="xp-btn xp-max"
            onClick={(e) => {
              e.stopPropagation()
              onToggleMaximize()
            }}
            aria-label="Maximize"
            title="Maximize"
          >
            <span className="glyph-max" />
          </button>
          <button
            className="xp-btn xp-close"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            aria-label="Close"
            title="Close"
          >
            <span className="glyph-close">✕</span>
          </button>
        </div>
      </div>
      <div className="xp-window-body">{children}</div>
    </div>
  )
}
