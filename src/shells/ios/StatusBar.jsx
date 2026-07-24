import { useEffect, useState } from 'react'

/**
 * iOS 5 durum çubuğu — dekoratif sinyal/wifi/pil + canlı saat.
 * dark: uygulama içi (koyu metin) vs ana ekran (beyaz metin) varyantı.
 */
export default function StatusBar({ dark = false }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 20)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`ios-statusbar${dark ? ' dark' : ''}`}>
      <div className="sb-left">
        <span className="sb-signal" aria-hidden="true">
          <i style={{ height: 4 }} />
          <i style={{ height: 6 }} />
          <i style={{ height: 8 }} />
          <i style={{ height: 10 }} />
          <i style={{ height: 12 }} />
        </span>
        <span className="sb-carrier">berkealp</span>
        <span className="sb-wifi" aria-hidden="true">
          <span className="wifi-arc a1" />
          <span className="wifi-arc a2" />
          <span className="wifi-dot" />
        </span>
      </div>

      <div className="sb-center">{time}</div>

      <div className="sb-right">
        <span className="sb-pct">87%</span>
        <span className="sb-battery" aria-hidden="true">
          <span className="batt-fill" style={{ width: '87%' }} />
        </span>
      </div>
    </div>
  )
}
