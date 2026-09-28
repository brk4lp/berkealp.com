import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapPicker({ coordinates, onChange }) {
  const container = useRef(null)
  const callback = useRef(onChange)
  const marker = useRef(null)
  const [open, setOpen] = useState(false)
  callback.current = onChange
  useEffect(() => {
    if (!open) return
    const center = coordinates ? [coordinates.lat, coordinates.lng] : [38.4237, 27.1428]
    const map = L.map(container.current).setView(center, coordinates ? 12 : 4)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map)
    const dot = latlng => {
      marker.current?.remove()
      marker.current = L.circleMarker(latlng, { radius: 8, color: '#fff', weight: 3, fillColor: '#2763db', fillOpacity: 1 }).addTo(map)
    }
    if (coordinates) dot(center)
    map.on('click', e => {
      const location = e.latlng.wrap()
      dot(location)
      callback.current({ lat: Number(location.lat.toFixed(6)), lng: Number(location.lng.toFixed(6)) })
    })
    return () => { marker.current = null; map.remove() }
  }, [open])
  return <div className="map-picker">
    <button type="button" className="secondary" onClick={() => setOpen(!open)}>{open ? 'Haritayı kapat' : 'Haritadan konum seç'}</button>
    {coordinates && <button type="button" className="text-button" onClick={() => { onChange(null); marker.current?.remove() }}>Noktayı kaldır</button>}
    {open && <><p className="hint">Haritada bir noktaya tıkla. Yer adını üstteki alana yazabilirsin.</p><div ref={container} className="location-map" /></>}
    {coordinates && <p className="hint">{coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</p>}
  </div>
}
