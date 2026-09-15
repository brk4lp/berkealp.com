import { useEffect, useState } from 'react'
import { navigate, usePath } from '../lib/navigation.js'
import { projects } from '../data/projects.js'
import { outboundHref } from '../data/outbound.js'
import Markdown from './Markdown.jsx'
import GorleakDiagram from './GorleakDiagrams.jsx'

function splitGorleakCaseStudy(details) {
  const buildMarker = '## What I built'
  const learnMarker = '## What I learned'
  const buildIndex = details.indexOf(buildMarker)
  const learnIndex = details.indexOf(learnMarker)

  if (buildIndex === -1 || learnIndex === -1) return null

  return {
    introduction: details
      .slice(0, buildIndex)
      .trim()
      .replace(/^# Gorleak\s*/, ''),
    build: details.slice(buildIndex, learnIndex).trim(),
    lessons: details.slice(learnIndex).trim(),
  }
}

export default function Projects() {
  const path = usePath()
  const [activeId, setActiveId] = useState(path === '/projects/gorleak' ? 'gorleak' : null)
  useEffect(() => {
    if (path === '/projects' || path === '/projects/gorleak') setActiveId(path === '/projects/gorleak' ? 'gorleak' : null)
  }, [path])
  const active = projects.find((project) => project.id === activeId)
  const gorleakSections = active?.id === 'gorleak'
    ? splitGorleakCaseStudy(active.details)
    : null

  if (active?.details) {
    return (
      <div className="app-content project-detail">
        <button className="link-btn" onClick={() => navigate('/projects')}>
          ← All projects
        </button>
        <div
          className="project-detail-hero"
          style={{
            background: `linear-gradient(135deg, ${active.color[0]}, ${active.color[1]})`,
          }}
        >
          <span>{active.title.charAt(0)}</span>
          <strong>{active.title}</strong>
        </div>
        {gorleakSections ? (
          <>
            <div className="project-detail-panel">
              <Markdown>{gorleakSections.introduction}</Markdown>
            </div>
            <GorleakDiagram variant="discovery" />
            <div className="project-detail-panel">
              <Markdown>{gorleakSections.build}</Markdown>
            </div>
            <GorleakDiagram variant="monitoring" />
            <div className="project-detail-panel">
              <Markdown>{gorleakSections.lessons}</Markdown>
            </div>
          </>
        ) : (
          <div className="project-detail-panel">
            <Markdown>{active.details}</Markdown>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-content projects">
      <div className="project-grid">
        {projects.map((p) => {
          const Card = p.details ? 'button' : 'a'
          const cardProps = p.details
            ? { type: 'button', onClick: () => navigate(`/projects/${p.id}`) }
            : {
                href: outboundHref(p.url),
                target: p.url?.startsWith('http') ? '_blank' : undefined,
                rel: 'noreferrer noopener',
              }

          return (
          <Card key={p.id} className="project-card" {...cardProps}>
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
              {p.status && <span className="project-status">{p.status} →</span>}
            </div>
          </Card>
          )
        })}
      </div>
    </div>
  )
}
