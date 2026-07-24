import { useState } from 'react'
import { profile } from '../../data/profile.js'

/**
 * Sade, kurumsal tam ekran CV görünümü (İK / HR kullanıcısı).
 * XP temasından bağımsız; üstte ince başlık, altta gömülü PDF.
 */
export default function CVView({ onSwitchUser }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="cv-view">
      <header className="cv-topbar">
        <div className="cv-topbar-id">
          <strong>{profile.name}</strong>
          <span className="cv-topbar-sub">Résumé</span>
        </div>
        <div className="cv-topbar-actions">
          <a className="cv-btn cv-btn-primary" href={profile.cvUrl} download>
            ⬇ Download
          </a>
          <button className="cv-btn" onClick={onSwitchUser}>
            Switch user
          </button>
        </div>
      </header>

      <div className="cv-doc">
        {failed ? (
          <div className="cv-fallback">
            <p>Couldn't display the PDF.</p>
            <p className="cv-fallback-sub">
              Add your real résumé as <code>public/cv-placeholder.pdf</code> or
              update <code>profile.cvUrl</code>.
            </p>
            <a className="cv-btn cv-btn-primary" href={profile.cvUrl} download>
              ⬇ Download anyway
            </a>
          </div>
        ) : (
          <iframe
            className="cv-frame"
            src={profile.cvUrl}
            title={`${profile.name} — Résumé`}
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  )
}
