import { links } from '../../data/home.js'
import SocialLink from '../../apps/SocialLink.jsx'

/**
 * Ön-tanımlı "Links" klasörü. İki parça:
 *  - FolderIcon: ana ekrandaki klasör kutucuğu (içeride mini önizlemeler)
 *  - FolderOverlay: dokununca açılan, iç link ikonlarını gösteren katman
 * Sürükle-bırak yok.
 */

export function FolderIcon({ onOpen }) {
  return (
    <button className="ios-app" onClick={onOpen}>
      <span className="ios-app-tile ios-folder-tile">
        <span className="ios-app-gloss" aria-hidden="true" />
        <span className="ios-folder-grid" aria-hidden="true">
          {links.slice(0, 4).map((l) => (
            <span
              key={l.id}
              className={`ios-folder-mini${l.iosIcon ? ' has-artwork' : ''}`}
              style={
                l.iosIcon
                  ? undefined
                  : {
                      background: `linear-gradient(to bottom, ${l.tint[0]}, ${l.tint[1]})`,
                    }
              }
            >
              {l.iosIcon ? <img src={l.iosIcon} alt="" /> : l.letter}
            </span>
          ))}
        </span>
      </span>
      <span className="ios-app-label">Links</span>
    </button>
  )
}

export function FolderOverlay({ onClose }) {
  return (
    <div className="ios-folder-overlay" onClick={onClose}>
      <div className="ios-folder-panel" onClick={(e) => e.stopPropagation()}>
        <p className="ios-folder-title">Links</p>
        <div className="ios-folder-apps">
          {links.map((l) => (
            <SocialLink
              key={l.id}
              label={l.label}
              maintenance={l.maintenance}
              className="ios-app"
              href={l.url}
              target={l.url.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer noopener"
            >
              <span
                className={`ios-app-tile${l.iosIcon ? ' has-artwork' : ''}`}
                style={
                  l.iosIcon
                    ? undefined
                    : {
                        background: `linear-gradient(to bottom, ${l.tint[0]}, ${l.tint[1]})`,
                      }
                }
              >
                {l.iosIcon ? (
                  <img className="ios-app-artwork" src={l.iosIcon} alt="" />
                ) : (
                  <>
                    <span className="ios-app-gloss" aria-hidden="true" />
                    <span className="dock-glyph">{l.letter}</span>
                  </>
                )}
              </span>
              <span className="ios-app-label">{l.label}</span>
            </SocialLink>
          ))}
        </div>
      </div>
    </div>
  )
}
