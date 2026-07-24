import { profile } from '../data/profile.js'

export default function Contact() {
  return (
    <div className="app-content contact">
      <h1 className="section-title">Contact</h1>

      <a className="contact-row" href={`mailto:${profile.email}`}>
        <span className="contact-label">✉️ Email</span>
        <span className="contact-value">{profile.email}</span>
      </a>

      {profile.social.map((s) => (
        <a
          key={s.label}
          className="contact-row"
          href={s.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="contact-label">🔗 {s.label}</span>
          <span className="contact-value">{s.handle}</span>
        </a>
      ))}

      <a className="cv-button" href={profile.cvUrl} download>
        ⬇ Download CV / Résumé
      </a>

      <p className="contact-note">
        Note: the CV link is a placeholder for now. Add your real file as{' '}
        <code>public/cv-placeholder.pdf</code>.
      </p>
    </div>
  )
}
