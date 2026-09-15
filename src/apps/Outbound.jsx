import { useEffect } from 'react'
import { getOutboundLink } from '../data/outbound.js'

export default function Outbound() {
  const link = getOutboundLink(window.location.pathname)
  useEffect(() => {
    document.title = link ? `${link.label} - Berke Alp` : 'Link not found - Berke Alp'
    if (link) window.location.replace(link.url)
  }, [link])

  return (
    <main className="outbound-page">
      <div className="outbound-panel">
        <p>BERKE ALP</p>
        <h1>{link ? link.label : 'Link not found'}</h1>
        {link ? <>
          <a className="link-btn" href={link.url} rel="noreferrer">Continue to {link.label} ↗</a>
        </> : <p>This link is unavailable.</p>}
        <a className="outbound-home" href="/">Back to portfolio</a>
      </div>
    </main>
  )
}
