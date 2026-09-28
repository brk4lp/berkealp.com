import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useContent } from '../data/ContentContext.jsx'
import { navigate } from '../lib/navigation.js'
import IOSAppHeader from '../shells/ios/IOSAppHeader.jsx'
import '../styles/photos.css'

function Icon({ name, filled = false }) {
  const paths = {
    library: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    albums: <><rect x="5" y="7" width="16" height="14" rx="2" /><path d="M3 17V5a2 2 0 0 1 2-2h12M8 16l4-4 3 3 2-2 4 4" /></>,
    search: <><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></>,
    heart: <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />,
    back: <path d="m15 4-8 8 8 8" />,
    next: <path d="m9 4 8 8-8 8" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.1" /></>,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
  }
  return <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function PhotoImage({ photo, thumbnail = false, ...props }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="photos-image-error">Photo unavailable</span>
  return <img src={thumbnail ? photo.thumbnail || photo.src : photo.src} alt={photo.alt || photo.title} loading={thumbnail ? 'lazy' : 'eager'} decoding="async" onError={() => setFailed(true)} draggable="false" {...props} />
}

function readFavorites(photos) {
  try {
    const stored = JSON.parse(localStorage.getItem('berke-photos-favorites') || '[]')
    return Array.isArray(stored) ? stored.filter((id) => photos.some((photo) => photo.id === id)) : []
  } catch { return [] }
}

function dateLabel(photo, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!photo.date) return null
  const date = new Date(`${photo.date.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-US', options)
}

function Viewer({ items, initialId, favorites, onFavorite, onClose }) {
  const [index, setIndex] = useState(() => items.findIndex((photo) => photo.id === initialId))
  const [info, setInfo] = useState(false)
  const [zoom, setZoom] = useState(false)
  const dialog = useRef(null)
  const strip = useRef(null)
  const touch = useRef(null)
  const photo = items[index]
  const change = (next) => { setIndex(Math.max(0, Math.min(items.length - 1, next))); setZoom(false) }

  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  useEffect(() => {
    strip.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [index])

  return createPortal(
    <dialog className="photos-viewer" ref={dialog} aria-label="Photo viewer" onCancel={onClose} onKeyDown={(event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); change(index + 1) }
      if (event.key === 'ArrowLeft') { event.preventDefault(); change(index - 1) }
    }}>
      <header className="photos-viewer-header">
        <button className="photos-icon-button" onClick={onClose} aria-label="Back to photos" autoFocus><Icon name="back" /></button>
        <div aria-live="polite"><strong>{photo.location || dateLabel(photo) || photo.title}</strong><span>{photo.location ? dateLabel(photo) : `${index + 1} of ${items.length}`}</span></div>
        <button className="photos-icon-button" onClick={onClose} aria-label="Close photo"><Icon name="close" /></button>
      </header>
      <div className={`photos-stage${zoom ? ' is-zoomed' : ''}`} onTouchStart={(event) => {
        touch.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null
      }} onTouchEnd={(event) => {
        if (!touch.current || zoom) return
        const dx = event.changedTouches[0].clientX - touch.current.x
        const dy = event.changedTouches[0].clientY - touch.current.y
        touch.current = null
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) change(index + (dx < 0 ? 1 : -1))
      }} onTouchCancel={() => { touch.current = null }}>
        <div className="photos-image-canvas" onDoubleClick={() => setZoom((value) => !value)}>
          <PhotoImage key={photo.id} photo={photo} />
        </div>
        {!zoom && <><button className="photos-stage-prev photos-icon-button" disabled={index === 0} onClick={() => change(index - 1)} aria-label="Previous photo"><Icon name="back" /></button><button className="photos-stage-next photos-icon-button" disabled={index === items.length - 1} onClick={() => change(index + 1)} aria-label="Next photo"><Icon name="next" /></button></>}
      </div>
      {info && <section className="photos-info" aria-label="Photo information">
        <strong>{photo.title}</strong>
        {photo.caption && <p>{photo.caption}</p>}
        <dl><div><dt>Album</dt><dd>{photo.album || 'Camera Roll'}</dd></div>
          {photo.width && <div><dt>Original dimensions</dt><dd>{photo.width} × {photo.height}</dd></div>}
          <div><dt>Date taken</dt><dd>{dateLabel(photo) || 'Not available'}</dd></div>
          {photo.location && <div><dt>Location</dt><dd>{photo.location}</dd></div>}
          {photo.coordinates && <div><dt>Map</dt><dd><a href={`https://www.openstreetmap.org/?mlat=${photo.coordinates.lat}&mlon=${photo.coordinates.lng}#map=15/${photo.coordinates.lat}/${photo.coordinates.lng}`} target="_blank" rel="noreferrer">View location ↗</a></dd></div>}
          {photo.tags?.length > 0 && <div><dt>Tags</dt><dd>{photo.tags.join(', ')}</dd></div>}
        </dl>
      </section>}
      <div className="photos-filmstrip" ref={strip} aria-label="Photo thumbnails">{items.map((item, i) => <button key={item.id} aria-label={`View ${item.title}`} aria-current={i === index ? 'true' : undefined} onClick={() => change(i)}><PhotoImage photo={item} thumbnail /></button>)}</div>
      <footer className="photos-viewer-tools">
        <a href={photo.src} download aria-label="Download photo"><Icon name="download" /></a>
        <button aria-label={favorites.includes(photo.id) ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={favorites.includes(photo.id)} onClick={() => onFavorite(photo.id)}><Icon name="heart" filled={favorites.includes(photo.id)} /></button>
        <button aria-label="Photo information" aria-expanded={info} onClick={() => setInfo((value) => !value)}><Icon name="info" /></button>
        <button aria-label={zoom ? 'Zoom out' : 'Zoom in'} aria-pressed={zoom} onClick={() => setZoom((value) => !value)}><Icon name={zoom ? 'minus' : 'plus'} /></button>
      </footer>
    </dialog>, document.body,
  )
}

