import { useState } from 'react'
import { posts } from '../data/posts.js'
import Markdown from './Markdown.jsx'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function Blog() {
  const [activeId, setActiveId] = useState(null)
  const active = posts.find((p) => p.id === activeId)

  if (active) {
    return (
      <div className="app-content blog-post">
        <button className="link-btn" onClick={() => setActiveId(null)}>
          ← All posts
        </button>
        <p className="post-date">{formatDate(active.date)}</p>
        <Markdown>{active.body}</Markdown>
      </div>
    )
  }

  return (
    <div className="app-content blog">
      <h1 className="section-title">Blog</h1>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id}>
            <button className="post-item" onClick={() => setActiveId(post.id)}>
              <span className="post-title">{post.title}</span>
              <span className="post-date">{formatDate(post.date)}</span>
              <span className="post-excerpt">{post.excerpt}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
