import { useState } from 'react'
import AppGlyph from './AppGlyph.jsx'

/**
 * Masaüstü ikonu — tek tıkla seçilir, çift tıkla açılır.
 */
export default function DesktopIcon({ app, onOpen }) {
  const [selected, setSelected] = useState(false)

  return (
    <button
      className={`desktop-icon${selected ? ' selected' : ''}`}
      onClick={() => setSelected(true)}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen()
      }}
      onBlur={() => setSelected(false)}
    >
      <span className="desktop-icon-img">
        <AppGlyph app={app} />
      </span>
      <span className="desktop-icon-label">{app.title}</span>
    </button>
  )
}
