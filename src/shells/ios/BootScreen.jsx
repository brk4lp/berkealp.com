import { useEffect } from 'react'

/**
 * iOS kısa açılış: siyah zemin, jenerik logo + spinner. ~1.5sn sonra
 * otomatik ilerler; dokun ile atlanır.
 */
export default function BootScreen({ onDone }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = setTimeout(onDone, reduced ? 500 : 1500)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div className="shell shell-ios ios-boot" onClick={onDone}>
      <div className="ios-boot-logo" aria-hidden="true">
        <span className="ios-boot-bite" />
      </div>
      <span className="ios-boot-spinner" aria-hidden="true" />
    </div>
  )
}
