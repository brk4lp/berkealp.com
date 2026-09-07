import { useMemo, useState } from 'react'
import { mobileApps } from '../../data/apps.js'
import { posts } from '../../data/posts.js'
import { useMuted } from '../../hooks/useMuted.js'

/**
 * iOS 5 Spotlight arama sayfası (en sol sayfa).
 * App'ler ve blog yazıları arasında filtreler. Sonuca dokun -> app'i aç.
 */
export default function Spotlight({ onOpenApp }) {
  const [q, setQ] = useState('')
  const [muted, toggleMuted] = useMuted()

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return []
    const appHits = mobileApps
      .filter((a) => a.title.toLowerCase().includes(query))
      .map((a) => ({ type: 'app', id: a.id, title: a.title, sub: 'Application' }))
    const postHits = posts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query),
      )
      .map((p) => ({ type: 'post', id: 'blog', title: p.title, sub: 'Blog' }))
    return [...appHits, ...postHits]
  }, [q])

  return (
    <div className="ios-spotlight">
      <div className="ios-spotlight-heading">
        <h1>Spotlight</h1>
        <button
          className="ios-sound-toggle"
          onClick={toggleMuted}
          aria-label={muted ? 'Turn sounds on' : 'Turn sounds off'}
          title={muted ? 'Sounds off' : 'Sounds on'}
        >
          <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
        </button>
      </div>

      <div className="ios-spotlight-bar">
        <span className="ios-spotlight-icon" aria-hidden="true">🔍</span>
        <input
          className="ios-spotlight-input"
          type="search"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
      </div>

      <ul className="ios-spotlight-results">
        {results.map((r, i) => (
          <li key={i}>
            <button
              className="ios-spotlight-result"
              onClick={() => onOpenApp(r.id)}
            >
              <span className="ios-spotlight-result-title">{r.title}</span>
              <span className="ios-spotlight-result-sub">{r.sub}</span>
            </button>
          </li>
        ))}
        {q.trim() && results.length === 0 && (
          <li className="ios-spotlight-empty">No results</li>
        )}
      </ul>
    </div>
  )
}