export default function Photos() {
  const { photos } = useContent()
  const [tab, setTab] = useState('library')
  const [album, setAlbum] = useState(null)
  const [query, setQuery] = useState('')
  const [grouping, setGrouping] = useState('All Photos')
  const [density, setDensity] = useState(1)
  const [favorites, setFavorites] = useState(() => readFavorites(photos))
  const [viewer, setViewer] = useState(null)
  const pinch = useRef(null)
  const lastOpened = useRef(null)

  const toggleFavorite = (id) => setFavorites((current) => {
    const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    try { localStorage.setItem('berke-photos-favorites', JSON.stringify(next)) } catch { /* Session-only when storage is unavailable. */ }
    return next
  })
  const albums = useMemo(() => ['All Photos', 'Favorites', ...new Set(photos.map((photo) => photo.album || 'Camera Roll'))], [photos])
  const albumPhotos = (name) => name === 'All Photos' ? photos : name === 'Favorites' ? photos.filter((photo) => favorites.includes(photo.id)) : photos.filter((photo) => (photo.album || 'Camera Roll') === name)
  const visible = (album ? albumPhotos(album) : photos).filter((photo) => tab !== 'search' || `${photo.title} ${photo.alt || ''} ${photo.location || ''} ${photo.album || ''} ${photo.date || ''} ${(photo.tags || []).join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const groups = new Map()
  for (const photo of visible) {
    const key = grouping === 'All Photos' || tab !== 'library' ? '' : dateLabel(photo, grouping === 'Years' ? { year: 'numeric' } : { year: 'numeric', month: 'long' }) || 'Undated'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(photo)
  }
  const switchTab = (next) => { setTab(next); setAlbum(null); setQuery('') }
  const showAlbums = tab === 'albums' && !album
  const title = album || (tab === 'library' ? 'Library' : tab === 'albums' ? 'Albums' : 'Search')

  return <section className={`photos-app photos-density-${density}`} aria-label="Photos">
    <IOSAppHeader title={title} onHome={() => navigate('/')} subtitle={!showAlbums ? `${visible.length} ${visible.length === 1 ? 'Photo' : 'Photos'}` : undefined} actions={<>
        {album && <button className="photos-albums-back" onClick={() => setAlbum(null)}><Icon name="back" />Albums</button>}
        {!showAlbums && <div className="photos-density-controls" aria-label="Thumbnail size"><button aria-label="Smaller thumbnails" disabled={density === 2} onClick={() => setDensity((value) => value + 1)}><Icon name="minus" /></button><button aria-label="Larger thumbnails" disabled={density === 0} onClick={() => setDensity((value) => value - 1)}><Icon name="plus" /></button></div>}
      </>}>
      {tab === 'search' && <label className="photos-search"><Icon name="search" /><input type="search" placeholder="Photos, albums, places" aria-label="Search photos" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus /></label>}
    </IOSAppHeader>
    <div className="photos-scroll" onTouchStart={(event) => {
      if (event.touches.length === 2) pinch.current = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY)
    }} onTouchEnd={() => { pinch.current = null }} onTouchCancel={() => { pinch.current = null }} onTouchMove={(event) => {
      if (!pinch.current || event.touches.length !== 2) return
      const distance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY)
      if (Math.abs(distance - pinch.current) > 45) {
        const direction = distance < pinch.current ? 1 : -1
        setDensity((value) => Math.max(0, Math.min(2, value + direction)))
        pinch.current = distance
      }
    }}>
      {showAlbums ? <div className="photos-albums"><h2>My Albums</h2><div className="photos-album-grid">{albums.map((name) => {
        const items = albumPhotos(name)
        return <button className="photos-album" key={name} aria-label={`${name}, ${items.length} ${items.length === 1 ? 'photo' : 'photos'}`} onClick={() => setAlbum(name)}><span className="photos-album-cover">{items[0] ? <PhotoImage photo={items[0]} thumbnail /> : <Icon name={name === 'Favorites' ? 'heart' : 'albums'} />}{name === 'Favorites' && items[0] && <span className="photos-album-heart"><Icon name="heart" filled /></span>}</span><strong>{name}</strong><span>{items.length}</span></button>
      })}</div></div> : <>
        {[...groups].map(([label, items]) => <section key={label} className="photos-group">{label && <h2>{label}</h2>}<div className="photos-grid">{items.map((photo) => <button key={photo.id} className="photos-tile" aria-label={`Open ${photo.title}`} onClick={(event) => { lastOpened.current = event.currentTarget; setViewer({ initialId: photo.id, items: visible }) }}><PhotoImage photo={photo} thumbnail />{favorites.includes(photo.id) && <span className="photos-tile-heart"><Icon name="heart" filled /></span>}</button>)}</div></section>)}
        {visible.length === 0 && <div className="photos-empty"><Icon name={tab === 'search' ? 'search' : album === 'Favorites' ? 'heart' : 'library'} /><h2>{query ? 'No Results' : album === 'Favorites' ? 'No Favorites Yet' : 'No Photos Yet'}</h2><p>{query ? `No photos match “${query}”.` : album === 'Favorites' ? 'Tap the heart on a photo to keep it here.' : 'Photos will appear here when added to the collection.'}</p></div>}
        {visible.length > 0 && <p className="photos-end-count">{visible.length} {visible.length === 1 ? 'Photo' : 'Photos'}</p>}
      </>}
    </div>
    {tab === 'library' && <div className="photos-timeline" aria-label="Group photos">{['Years', 'Months', 'All Photos'].map((name) => <button key={name} aria-pressed={grouping === name} onClick={() => setGrouping(name)}>{name}</button>)}</div>}
    <nav className="photos-tabbar" aria-label="Photos navigation">{[['library', 'Library'], ['albums', 'Albums'], ['search', 'Search']].map(([id, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => switchTab(id)}><Icon name={id} /><span>{label}</span></button>)}</nav>
    {viewer && <Viewer {...viewer} favorites={favorites} onFavorite={toggleFavorite} onClose={() => { setViewer(null); requestAnimationFrame(() => lastOpened.current?.focus()) }} />}
  </section>
}
