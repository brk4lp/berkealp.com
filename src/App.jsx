import { useMediaQuery } from './hooks/useMediaQuery.js'
import XPShell from './shells/xp/XPShell.jsx'
import IOSShell from './shells/ios/IOSShell.jsx'

/**
 * Viewport genişliğine göre kabuk seçer:
 *  - Geniş ekran (>= 768px) -> Windows XP masaüstü
 *  - Dar ekran  (< 768px)   -> iOS 5 ana ekranı
 */
export default function App() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <XPShell /> : <IOSShell />
}
