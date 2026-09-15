import { useEffect, useMemo, useState } from 'react'
import { navigate, routeApp, usePath } from '../../lib/navigation.js'
import { desktopApps as apps, getApp } from '../../data/apps.js'
import { useWindowManager } from '../../hooks/useWindowManager.js'
import { sound } from '../../lib/sound.js'
import { outboundHref } from '../../data/outbound.js'
import Window from './Window.jsx'
import DesktopIcon from './DesktopIcon.jsx'
import Taskbar from './Taskbar.jsx'
import StartMenu from './StartMenu.jsx'
import BootScreen from './BootScreen.jsx'
import LogonScreen from './LogonScreen.jsx'
import CVView from './CVView.jsx'
import ContextMenu from './ContextMenu.jsx'
import TrayBalloon from './TrayBalloon.jsx'
import PropertiesDialog from './PropertiesDialog.jsx'

export default function XPShell() {
  // Açılış akışı: boot -> logon -> (desktop | cv)
  const path = usePath()
  const [stage, setStage] = useState(path === '/' ? 'boot' : path === '/cv' ? 'cv' : 'desktop')
  const wm = useWindowManager()
  const [startOpen, setStartOpen] = useState(false)
  const [menu, setMenu] = useState(null) // { x, y }
  const [showProps, setShowProps] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { open, minimizeAll } = wm
  useEffect(() => {
    const id = routeApp(path)
    if (path === '/cv') setStage('cv')
    else if (id) { setStage('desktop'); open(id) }
    else { minimizeAll(); setStage((current) => current === 'cv' ? 'desktop' : current) }
    setStartOpen(false)
  }, [path, open, minimizeAll])

  const reveal = (appId) => {
    const next = `/${appId}`
    if (routeApp(path) !== appId) navigate(next)
  }
  const routeAfterHide = (id) => {
    if (id !== activeId) return
    const next = wm.windows.filter((w) => w.id !== id && !w.minimized).sort((a, b) => b.z - a.z)[0]
    navigate(next ? `/${next.appId}` : '/')
  }

  // En üstteki (odaklı) pencere = en yüksek z, minimize değil.
  const activeId = useMemo(() => {
    const visible = wm.windows.filter((w) => !w.minimized)
    if (!visible.length) return null
    return visible.reduce((a, b) => (b.z > a.z ? b : a)).id
  }, [wm.windows])

  const openApp = (id) => {
    const app = getApp(id)
    if (!app) return
    if (app.externalUrl) {
      sound.click()
      window.open(outboundHref(app.externalUrl), '_blank', 'noopener,noreferrer')
      return
    }
    const existing = wm.windows.find((w) => w.appId === id)
    if (existing && existing.minimized) sound.restore()
    else if (!existing) sound.open()
    else sound.click()
    wm.open(id)
    reveal(id)
  }

  const closeWin = (id) => {
    sound.close()
    wm.close(id)
    routeAfterHide(id)
  }

  const minimizeWin = (id) => {
    sound.minimize()
    wm.minimize(id)
    routeAfterHide(id)
  }

  const handleTaskbarSelect = (id) => {
    const win = wm.windows.find((w) => w.id === id)
    if (win && !win.minimized && id === activeId) {
      minimizeWin(id) // aktif sekmeye tekrar tıkla -> küçült
    } else {
      if (win?.minimized) sound.restore()
      else sound.click()
      wm.focus(id)
      if (win) reveal(win.appId)
    }
  }

  const logOff = () => {
    setStartOpen(false)
    wm.reset()
    setStage('logon')
    navigate('/')
  }

  const openContextMenu = (e) => {
    e.preventDefault()
    setStartOpen(false)
    setMenu({ x: e.clientX, y: e.clientY })
  }

  const contextItems = [
    {
      label: 'Refresh',
      onClick: () => {
        sound.click()
        setRefreshKey((k) => k + 1)
      },
    },
    { label: 'Arrange Icons', onClick: () => sound.click() },
    { separator: true },
    { label: 'Properties', onClick: () => setShowProps(true) },
  ]

  if (stage === 'boot') {
    return <BootScreen onDone={() => setStage('logon')} />
  }

  if (stage === 'logon') {
    return <LogonScreen onSelect={(id) => { setStage(id); if (id === 'cv') navigate('/cv') }} />
  }

  if (stage === 'cv') {
    return <CVView onSwitchUser={logOff} />
  }

  return (
    <div
      className="shell shell-xp xp-desktop"
      onContextMenu={openContextMenu}
    >
      <div className={`xp-icons xp-refresh-${refreshKey % 2}`}>
        {apps.map((app) => (
          <DesktopIcon key={app.id} app={app} onOpen={() => openApp(app.id)} />
        ))}
      </div>

      {wm.windows.map((w) => {
        const app = getApp(w.appId)
        if (!app) return null
        const Body = app.Component
        return (
          <Window
            key={w.id}
            win={w}
            title={app.title}
            app={app}
            onClose={() => closeWin(w.id)}
            onMinimize={() => minimizeWin(w.id)}
            onToggleMaximize={() => wm.toggleMaximize(w.id)}
            onFocus={() => { wm.focus(w.id); reveal(w.appId) }}
            onMove={(x, y) => wm.move(w.id, x, y)}
          >
            <Body />
          </Window>
        )
      })}

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={contextItems}
          onClose={() => setMenu(null)}
        />
      )}

      {showProps && <PropertiesDialog onClose={() => setShowProps(false)} />}

      {startOpen && (
        <StartMenu
          onOpen={openApp}
          onClose={() => setStartOpen(false)}
          onLogOff={logOff}
        />
      )}

      <TrayBalloon />

      <Taskbar
        windows={wm.windows}
        activeId={activeId}
        startOpen={startOpen}
        onToggleStart={() => {
          sound.click()
          setStartOpen((s) => !s)
        }}
        onSelectWindow={handleTaskbarSelect}
      />
    </div>
  )
}
