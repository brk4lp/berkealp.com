import { useEffect } from 'react'

/**
 * XP tarzı açılış (boot) ekranı: siyah zemin, logo ve segmentli kayan
 * yükleme çubuğu. ~2.5sn sonra otomatik ilerler; tıkla/Enter ile atlanır.
 */
export default function BootScreen({ onDone }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = setTimeout(onDone, reduced ? 600 : 2500)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div
      className="shell shell-xp xp-boot"
      role="button"
      tabIndex={0}
      onClick={onDone}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDone()}
    >
      <div className="xp-boot-center">
        <div className="xp-boot-brand">
          <span className="xp-boot-flag" aria-hidden="true">
            <span className="start-flag-r" />
            <span className="start-flag-g" />
            <span className="start-flag-b" />
            <span className="start-flag-y" />
          </span>
        </div>
        <div className="xp-boot-bar" aria-hidden="true">
          <div className="xp-boot-bar-track">
            <span className="xp-boot-bar-blocks" />
          </div>
        </div>
      </div>
      <div className="xp-boot-footer">
        <span>Loading…</span>
        <span className="xp-boot-skip">click to skip</span>
      </div>
    </div>
  )
}
