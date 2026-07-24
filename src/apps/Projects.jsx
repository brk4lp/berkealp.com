import { projects } from '../data/projects.js'

export default function Projects() {
  return (
    <div className="app-content projects">
      <h1 className="section-title">Projects</h1>
      <div className="project-grid">
        {projects.map((p) => (
          <a
            key={p.id}
            className="project-card"
            href={p.url}
            target={p.url.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer noopener"
          >
            <div
              className="project-thumb"
              style={{
                background: `linear-gradient(135deg, ${p.color[0]}, ${p.color[1]})`,
              }}
              aria-hidden="true"
            >
              {p.title.charAt(0)}
            </div>
            <div className="project-body">
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.description}</p>
              <div className="project-tags">
                {p.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
