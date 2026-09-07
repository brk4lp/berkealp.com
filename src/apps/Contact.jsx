import { profile } from '../data/profile.js'

export default function Contact() {
  return (
    <div className="app-content contact">
      <a className="contact-row" href={`mailto:${profile.email}`}>
        <span className="contact-label">Email</span>
        <span className="contact-value">{profile.email}</span>
        <span className="contact-arrow" aria-hidden="true">↗</span>
      </a>

      {profile.social.map((s) => (
        <a
          key={s.label}
          className="contact-row"
          href={s.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="contact-label">{s.label}</span>
          <span className="contact-value">{s.handle}</span>
          <span className="contact-arrow" aria-hidden="true">↗</span>
        </a>
      ))}

      <a className="cv-button" href={profile.cvUrl} download>
        Download CV / Résumé <span aria-hidden="true">↓</span>
      </a>

      <p className="contact-note">
        Note: the CV link is a placeholder for now. Add your real file as{' '}
        <code>public/cv-placeholder.pdf</code>.
      </p>
    </div>
  )
}
