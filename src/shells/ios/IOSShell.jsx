import { useRef, useState } from 'react'
import { mobileApps as apps, getApp } from '../../data/apps.js'
import { sound } from '../../lib/sound.js'
import AppIcon from './AppIcon.jsx'
import AppView from './AppView.jsx'
import StatusBar from './StatusBar.jsx'
import BootScreen from './BootScreen.jsx'
import LockScreen from './LockScreen.jsx'
import Spotlight from './Spotlight.jsx'
import { FolderIcon, FolderOverlay } from './Folder.jsx'

// Sayfalar: 0 = Spotlight, 1 = Ana ekran (app'ler + Links klasörü)
const PAGE_COUNT = 2

export default function IOSShell() {
  const [stage, setStage] = useState('boot')
  const [page, setPage] = useState(1)
  const [dragDx, setDragDx] = useState(0)
  const [activeId, setActiveId] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [folderOpen, setFolderOpen] = useState(false)
  const drag = useRef(null)
  const active = activeId ? getApp(activeId) : null

  const openApp = (id, e) => {
    const app = getApp(id)
    if (!app) return
    if (e?.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect()
      setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    } else {
      setOrigin(null)
    }
    sound.open()
    setActiveId(id)
  }

  const goHome = () => {
    if (active) sound.close()
    setActiveId(null)
    setFolderOpen(false)
  }

  // --- Pager swipe ---
  // Dokunuşları bozmamak için: yalnızca yatay hareket eşiği aşılınca pointer
  // yakalanır (böylece ikon/klasör/Spotlight tıkları normal çalışır).
  const onPointerDown = (e) => {
    drag.current = {
      startX: e.clientX,
      w: e.currentTarget.clientWidth,
      captured: false,
      pointerId: e.pointerId,
    }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    let dx = e.clientX - drag.current.startX
    if (!drag.current.captured) {
      if (Math.abs(dx) < 8) return // henüz kaydırma sayılmaz -> tık olabilir
      drag.current.captured = true
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* yoksay */
      }
    }
    // Kenarlarda direnç
    if ((page === 0 && dx > 0) || (page === PAGE_COUNT - 1 && dx < 0)) dx *= 0.3
    setDragDx(dx)
  }
  const onPointerUp = (e) => {
    if (!drag.current) return
    const { w, captured } = drag.current
    drag.current = null
    if (!captured) return // tık: sayfa değişimi yok
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* yoksay */
    }
    const threshold = w * 0.22
    let next = page
    if (dragDx <= -threshold) next = Math.min(page + 1, PAGE_COUNT - 1)
    else if (dragDx >= threshold) next = Math.max(page - 1, 0)
    if (next !== page) sound.click()
    setPage(next)
    setDragDx(0)
  }

  if (stage === 'boot') {
    return <BootScreen onDone={() => setStage('lock')} />
  }
  if (stage === 'lock') {
    return <LockScreen onUnlock={() => setStage('home')} />
  }

  const trackStyle = {
    transform: `translateX(calc(${-page * 100}% + ${dragDx}px))`,
    transition: drag.current ? 'none' : 'transform 0.28s ease',
  }

  return (
    <div className="shell shell-ios ios-home">
      <div className={`ios-springboard${active ? ' pushed' : ''}`}>
        <StatusBar />

        <div
          className="ios-pager-viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className="ios-pager-track" style={trackStyle}>
            {/* Sayfa 0: Spotlight */}
            <div className="ios-page">
              <Spotlight onOpenApp={(id) => openApp(id)} />
            </div>

            {/* Sayfa 1: Ana ekran */}
            <div className="ios-page">
              <div className="ios-grid">
                {apps.map((app) => (
                  <AppIcon
                    key={app.id}
                    app={app}
                    onOpen={(e) => openApp(app.id, e)}
                  />
                ))}
                <FolderIcon onOpen={() => setFolderOpen(true)} />
              </div>
            </div>
          </div>
        </div>

        {/* Sayfa noktaları */}
        <div className="ios-page-dots">
          {Array.from({ length: PAGE_COUNT }).map((_, i) => (
            <span
              key={i}
              className={`dot${i === page ? ' active' : ''}${
                i === 0 ? ' search' : ''
              }`}
            >
              {i === 0 ? '🔍' : ''}
            </span>
          ))}
        </div>

        {/* Dock: hızlı bağlantılar */}
        <div className="ios-dock">
          {apps.map((app) => (
            <button
              key={app.id}
              className="ios-app dock-app"
              onClick={(e) => openApp(app.id, e)}
            >
              <span
                className="ios-app-tile"
                style={{
                  background: `linear-gradient(to bottom, ${app.tint[0]}, ${app.tint[1]})`,
                }}
              >
                <span className="ios-app-gloss" aria-hidden="true" />
                <span className="ios-app-glyph">
                  <app.Glyph />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Klasör overlay */}
      {folderOpen && <FolderOverlay onClose={() => setFolderOpen(false)} />}

      {/* Açık uygulama */}
      {active && (
        <div className="ios-app-layer">
          <AppView app={active} origin={origin} />
        </div>
      )}

      {/* Fiziksel home tuşu */}
      <div className="ios-homebar">
        <button
          className="ios-home-button"
          aria-label="Home"
          onClick={goHome}
        >
          <span className="home-square" />
        </button>
      </div>
    </div>
  )
}
