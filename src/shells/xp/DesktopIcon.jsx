import { useState } from 'react'

/**
 * Masaüstü ikonu — tek tıkla seçilir, çift tıkla açılır.
 */
export default function DesktopIcon({ app, onOpen }) {
  const [selected, setSelected] = useState(false)
  const { Glyph } = app

  return (
    <button
      className={`desktop-icon${selected ? ' selected' : ''}`}
      onClick={() => setSelected(true)}
      onDoubleClick={onOpen}
      onBlur={() => setSelected(false)}
    >
      <span className="desktop-icon-img">
        <Glyph />
      </span>
      <span className="desktop-icon-label">{app.title}</span>
    </button>
  )
}
