import { useEffect, useState } from 'react'

/**
 * Bir CSS media query'sini dinler ve eşleşme durumunu döner.
 * Yeniden boyutlandırmada canlı güncellenir.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const sync = () => setMatches(mql.matches)
    sync()
    // matchMedia 'change' bazı ortamlarda programatik resize'da ateşlenmez;
    // güvence için window 'resize' de dinlenir.
    mql.addEventListener('change', sync)
    window.addEventListener('resize', sync)
    return () => {
      mql.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [query])

  return matches
}
