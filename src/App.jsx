import { useMediaQuery } from './hooks/useMediaQuery.js'
import XPShell from './shells/xp/XPShell.jsx'
import IOSShell from './shells/ios/IOSShell.jsx'
import Outbound from './apps/Outbound.jsx'
import { useEffect } from 'react'
import { usePath, isKnownPath, pageTitle } from './lib/navigation.js'

/**
 * Viewport genişliğine göre kabuk seçer:
 *  - Geniş ekran (>= 768px) -> Windows XP masaüstü
 *  - Dar ekran  (< 768px)   -> klasik iOS esintili modern ana ekran
 */
export default function App() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const path = usePath()
  useEffect(() => { document.title = pageTitle(path) }, [path])
  if (path.startsWith('/go/')) return <Outbound />
  if (!isKnownPath(path)) return <main className="outbound-page"><div className="outbound-panel"><h1>Page not found</h1><a href="/">Back to portfolio</a></div></main>
  return isDesktop ? <XPShell /> : <IOSShell />
}
