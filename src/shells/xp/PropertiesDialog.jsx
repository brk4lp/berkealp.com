/**
 * Basit "Display Properties" temalı modal diyalog (sağ-tık > Properties).
 * Tam pencere değil; ortalanmış küçük bir XP diyaloğu.
 */
export default function PropertiesDialog({ onClose }) {
  return (
    <div className="xp-dialog-overlay" onPointerDown={onClose}>
      <div
        className="xp-dialog"
        onPointerDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Display Properties"
      >
        <div className="xp-titlebar xp-dialog-title">
          <span className="xp-title-text">Display Properties</span>
          <div className="xp-title-buttons">
            <button className="xp-btn xp-close" onClick={onClose} aria-label="Close">
              <span className="glyph-close">✕</span>
            </button>
          </div>
        </div>
        <div className="xp-dialog-body">
          <div className="xp-dialog-preview">
            <div className="xp-dialog-monitor">
              <div className="xp-dialog-screen" />
            </div>
          </div>
          <dl className="xp-dialog-props">
            <dt>Theme</dt>
            <dd>berkeOS Luna (Blue)</dd>
            <dt>Wallpaper</dt>
            <dd>Bliss (stretched)</dd>
            <dt>Resolution</dt>
            <dd>{window.innerWidth} × {window.innerHeight}</dd>
            <dt>Color quality</dt>
            <dd>Highest (32 bit)</dd>
          </dl>
        </div>
        <div className="xp-dialog-footer">
          <button className="xp-dialog-ok" onClick={onClose}>
            OK
          </button>
          <button className="xp-dialog-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
