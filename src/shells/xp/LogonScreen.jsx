import { profile } from '../../data/profile.js'
import { sound } from '../../lib/sound.js'

/**
 * XP karşılama/logon ekranı: iki kullanıcı kutucuğu.
 *  - Berke Alp -> tam portfolyo masaüstü ('desktop')
 *  - İK / HR   -> sade CV görünümü ('cv')
 */
const users = [
  {
    id: 'desktop',
    name: profile.name,
    caption: 'Portfolio desktop',
    initials: profile.name
      .split(' ')
      .map((w) => w[0])
      .join(''),
    tint: ['#5b9bd5', '#2e6da4'],
  },
  {
    id: 'cv',
    name: 'HR',
    caption: 'Résumé only',
    initials: 'HR',
    tint: ['#8e8e93', '#5a5a5f'],
  },
]

export default function LogonScreen({ onSelect }) {
  return (
    <div className="shell shell-xp xp-logon">
      <div className="xp-logon-top">
        <span className="xp-boot-flag" aria-hidden="true">
          <span className="start-flag-r" />
          <span className="start-flag-g" />
          <span className="start-flag-b" />
          <span className="start-flag-y" />
        </span>
      </div>

      <div className="xp-logon-body">
        <div className="xp-logon-users">
          {users.map((u) => (
            <button
              key={u.id}
              className="xp-user-tile"
              onClick={() => {
                sound.logon()
                onSelect(u.id)
              }}
            >
              <span
                className="xp-user-avatar"
                style={{
                  background: `linear-gradient(135deg, ${u.tint[0]}, ${u.tint[1]})`,
                }}
              >
                {u.initials}
              </span>
              <span className="xp-user-meta">
                <span className="xp-user-name">{u.name}</span>
                <span className="xp-user-caption">{u.caption}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="xp-logon-hint">To begin, click your user name</p>
      </div>

      <div className="xp-logon-footer">
        <span className="xp-logon-footer-left">berkealp.com</span>
        <span className="xp-logon-footer-right">
          Pick a user to log on
        </span>
      </div>
    </div>
  )
}
