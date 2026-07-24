import { profile } from '../data/profile.js'
import { projects } from '../data/projects.js'

/**
 * "My Computer" — temalı sürücü/sistem özeti (espri + gerçek bilgi karışımı).
 */
export default function MyComputer() {
  const drives = [
    { letter: 'C:', label: 'Skills', used: profile.skills.length, unit: 'items' },
    { letter: 'D:', label: 'Projects', used: projects.length, unit: 'items' },
    { letter: 'E:', label: 'Coffee', used: '∞', unit: '' },
  ]

  return (
    <div className="app-content my-computer">
      <h1 className="section-title">My Computer</h1>

      <h2 className="mc-group">Hard Disk Drives</h2>
      <div className="mc-drives">
        {drives.map((d) => (
          <div key={d.letter} className="mc-drive">
            <span className="mc-drive-icon" aria-hidden="true">🖴</span>
            <div>
              <div className="mc-drive-name">
                {d.label} ({d.letter})
              </div>
              <div className="mc-drive-meta">
                {d.used} {d.unit}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mc-group">System</h2>
      <dl className="mc-system">
        <dt>OS</dt>
        <dd>berkeOS (Windows XP edition)</dd>
        <dt>User</dt>
        <dd>{profile.name}</dd>
        <dt>Role</dt>
        <dd>{profile.title}</dd>
        <dt>Location</dt>
        <dd>{profile.location}</dd>
      </dl>
    </div>
  )
}
