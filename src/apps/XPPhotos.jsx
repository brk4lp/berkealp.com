import { useCallback, useEffect, useRef, useState } from 'react'
import { photos } from '../data/photos.js'
import '../styles/xp-photos.css'

// Small, colored toolbar glyphs match the surrounding XP shell.
function ToolIcon({ name }) {
  const picture = <><rect x="3" y="4" width="18" height="15" fill="#e9f6ff" stroke="#50759c" /><path d="m4 16 5-6 4 5 3-3 4 5v1H4Z" fill="#78a945" /><circle cx="16" cy="8" r="2" fill="#f7c646" /></>
  const symbols = {
    previous: <path d="m4 12 9-8v5h7v6h-7v5Z" fill="#65a438" stroke="#3e7420" />,
    next: <path d="m20 12-9-8v5H4v6h7v5Z" fill="#65a438" stroke="#3e7420" />,
    fit: <>{picture}<path d="M1 7V2h5m12 0h5v5M1 17v5h5m12 0h5v-5" fill="none" stroke="#315b94" /></>,
    actual: <><rect x="3" y="3" width="18" height="18" fill="#fff" stroke="#547093" /><path d="m6 9 2-2v10m7-8 2-2v10M11 10v1m0 3v1" stroke="#325a94" strokeWidth="1.8" /></>,
    zoomIn: <><circle cx="9" cy="9" r="6.5" fill="#e0f4ff" stroke="#377fb1" strokeWidth="2" /><path d="m14 14 7 7" stroke="#375581" strokeWidth="4" /><path d="M5 9h8M9 5v8" stroke="#345a7d" strokeWidth="1.6" /></>,
    zoomOut: <><circle cx="9" cy="9" r="6.5" fill="#e0f4ff" stroke="#377fb1" strokeWidth="2" /><path d="m14 14 7 7" stroke="#375581" strokeWidth="4" /><path d="M5 9h8" stroke="#345a7d" strokeWidth="1.6" /></>,
    play: <>{picture}<path d="m10 7 8 5-8 5Z" fill="#3178bf" stroke="#245693" /></>,
    pause: <><rect x="6" y="4" width="4" height="16" fill="#397abb" /><rect x="14" y="4" width="4" height="16" fill="#397abb" /></>,
    rotateLeft: <><path d="M5 9a8 8 0 1 1 0 8" fill="none" stroke="#4680bd" strokeWidth="2.5" /><path d="M3 3v8h8Z" fill="#4680bd" /></>,
    rotateRight: <><path d="M19 9a8 8 0 1 0 0 8" fill="none" stroke="#4680bd" strokeWidth="2.5" /><path d="M21 3v8h-8Z" fill="#4680bd" /></>,
    save: <><path d="M3 2h16l3 3v17H3Z" fill="#6d95c0" stroke="#385777" /><path d="M7 3h10v6H7Z" fill="#dce6ec" /><path d="M7 13h11v9H7Z" fill="#fff" stroke="#385777" /><path d="M14 3v5" stroke="#385777" strokeWidth="2" /></>,
    thumbnails: <>{[3, 13].flatMap((x) => [3, 13].map((y) => <g key={`${x}-${y}`}><rect x={x} y={y} width="8" height="8" fill="#cce4fa" stroke="#547da6" /><path d={`m${x + 1} ${y + 7} 3-4 3 4Z`} fill="#72a142" /></g>))}</>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{symbols[name]}</svg>
}

function ToolButton({ label, icon, ...props }) {
  return <button type="button" className="xp-picture-tool" aria-label={label} title={label} {...props}><ToolIcon name={icon} /></button>
}

export default function XPPhotos({ active = true }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [thumbnails, setThumbnails] = useState(false)
  const [failed, setFailed] = useState(false)
  const [natural, setNatural] = useState(null)
  const [space, setSpace] = useState({ width: 1, height: 1 })
  const root = useRef(null)
  const stage = useRef(null)
  const strip = useRef(null)
  const photo = photos[index]

  const resetView = useCallback(() => {
    setRotation(0)
    setZoom(null)
    setNatural(null)
    setFailed(false)
    if (stage.current) stage.current.scrollTo(0, 0)
  }, [])
  const step = useCallback((delta) => {
    if (!photos.length) return
    setIndex((current) => (current + delta + photos.length) % photos.length)
    resetView()
  }, [resetView])

  useEffect(() => {
    const element = stage.current
    const observer = new ResizeObserver(() => setSpace({ width: element.clientWidth, height: element.clientHeight }))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (active) root.current?.focus({ preventScroll: true })
    else setPlaying(false)
  }, [active])
  useEffect(() => {
    const pauseWhenHidden = () => { if (document.hidden) setPlaying(false) }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])
  useEffect(() => {
    if (!playing || !active || photos.length < 2) return
    const timer = window.setInterval(() => step(1), 3500)
    return () => window.clearInterval(timer)
  }, [playing, active, step])
  useEffect(() => {
    strip.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [index, thumbnails])

  const width = natural?.width || photo?.width || 1
  const height = natural?.height || photo?.height || 1
  const sideways = rotation % 180 !== 0
  const fit = Math.min(1, Math.max(1, space.width - 24) / (sideways ? height : width), Math.max(1, space.height - 24) / (sideways ? width : height))
  const scale = zoom ?? fit
  const changeZoom = (factor) => { setPlaying(false); setZoom(Math.max(.05, Math.min(4, scale * factor))) }
  const rotate = (delta) => { setPlaying(false); setRotation((value) => (value + delta + 360) % 360) }

  return <section className="xp-picture-viewer" ref={root} tabIndex={0} aria-label="Windows Picture and Fax Viewer" onKeyDown={(event) => {
    if (!active || !photo) return
    if (event.key === 'ArrowLeft') { event.preventDefault(); setPlaying(false); step(-1) }
    if (event.key === 'ArrowRight') { event.preventDefault(); setPlaying(false); step(1) }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(1.25) }
    if (event.key === '-') { event.preventDefault(); changeZoom(.8) }
    if (event.key === 'Escape') { setPlaying(false); setZoom(null) }
    if (event.key === 'F5') { event.preventDefault(); setPlaying((value) => !value) }
  }}>
    <div className="xp-picture-stage" ref={stage}>
      {!photo || failed ? <div className="xp-picture-empty">{photo ? 'No preview available.' : 'There are no pictures in this folder.'}</div> : <div className="xp-picture-surface" style={{ width: (sideways ? height : width) * scale + 24, height: (sideways ? width : height) * scale + 24 }}>
        <div className="xp-picture-bounds" style={{ width: (sideways ? height : width) * scale, height: (sideways ? width : height) * scale }}>
          <img key={photo.id} src={photo.src} alt={photo.alt || photo.title} draggable="false" style={{ width: width * scale, height: height * scale, transform: `translate(-50%, -50%) rotate(${rotation}deg)` }} onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setFailed(true)} onDoubleClick={() => setZoom((value) => value === null ? 1 : null)} />
        </div>
      </div>}
    </div>
    {thumbnails && <div className="xp-picture-thumbnails" ref={strip} aria-label="Picture thumbnails">{photos.map((item, itemIndex) => <button type="button" key={item.id} aria-label={`View ${item.title}`} aria-current={index === itemIndex ? 'true' : undefined} onClick={() => { setPlaying(false); setIndex(itemIndex); resetView() }}><img src={item.thumbnail || item.src} alt="" loading="lazy" /><span>{item.title}</span></button>)}</div>}
    <div className="xp-picture-toolbar" role="group" aria-label="Picture controls">
      <ToolButton label="Previous picture (Left arrow)" icon="previous" disabled={photos.length < 2} onClick={() => { setPlaying(false); step(-1) }} />
      <ToolButton label="Next picture (Right arrow)" icon="next" disabled={photos.length < 2} onClick={() => { setPlaying(false); step(1) }} />
      <span className="xp-picture-separator" />
      <ToolButton label="Best fit" icon="fit" disabled={!photo || failed} aria-pressed={zoom === null} onClick={() => setZoom(null)} />
      <ToolButton label="Actual size" icon="actual" disabled={!photo || failed} aria-pressed={zoom === 1} onClick={() => { setPlaying(false); setZoom(1) }} />
      <ToolButton label={playing ? 'Pause slide show (F5)' : 'Start slide show (F5)'} icon={playing ? 'pause' : 'play'} disabled={photos.length < 2} aria-pressed={playing} onClick={() => { setZoom(null); setPlaying((value) => !value) }} />
      <span className="xp-picture-separator" />
      <ToolButton label="Zoom in (+)" icon="zoomIn" disabled={!photo || failed || scale >= 4} onClick={() => changeZoom(1.25)} />
      <ToolButton label="Zoom out (-)" icon="zoomOut" disabled={!photo || failed || scale <= .05} onClick={() => changeZoom(.8)} />
      <span className="xp-picture-separator" />
      <ToolButton label="Rotate counterclockwise" icon="rotateLeft" disabled={!photo || failed} onClick={() => rotate(-90)} />
      <ToolButton label="Rotate clockwise" icon="rotateRight" disabled={!photo || failed} onClick={() => rotate(90)} />
      <span className="xp-picture-separator" />
      {photo && <a className="xp-picture-tool" href={photo.src} download title="Save a copy" aria-label="Save a copy"><ToolIcon name="save" /></a>}
      <ToolButton label={thumbnails ? 'Hide thumbnails' : 'Show thumbnails'} icon="thumbnails" disabled={!photo} aria-expanded={thumbnails} onClick={() => setThumbnails((value) => !value)} />
    </div>
    <footer className="xp-picture-status"><span aria-live="polite">{photo?.title || 'No pictures'}{playing ? ' — Slide show' : ''}</span><span>{photo ? `${index + 1} of ${photos.length}` : '0 pictures'}</span><span>{photo && !failed ? `${Math.round(scale * 100)}%` : ''}</span></footer>
  </section>
}
