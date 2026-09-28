import { useRef, useState } from 'react'

export default function ReviewEditor({ photo, onSubmit, onClose, busy }) {
  const [detections, setDetections] = useState(photo.detections || [])
  const [selected, setSelected] = useState(-1)
  const [mode, setMode] = useState('select')
  const [labels, setLabels] = useState(photo.labels !== false)
  const gesture = useRef(null)
  const svg = useRef(null)
  const point = event => {
    const rect = svg.current.getBoundingClientRect()
    return [Math.max(0, Math.min(photo.width, (event.clientX - rect.left) / rect.width * photo.width)),
      Math.max(0, Math.min(photo.height, (event.clientY - rect.top) / rect.height * photo.height))]
  }
  const changeBox = (index, box) => setDetections(current => current.map((d, i) => i === index ? { ...d, box } : d))
  const down = (event, index = -1, resize = false) => {
    if (event.button !== 0) return
    event.preventDefault(); event.stopPropagation()
    svg.current.setPointerCapture(event.pointerId)
    const start = point(event)
    if (mode !== 'select') {
      const next = detections.length
      setDetections([...detections, { kind: mode, box: [...start, start[0] + 1, start[1] + 1] }])
      setSelected(next); gesture.current = { start, index: next, action: 'draw' }
    } else if (index >= 0) {
      setSelected(index); gesture.current = { start, index, action: resize ? 'resize' : 'move', box: detections[index].box }
    } else setSelected(-1)
  }
  const move = event => {
    const g = gesture.current
    if (!g) return
    const [x, y] = point(event)
    if (g.action === 'draw') changeBox(g.index, [Math.min(x,g.start[0]), Math.min(y,g.start[1]), Math.max(x,g.start[0])+1, Math.max(y,g.start[1])+1])
    else if (g.action === 'resize') changeBox(g.index, [g.box[0], g.box[1], Math.max(g.box[0]+2,x), Math.max(g.box[1]+2,y)])
    else {
      const dx = Math.max(-g.box[0], Math.min(photo.width-g.box[2], x-g.start[0]))
      const dy = Math.max(-g.box[1], Math.min(photo.height-g.box[3], y-g.start[1]))
      changeBox(g.index, [g.box[0]+dx,g.box[1]+dy,g.box[2]+dx,g.box[3]+dy])
    }
  }
  return <div className="modal-backdrop"><section className="review-dialog" role="dialog" aria-modal="true" aria-label="Fotoğrafı incele">
    <header className="dialog-head"><div><span className="eyebrow">FOTOĞRAF İNCELEME</span><h2>{photo.title}</h2></div><button onClick={onClose} aria-label="İncelemeyi kapat">✕</button></header>
    <div className="review-toolbar">
      {[['select','Seç / taşı'],['person','Kişi kutusu'],['face','Yüz mozaiği'],['plate','Plaka mozaiği']].map(([value,label]) => <button key={value} className={mode === value ? 'primary' : 'secondary'} onClick={() => setMode(value)} disabled={!photo.canReview}>{label}</button>)}
      <label className="check"><input type="checkbox" checked={labels} onChange={e=>setLabels(e.target.checked)} disabled={!photo.canReview}/>Person etiketleri</label>
    </div>
    {photo.canReview ? <p className="hint">Yeni alan için sürükle. Seçili kutuyu taşı veya sağ alt köşesinden boyutlandır. Kutuyu silmek diğer mozaik alanlarını kaldırmaz.</p> : <p className="notice">Bu fotoğraf hazır işlenmiş olarak eklendi. Kutuları düzenlemek için orijinalini “Pipeline ile işle” seçeneğiyle yükle.</p>}
    <div className="review-images">
      <div><h3>{photo.original ? 'Orijinal · özel' : 'Mevcut fotoğraf'}</h3><div className="annotation-stage" style={{aspectRatio:`${photo.width}/${photo.height}`}}>
        <img src={photo.original || photo.src} alt="İncelenen fotoğraf" />
        {photo.canReview && <svg ref={svg} viewBox={`0 0 ${photo.width} ${photo.height}`} onPointerDown={down} onPointerMove={move} onPointerUp={()=>{gesture.current=null}} onPointerCancel={()=>{gesture.current=null}}>
          {detections.map((d,i)=><g key={i} className={`box-${d.kind}${selected===i?' selected':''}`}>
            <rect x={d.box[0]} y={d.box[1]} width={d.box[2]-d.box[0]} height={d.box[3]-d.box[1]} onPointerDown={e=>down(e,i)}/>
            {selected===i && <circle cx={d.box[2]} cy={d.box[3]} r={Math.max(photo.width/60,8)} onPointerDown={e=>down(e,i,true)} />}
          </g>)}
        </svg>}
      </div></div>
      <div><h3>İşlenmiş çıktı</h3><img className="review-result" src={photo.src} alt="İşlenmiş fotoğraf" /></div>
    </div>
    {photo.canReview && <div className="region-list"><select aria-label="Düzenlenecek bölge" value={selected} onChange={e=>setSelected(Number(e.target.value))}><option value={-1}>Bölge seç</option>{detections.map((d,i)=><option key={i} value={i}>{i+1} · {d.kind}</option>)}</select>
      {selected>=0 && detections[selected] && <><button className="danger text-button" onClick={()=>{setDetections(detections.filter((_,i)=>i!==selected));setSelected(-1)}}>Bölgeyi sil</button>{['Sol','Üst','Sağ','Alt'].map((name,i)=><label key={name}>{name}<input type="number" value={Math.round(detections[selected].box[i])} onChange={e=>changeBox(selected,detections[selected].box.map((v,j)=>j===i?Number(e.target.value):v))}/></label>)}</>}
    </div>}
    {!!photo.warnings?.length && <details><summary>{photo.warnings.length} otomatik kontrol notu</summary><ul>{photo.warnings.map((w,i)=><li key={i}>{w.code} · {w.person_id || w.face_id || w.plate_id}</li>)}</ul></details>}
    <footer className="dialog-footer"><button className="secondary" onClick={onClose}>Kapat</button>{photo.canReview && <button className="primary" disabled={busy} onClick={()=>onSubmit({id:photo.id,detections,labels})}>Düzenlemeleri işle</button>}</footer>
  </section></div>
}
