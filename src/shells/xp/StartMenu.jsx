import { desktopApps as apps } from '../../data/apps.js'
import { profile } from '../../data/profile.js'

/**
 * XP Start menüsü: üstte kullanıcı bandı, solda bölümler, altta linkler.
 */
export default function StartMenu({ onOpen, onClose, onLogOff }) {
  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')

  return (
    <>
      <div className="startmenu-overlay" onClick={onClose} />
      <div className="startmenu" role="menu">
        <div className="startmenu-header">
          <span className="startmenu-avatar">{initials}</span>
          <span className="startmenu-user">{profile.name}</span>
        </div>

        <div className="startmenu-body">
          <div className="startmenu-col startmenu-left">
            {apps.map((app) => {
              const { Glyph } = app
              return (
                <button
                  key={app.id}
                  className="startmenu-item"
                  role="menuitem"
                  onClick={() => {
                    onOpen(app.id)
                    onClose()
                  }}
                >
                  <span className="startmenu-item-icon">
                    <Glyph />
                  </span>
                  <span>{app.title}</span>
                </button>
              )
            })}
          </div>

          <div className="startmenu-col startmenu-right">
            <p className="startmenu-right-title">Links</p>
            {profile.social.map((s) => (
              <a
                key={s.label}
                className="startmenu-item"
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={onClose}
              >
                <span>{s.label}</span>
              </a>
            ))}
            <a
              className="startmenu-item"
              href={`mailto:${profile.email}`}
              onClick={onClose}
            >
              <span>Send email</span>
            </a>
          </div>
        </div>

        <div className="startmenu-footer">
          <button className="startmenu-footer-btn" onClick={onLogOff}>
            ⏻ Log Off
          </button>
        </div>
      </div>
    </>
  )
}
