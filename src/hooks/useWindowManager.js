import { useCallback, useRef, useState } from 'react'
import { getApp } from '../data/apps.js'

let seq = 1

/**
 * XP masaüstü pencere yöneticisi.
 * windows: [{ id, appId, x, y, w, h, z, minimized, maximized }]
 */
export function useWindowManager() {
  const [windows, setWindows] = useState([])
  const topZ = useRef(10)

  const focus = useCallback((id) => {
    topZ.current += 1
    const z = topZ.current
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)),
    )
  }, [])

  const open = useCallback(
    (appId) => {
      setWindows((ws) => {
        const existing = ws.find((w) => w.appId === appId)
        topZ.current += 1
        const z = topZ.current
        if (existing) {
          // Zaten açıksa öne getir + göster.
          return ws.map((w) =>
            w.appId === appId ? { ...w, z, minimized: false } : w,
          )
        }
        const app = getApp(appId)
        const size = app?.defaultSize ?? { w: 480, h: 420 }
        // Basit kaskad yerleşimi.
        const count = ws.length
        const x = 60 + (count % 5) * 28
        const y = 40 + (count % 5) * 26
        return [
          ...ws,
          {
            id: `win-${seq++}`,
            appId,
            x,
            y,
            w: size.w,
            h: size.h,
            z,
            minimized: false,
            maximized: false,
          },
        ]
      })
    },
    [],
  )

  const close = useCallback((id) => {
    setWindows((ws) => ws.filter((w) => w.id !== id))
  }, [])

  const minimize = useCallback((id) => {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    )
  }, [])

  const toggleMaximize = useCallback((id) => {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)),
    )
  }, [])

  const move = useCallback((id, x, y) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)))
  }, [])

  const reset = useCallback(() => setWindows([]), [])

  return { windows, open, close, focus, minimize, toggleMaximize, move, reset }
}
