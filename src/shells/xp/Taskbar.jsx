import { getApp } from '../../data/apps.js'
import { useMuted } from '../../hooks/useMuted.js'
import Clock from './Clock.jsx'

/**
 * Alt görev çubuğu: Start butonu, açık pencere sekmeleri, saat.
 */
export default function Taskbar({
  windows,
  activeId,
  startOpen,
  onToggleStart,
  onSelectWindow,
}) {
  const [muted, toggleMuted] = useMuted()
  return (
    <div className="xp-taskbar">
      <button
        className={`start-button${startOpen ? ' active' : ''}`}
        onClick={onToggleStart}
      >
        <span className="start-flag" aria-hidden="true">
          <span className="start-flag-r" />
          <span className="start-flag-g" />
          <span className="start-flag-b" />
          <span className="start-flag-y" />
        </span>
        <span className="start-text">start</span>
      </button>

      <div className="taskbar-windows">
        {windows.map((w) => {
          const app = getApp(w.appId)
          const active = w.id === activeId && !w.minimized
          return (
            <button
              key={w.id}
              className={`taskbar-tab${active ? ' active' : ''}`}
              onClick={() => onSelectWindow(w.id)}
            >
              <span className="taskbar-tab-icon">
                {app ? <app.Glyph /> : null}
              </span>
              <span className="taskbar-tab-label">{app?.title}</span>
            </button>
          )
        })}
      </div>

      <div className="taskbar-tray">
        <button
          className="tray-speaker"
          onClick={toggleMuted}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          title={muted ? 'Sounds off' : 'Sounds on'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <Clock />
      </div>
    </div>
  )
}
