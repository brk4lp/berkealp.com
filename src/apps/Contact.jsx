import { profile } from '../data/profile.js'
import SocialLink from './SocialLink.jsx'

export default function Contact() {
  return (
    <div className="app-content contact">
      <a className="contact-row" href={`mailto:${profile.email}`}>
        <span className="contact-label">Email</span>
        <span className="contact-value">{profile.email}</span>
        <span className="contact-arrow" aria-hidden="true">↗</span>
      </a>

      {profile.social.map((s) => (
        <SocialLink
          key={s.label}
          label={s.label}
          maintenance={s.maintenance}
          className="contact-row"
          href={s.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="contact-label">{s.label}</span>
          <span className="contact-value">{s.maintenance ? 'Under maintenance' : s.handle}</span>
          <span className="contact-arrow" aria-hidden="true">{s.maintenance ? '⚠' : '↗'}</span>
        </SocialLink>
      ))}

      <a className="cv-button" href={profile.cvUrl} download>
        Download CV / Résumé <span aria-hidden="true">↓</span>
      </a>

    </div>
  )
}
