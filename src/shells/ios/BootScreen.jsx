import { useEffect } from 'react'
import appleBootLogo from '../../../icons/apple-boot-logo.png'

/**
 * iOS kısa açılış: siyah zemin, Apple logo + spinner. ~1.5sn sonra
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
      <img className="ios-boot-logo" src={appleBootLogo} alt="" />
      <span className="ios-boot-spinner" aria-hidden="true" />
    </div>
  )
}
