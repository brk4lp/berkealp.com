import { profile } from '../data/profile.js'

export default function About() {
  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')

  return (
    <div className="app-content about">
      <header className="about-head">
        <div className="about-avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <h1 className="about-name">{profile.name}</h1>
          <p className="about-title">{profile.title}</p>
          <p className="about-location">📍 {profile.location}</p>
        </div>
      </header>

      <p className="about-bio">{profile.bio}</p>

      <h2 className="section-title">Skills</h2>
      <ul className="skill-list">
        {profile.skills.map((skill) => (
          <li key={skill} className="skill-chip">
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}
