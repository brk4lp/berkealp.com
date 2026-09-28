import { useContent } from '../data/ContentContext.jsx'
import { usePath, navigate } from '../lib/navigation.js'
import Markdown from './Markdown.jsx'

function formatDate(iso) {
  if (!iso || Number.isNaN(Date.parse(iso))) return ''
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
  const { posts } = useContent()
  const activeId = usePath().split('/')[2] || null
  const active = posts.find((p) => p.id === activeId)

  if (active) {
    return (
      <div className="app-content blog-post">
        <button className="link-btn" onClick={() => navigate('/blog')}>
          ← All posts
        </button>
        <p className="post-date">{formatDate(active.date)}</p>
        {active.cover && <img className="post-cover" src={active.cover} alt="" />}
        <h1>{active.title}</h1>
        <Markdown>{active.body}</Markdown>
      </div>
    )
  }

  return (
    <div className="app-content blog">
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id}>
            <button className="post-item" onClick={() => navigate(`/blog/${post.id}`)}>
              {post.cover && <img className="post-cover" src={post.cover} alt="" />}
              <span className="post-title">{post.title}</span>
              <span className="post-date">{formatDate(post.date)}</span>
              <span className="post-excerpt">{post.excerpt}</span>
              {post.tags?.length > 0 && <span className="project-tags">{post.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
