import React, { useEffect, useRef, useState } from 'react'
import Markdown from '../apps/Markdown.jsx'
import MapPicker from './MapPicker.jsx'
import ReviewEditor from './ReviewEditor.jsx'
import './studio.css'

const tabs = [['overview','Genel bakış','◫'],['photos','Fotoğraflar','▧'],['projects','Projeler','▣'],['posts','Blog','≡'],['publish','Yayın merkezi','↗']]
const names = {photos:'Fotoğraflar',projects:'Projeler',posts:'Blog yazıları'}
const slug = text => text.toLowerCase().replaceAll('ı','i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)
const splitTags = text => [...new Set(text.split(',').map(s=>s.trim()).filter(Boolean))]
const stamp = value => new Date(value).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'})
function Icon({name}) { return <span aria-hidden="true" className="icon">{name}</span> }
function Field({label,children,hint}) { return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label> }
function Pill({children,tone=''}) { return <span className={`pill ${tone}`}>{children}</span> }

export default function Studio() {
  const [state,setState] = useState(null)
  const [tab,setTab] = useState('overview')
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('all')
  const [selected,setSelected] = useState([])
  const [editor,setEditor] = useState(null)
  const [review,setReview] = useState(null)
  const [bulk,setBulk] = useState(false)
  const [preview,setPreview] = useState(null)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [uploadMode,setUploadMode] = useState('processed')
  const [dragging,setDragging] = useState(false)
  const uploadInput = useRef(null)
  useEffect(()=>{
    if(!editor&&!review&&!bulk&&!preview)return
    const dialog=document.querySelector('[role="dialog"]')
    if(!dialog)return
    const previous=document.activeElement
    const background=[...document.querySelectorAll('.studio-sidebar,.studio-main')]
    background.forEach(element=>{element.inert=true})
    const focusable=()=>[...dialog.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(element=>!element.disabled&&element.getClientRects().length)
    focusable()[0]?.focus()
    const keydown=event=>{
      if(event.key==='Escape') {event.preventDefault();dialog.querySelector('.dialog-head button[aria-label]')?.click()}
      if(event.key!=='Tab')return
      const elements=focusable(),first=elements[0],last=elements.at(-1)
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    }
    dialog.addEventListener('keydown',keydown)
    return()=>{background.forEach(element=>{element.inert=false});dialog.removeEventListener('keydown',keydown);if(previous?.isConnected)previous.focus()}
  },[!!editor,!!review,bulk,!!preview])
  const latest = useRef(state); latest.current = state
  const api = async (path, options={}) => {
    const response = await fetch(`/api/studio/${path}`, { ...options, headers:{'X-Studio-Token':latest.current?.token || '',...(options.body instanceof File?{}:{'Content-Type':'application/json'}),...options.headers} })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'İşlem tamamlanamadı.')
    return result
  }
  const refresh = async () => { const next=await api('state'); setState(next); return next }
  useEffect(()=>{ refresh().catch(e=>setError(e.message)) },[])
  const running = state?.jobs.some(j=>['queued','running'].includes(j.status))
  useEffect(()=>{ if (!running) return; const timer=setInterval(()=>refresh().catch(e=>setError(e.message)),2000); return ()=>clearInterval(timer) },[running])
  const perform = async action => {
    setBusy(true);setError('');setNotice('')
    try { return await action() } catch(e) { setError(e.message); return null } finally { setBusy(false) }
  }
  const saveContent = async content => {
    await api('draft',{method:'PUT',body:JSON.stringify({content,revision:latest.current.revision})})
    await refresh();setNotice('Taslak kaydedildi. Siteye aktarmak için Yayın merkezi’ni kullan.')
  }
  const saveItem = (kind,item,previousId,makeCover=false) => perform(async()=>{
    const content=structuredClone(latest.current.content)
    const index=content[kind].findIndex(i=>i.id===previousId)
    if(index<0) content[kind].push(item);else content[kind][index]=item
    if(kind==='photos'&&makeCover) {
      content.photos=content.photos.filter(photo=>photo.id!==item.id)
      const first=content.photos.findIndex(photo=>(photo.album||'Camera Roll')===(item.album||'Camera Roll'))
      content.photos.splice(first<0?content.photos.length:first,0,item)
    }
    await saveContent(content);setEditor(null)
  })
  const remove = (kind,ids) => {
    if(!window.confirm(`${ids.length} öğe taslaktan kaldırılsın mı? Siteye ancak yayımlayınca yansır.`))return
    perform(async()=>{ const content=structuredClone(latest.current.content);content[kind]=content[kind].filter(i=>!ids.includes(i.id));await saveContent(content);setSelected([]);setEditor(null) })
  }
  const move = (kind,id,offset) => perform(async()=>{
    const content=structuredClone(latest.current.content);const items=content[kind];const from=items.findIndex(i=>i.id===id);const to=Math.max(0,Math.min(items.length-1,from+offset));[items[from],items[to]]=[items[to],items[from]];await saveContent(content)
  })
  const uploads = files => perform(async()=>{
    for(const file of files) await api('upload',{method:'POST',headers:{'X-File-Name':encodeURIComponent(file.name),'X-Upload-Mode':uploadMode},body:file})
    await refresh();setNotice(`${files.length} fotoğraf işleme kuyruğuna alındı.`)
  })
  const uploadCover = async file => {
    const job = await api('upload',{method:'POST',headers:{'X-File-Name':encodeURIComponent(file.name),'X-Upload-Mode':'cover'},body:file})
    // Polling is bounded and only active while this explicit upload is pending.
    for(let attempt=0;attempt<300;attempt++) {
      await new Promise(resolve=>setTimeout(resolve,1000))
      const next=await refresh();const current=next.jobs.find(j=>j.id===job.id)
      if(current?.status==='error')throw new Error(current.error)
      if(current?.status==='complete')return current.result.src
    }
    throw new Error('Görsel işlemi sürüyor. İşlem kuyruğunu kontrol edin.')
  }
  const switchTab = next => {setTab(next);setQuery('');setFilter('all');setSelected([])}
  if(!state)return <div className="studio-loading"><strong>Studio</strong><p>{error || 'İçerikler hazırlanıyor…'}</p></div>
  const {content,published} = state
  const changed = Object.keys(names).map(kind=>{
    const current=content[kind].filter(i=>i.publication==='published')
    const old=new Map(published[kind].map(i=>[i.id,i]))
    return {kind,added:current.filter(i=>!old.has(i.id)).length,removed:published[kind].filter(i=>!current.some(n=>n.id===i.id)).length,
      changed:current.filter(i=>{if(!old.has(i.id))return false;const {publication,reviewed,mediaId,original,detections,warnings,canReview,labels,showLocation,...value}=i;if(showLocation===false){delete value.location;delete value.coordinates}return JSON.stringify(value)!==JSON.stringify(old.get(i.id))}).length,
      reordered:published[kind].filter(i=>current.some(n=>n.id===i.id)).map(i=>i.id).join()!==current.filter(i=>old.has(i.id)).map(i=>i.id).join()}
  })
  const changeCount=changed.reduce((s,c)=>s+c.added+c.changed+c.removed+Number(c.reordered),0)
  const list=content[tab]?.filter(i=>(filter==='all'||(filter==='review'?!i.reviewed:i.publication===filter))&&`${i.title} ${i.album||''} ${i.location||''} ${(i.tags||[]).join(' ')}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')))||[]
  const newItem = kind => setEditor({kind,item:{id:`yeni-${Date.now()}`,title:'',publication:'draft',tags:[],...(kind==='projects'?{description:'',details:'',color:['#4266ad','#1d365c'],url:'',status:'Devam ediyor'}:{excerpt:'',body:'',date:new Date().toISOString().slice(0,10)})},isNew:true})
  return <div className="studio-shell">
    <aside className="studio-sidebar"><a className="brand" href="/__studio"><span className="brand-mark">b.</span><span>berkealp<span className="brand-sub">CONTENT STUDIO</span></span></a>
      <div className="workspace-label">ÇALIŞMA ALANI</div>
      <nav aria-label="Panel bölümleri">{tabs.map(([key,label,icon])=><button key={key} className={tab===key?'active':''} onClick={()=>switchTab(key)}><Icon name={icon}/>{label}{content[key]&&<span className="nav-count">{content[key].length}</span>}{key==='publish'&&changeCount>0&&<span className="nav-count">{changeCount}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="local-status"><i/>Yerel çalışma alanı</div><p>Taslakların bu bilgisayarda saklanır.</p><a href="/photos" target="_blank" rel="noreferrer">Siteyi aç ↗</a></div>
    </aside>
    <main className="studio-main">
      <header className="studio-topbar"><span>berkealp.com <span className="slash">/</span> {tabs.find(t=>t[0]===tab)[1]}</span><span className="saved-state">{busy?'Kaydediliyor…':`Son kayıt ${stamp(state.updatedAt)}`}</span></header>
      {error&&<div className="banner error" role="alert">{error}<button aria-label="Hatayı kapat" onClick={()=>setError('')}>✕</button></div>}
      {notice&&<div className="banner success" role="status">{notice}<button aria-label="Bildirimi kapat" onClick={()=>setNotice('')}>✕</button></div>}
      <div className="studio-page">
      {tab==='overview'?<>
        <div className="page-heading"><div><span className="eyebrow">SENİN ALANIN</span><h1>İçeriklerin, bir arada.</h1><p>Hazırla, gözden geçir ve kendi hızında yayımla.</p></div><button className="primary" onClick={()=>switchTab('publish')}>Yayın merkezine git <Icon name="↗"/></button></div>
        <div className="stats-grid">{[['photos','Fotoğraf','▧'],['projects','Proje','▣'],['posts','Yazı','≡']].map(([kind,label,icon])=><button className="stat-card" key={kind} onClick={()=>switchTab(kind)}><span className="stat-label"><Icon name={icon}/>{label}<span>↗</span></span><strong>{content[kind].length}</strong><small>{content[kind].filter(i=>i.publication==='draft').length} taslak · {published[kind].length} sitede</small></button>)}</div>
        <section className="overview-photos"><div className="section-heading"><div><h2>Son eklenenler</h2><p>Bir fotoğraf seçerek bilgilerini düzenle.</p></div><button className="text-button" onClick={()=>switchTab('photos')}>Tüm fotoğraflar →</button></div><div className="recent-grid">{content.photos.slice(-5).reverse().map(photo=><button key={photo.id} onClick={()=>setEditor({kind:'photos',item:photo})}><img src={photo.thumbnail} alt={photo.alt||photo.title}/><span>{photo.title}</span></button>)}</div></section>
        <div className="overview-bottom"><section className="soft-panel"><span className="eyebrow">BİR SONRAKİ ADIM</span><h2>Yeni bir şey paylaş.</h2><p>Bir proje anlat, bir not yaz ya da galerine yeni bir an ekle.</p><div className="actions"><button className="secondary" onClick={()=>newItem('projects')}>+ Proje ekle</button><button className="secondary" onClick={()=>newItem('posts')}>+ Yazı yaz</button></div></section><section className="workflow-panel"><h2>Yayın akışın</h2>{['İçeriği ekle ve düzenle','Fotoğrafları incele, bilgileri tamamla','Mobil ve masaüstünde önizle','Siteye aktar ve GitHub’a gönder'].map((text,i)=><p key={text}><b>{i+1}</b>{text}</p>)}</section></div>
      </>:['photos','projects','posts'].includes(tab)?<>
        <div className="page-heading"><div><span className="eyebrow">İÇERİK KÜTÜPHANESİ</span><h1>{names[tab]} <span className="heading-count">{content[tab].length}</span></h1><p>{tab==='photos'?'Anılarını düzenle. Albüm, etiket ve konum ekle.':tab==='projects'?'Üzerinde çalıştığın işleri ve hikâyelerini paylaş.':'Taslağını yaz, önizle ve hazır olduğunda yayımla.'}</p></div>{tab==='photos'?<button className="primary" disabled={busy} onClick={()=>uploadInput.current.click()}>+ Fotoğraf ekle</button>:<button className="primary" onClick={()=>newItem(tab)}>+ {tab==='projects'?'Proje ekle':'Yazı yaz'}</button>}</div>
        {tab==='photos'&&<div className={`upload-strip ${dragging?'dragging':''}`} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);uploads([...e.dataTransfer.files])}}><Icon name="↑"/><div><strong>Fotoğrafları buraya bırak</strong><small>JPEG, PNG, WebP · dosya başına en fazla 40 MB</small></div><select aria-label="Fotoğraf işleme yöntemi" value={uploadMode} onChange={e=>setUploadMode(e.target.value)}><option value="processed">Hazır işlenmiş fotoğraf</option><option value="raw" disabled={!state.pipelineReady}>Pipeline ile işle</option></select><input hidden ref={uploadInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>{uploads([...e.target.files]);e.target.value=''}}/></div>}
        <div className="collection-toolbar"><div className="filter-tabs">{[['all','Tümü'],['published','Yayına dahil'],['draft','Taslak'],...(tab==='photos'?[['review','İncelenecek']]:[])].map(([key,label])=><button key={key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label}</button>)}</div><input type="search" placeholder="İçeriklerde ara…" aria-label="İçeriklerde ara" value={query} onChange={e=>setQuery(e.target.value)}/></div>
        {tab==='photos'&&<div className="selection-toolbar"><label className="check"><input type="checkbox" checked={list.length>0&&list.every(i=>selected.includes(i.id))} onChange={e=>setSelected(e.target.checked?list.map(i=>i.id):[])}/>Tümünü seç</label><span>{selected.length?`${selected.length} seçili`: `${list.length} fotoğraf`}</span>{selected.length>0&&<><button className="text-button" onClick={()=>setBulk(true)}>Toplu düzenle</button><button className="text-button danger" onClick={()=>remove(tab,selected)}>Kaldır</button></>}</div>}
        {list.length===0?<div className="empty-state"><Icon name={tab==='posts'?'≡':'▧'}/><h2>{query?'Sonuç bulunamadı':'Henüz içerik yok'}</h2><p>{query?'Başka bir kelimeyle aramayı dene.':'İlk içeriğini yukarıdaki ekleme düğmesinden oluştur.'}</p></div>:<div className={tab==='photos'?'photo-grid':'entry-list'}>{list.map(item=>tab==='photos'?<article key={item.id} className="photo-card"><div className="photo-cover"><button className="photo-open" onClick={()=>setEditor({kind:tab,item})}><img loading="lazy" src={item.thumbnail} alt={item.alt||item.title}/></button><input type="checkbox" aria-label={`${item.title} seç`} checked={selected.includes(item.id)} onChange={e=>setSelected(e.target.checked?[...selected,item.id]:selected.filter(id=>id!==item.id))}/>{!item.reviewed&&<Pill tone="amber">İncelenecek</Pill>}</div><div className="photo-card-body"><button className="card-title" onClick={()=>setEditor({kind:tab,item})}>{item.title}</button><p>{item.album||'Albüm yok'}{item.location?` · ${item.location}`:''}</p><div className="card-bottom"><Pill tone={item.publication==='draft'?'neutral':'blue'}>{item.publication==='draft'?'Taslak':'Yayına dahil'}</Pill><span><button aria-label={`${item.title} önceye taşı`} onClick={()=>move(tab,item.id,-1)} disabled={busy}>←</button><button aria-label={`${item.title} sonraya taşı`} onClick={()=>move(tab,item.id,1)} disabled={busy}>→</button></span></div></div></article>:<article className="entry-row" key={item.id}><div className="entry-icon" style={{background:item.color?.[0]||'#e8edf9'}}>{item.cover?<img src={item.cover} alt=""/>:<span>{tab==='projects'?item.title[0]:'≡'}</span>}</div><button className="entry-text" onClick={()=>setEditor({kind:tab,item})}><h3>{item.title}</h3><p>{item.description||item.excerpt||'Açıklama eklenmedi'}</p><small>{(item.tags||[]).join(' · ')}</small></button><Pill tone={item.publication==='draft'?'neutral':'blue'}>{item.publication==='draft'?'Taslak':'Yayına dahil'}</Pill><button aria-label={`${item.title} yukarı taşı`} onClick={()=>move(tab,item.id,-1)} disabled={busy}>↑</button><button aria-label={`${item.title} düzenle`} onClick={()=>setEditor({kind:tab,item})}>↗</button></article>)}</div>}
      </>:<>
        <div className="page-heading"><div><span className="eyebrow">SON KONTROL</span><h1>Yayın merkezi</h1><p>Taslaklarını önizle. Hazır olduklarında siteye aktar.</p></div><Pill tone="blue">{changeCount} değişiklik</Pill></div>
        <div className="publish-layout"><section className="publish-panel"><h2>Değişiklik özeti</h2>{changed.map(row=><div className="change-row" key={row.kind}><strong>{names[row.kind]}</strong><span>+{row.added} yeni</span><span>{row.changed} düzenleme</span><span>{row.removed} kaldırma{row.reordered?' · sıralama değişti':''}</span></div>)}<p className="hint">Yalnızca “Yayına dahil” seçilen içerikler aktarılır. Fotoğrafların ayrıca incelendi olarak işaretlenmesi gerekir.</p><div className="actions"><button className="secondary" onClick={()=>setPreview({device:'mobile',path:'/photos'})}>Siteyi önizle</button><button className="primary" disabled={busy||running} onClick={()=>perform(async()=>{await api('publish',{method:'POST',body:JSON.stringify({revision:state.revision})});await refresh();setNotice('Site dosyaları güncellendi ve derleme başarılı. Canlıya göndermek için GitHub’a gönder’i kullan.')})}>{busy?'Aktarılıyor…':'Site dosyalarına aktar'}</button></div></section>
        <section className="soft-panel"><span className="eyebrow">CANLI YAYIN</span><h2>GitHub’a gönder</h2><p>Siteye aktarılan içerikleri commit edip mevcut dala gönderir. Bağlı dağıtım sistemi varsa yayını başlatır.</p><button className="secondary" disabled={busy||running} onClick={()=>{if(window.confirm('Site dosyalarındaki içerikler mevcut Git dalına commit edilip origin’e gönderilsin mi?'))perform(async()=>{const result=await api('push',{method:'POST',body:'{}'});setNotice(`Gönderildi: ${result.branch} · ${result.commit}`)})}}>GitHub’a gönder ↗</button></section></div>
        <section className="history-panel"><h2>Önceki sürümler</h2><p>Bir sürümü önce taslağa al; kontrol ettikten sonra yeniden yayımla.</p>{state.history.length===0?<p className="hint">İlk aktarımda otomatik yedek oluşturulacak.</p>:state.history.map(h=><div className="history-row" key={h.id}><div><strong>{h.note}</strong><small>{stamp(h.createdAt)}</small></div><button className="secondary" disabled={busy} onClick={()=>{if(window.confirm('Bu sürüm taslağın yerini alsın mı? Mevcut taslak da yedeklenecek.'))perform(async()=>{await api('restore',{method:'POST',body:JSON.stringify({id:h.id,revision:state.revision})});await refresh();setNotice('Sürüm taslağa alındı. Önizleyip siteye aktarabilirsin.')})}}>Taslağa geri al</button></div>)}</section>
      </>}
      {state.jobs.length>0&&<section className="jobs-panel"><div className="section-heading"><h2>İşlem kuyruğu</h2><span>{running?'İşleniyor…':'Güncel'}</span></div>{state.jobs.slice(-8).reverse().map(job=><div className={`job-row ${job.status}`} key={job.id}><span>{job.label}</span><Pill tone={job.status==='error'?'amber':job.status==='complete'?'blue':'neutral'}>{{queued:'Sırada',running:'İşleniyor',complete:'Tamamlandı',error:'Hata'}[job.status]}</Pill>{job.error&&<p role="alert">{job.error}</p>}</div>)}</section>}
      </div>
    </main>
    {editor&&<ContentEditor key={`${editor.kind}-${editor.item.id}`} {...editor} busy={busy} onSave={(item,makeCover)=>saveItem(editor.kind,item,editor.isNew?null:editor.item.id,makeCover)} onClose={()=>setEditor(null)} onRemove={()=>remove(editor.kind,[editor.item.id])} onReview={()=>{setReview(editor.item);setEditor(null)}} uploadCover={uploadCover} />}
    {review&&<ReviewEditor photo={review} busy={busy||running} onClose={()=>setReview(null)} onSubmit={values=>perform(async()=>{await api('review',{method:'POST',body:JSON.stringify(values)});await refresh();setReview(null);setNotice('Düzenleme kuyruğa alındı. Sonuç hazır olduğunda fotoğrafı tekrar kontrol et.')})}/>}
    {bulk&&<BulkEditor count={selected.length} busy={busy} onClose={()=>setBulk(false)} onSave={patch=>perform(async()=>{const content=structuredClone(latest.current.content);content.photos=content.photos.map(i=>selected.includes(i.id)?{...i,...patch,...(patch.tags?{tags:[...new Set([...(i.tags||[]),...patch.tags])]}:{})}:i);await saveContent(content);setBulk(false);setSelected([])})}/>}
    {preview&&<div className="modal-backdrop"><section className="preview-dialog" role="dialog" aria-modal="true" aria-label="Site önizlemesi"><header className="dialog-head"><h2>Taslak önizlemesi</h2><select aria-label="Önizleme sayfası" value={preview.path} onChange={e=>setPreview({...preview,path:e.target.value})}><option value="/photos">Fotoğraflar</option><option value="/projects">Projeler</option><option value="/blog">Blog</option></select><button className={preview.device==='mobile'?'primary':'secondary'} onClick={()=>setPreview({...preview,device:'mobile'})}>Mobil</button><button className={preview.device==='desktop'?'primary':'secondary'} onClick={()=>setPreview({...preview,device:'desktop'})}>Masaüstü</button><button aria-label="Önizlemeyi kapat" onClick={()=>setPreview(null)}>✕</button></header><p className="hint">Kaydedilmiş ve yayına dahil edilmiş içerikler gösteriliyor.</p><div className="preview-scroll"><iframe title="Site taslağı" key={`${preview.device}-${preview.path}`} src={`${preview.path}?studio-preview=1`} style={{width:preview.device==='mobile'?390:1100,height:740}}/></div></section></div>}
  </div>
}

function ContentEditor({kind,item,isNew,busy,onSave,onClose,onRemove,onReview,uploadCover}) {
  const [value,setValue]=useState(structuredClone(item))
  const [tags,setTags]=useState((item.tags||[]).join(', '))
  const [dirty,setDirty]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [error,setError]=useState('')
  const [bodyPreview,setBodyPreview]=useState(false)
  const [makeCover,setMakeCover]=useState(false)
  const textArea=useRef(null)
  const coverInput=useRef(null)
  const inlineInput=useRef(null)
  const field=key=>({value:value[key]||'',onChange:e=>patch({[key]:e.target.value})})
  const patch=updates=>{setDirty(true);setValue(v=>({...v,...updates}))}
  const close=()=>{if(!dirty||window.confirm('Kaydedilmemiş düzenlemeler kapatılsın mı?'))onClose()}
  useEffect(()=>{const before=e=>{if(dirty){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before)},[dirty])
  const bodyKey=kind==='projects'?'details':'body'
  const insert=(before,after='')=>{const el=textArea.current;if(!el)return;const source=value[bodyKey]||'';patch({[bodyKey]:source.slice(0,el.selectionStart)+before+source.slice(el.selectionStart,el.selectionEnd)+after+source.slice(el.selectionEnd)});el.focus()}
  const upload=async(file,inline=false)=>{if(!file)return;setUploading(true);setError('');try{const src=await uploadCover(file);if(inline)patch({[bodyKey]:`${value[bodyKey]||''}\n\n![Görsel](${src})\n`});else patch({cover:src})}catch(e){setError(e.message)}finally{setUploading(false)}}
  return <div className="modal-backdrop"><form className={`editor-dialog ${kind==='photos'?'photo-editor':''}`} role="dialog" aria-modal="true" aria-label={isNew?'Yeni içerik':'İçeriği düzenle'} onSubmit={e=>{e.preventDefault();onSave({...value,tags:splitTags(tags)},makeCover)}}>
    <header className="dialog-head"><div><span className="eyebrow">{names[kind]}</span><h2>{isNew?'Yeni içerik':item.title}</h2></div><button type="button" aria-label="Editörü kapat" onClick={close}>✕</button></header>
    <div className="editor-scroll">{error&&<p className="banner error" role="alert">{error}</p>}
      {kind==='photos'&&<div className="editor-photo"><img src={item.src} alt={item.alt||item.title}/><button type="button" className="secondary" onClick={()=>{if(!dirty||window.confirm('İncelemeye geçerken kaydedilmemiş bilgiler kapatılsın mı?'))onReview()}}>Fotoğrafı incele ↗</button></div>}
      <div className="fields-grid"><Field label="Başlık"><input required maxLength={200} {...field('title')} onChange={e=>patch({title:e.target.value,...(isNew?{id:slug(e.target.value)||value.id}:{})})}/></Field>
      <Field label="Yayın durumu" hint="Kaydetmek canlı siteyi değiştirmez."><select value={value.publication} onChange={e=>patch({publication:e.target.value})}><option value="draft">Taslak</option><option value="published">Yayına dahil</option></select></Field>
      {kind!=='photos'&&<Field label="Sayfa adresi" hint={`/${kind==='projects'?'projects':'blog'}/${value.id}`}><input required pattern="[a-z0-9][a-z0-9-]*" {...field('id')}/></Field>}
      <Field label="Etiketler" hint="Virgülle ayır: seyahat, gece, yazılım"><input value={tags} onChange={e=>{setTags(e.target.value);setDirty(true)}}/></Field>
      {kind==='photos'?<>
        <Field label="Albüm"><input {...field('album')} placeholder="Camera Roll"/></Field><Field label="Çekim tarihi"><input type="date" {...field('date')}/></Field>
        <label className="check full-width"><input type="checkbox" checked={makeCover} onChange={e=>{setMakeCover(e.target.checked);setDirty(true)}}/>Albüm kapağı yap (albümün başına taşır)</label>
        <Field label="Konum adı"><input {...field('location')} placeholder="İzmir, Türkiye"/></Field><Field label="Alternatif metin" hint="Fotoğrafın içeriğini kısa ve açık biçimde anlat."><textarea rows={2} {...field('alt')}/></Field>
        <div className="full-width"><MapPicker coordinates={value.coordinates} onChange={coordinates=>patch({coordinates})}/><label className="check"><input type="checkbox" checked={value.showLocation!==false} onChange={e=>patch({showLocation:e.target.checked})}/>Konumu sitede göster</label></div>
        <Field label="Açıklama"><textarea rows={3} {...field('caption')}/></Field><div className="review-approval"><label className="check"><input type="checkbox" checked={!!value.reviewed} onChange={e=>patch({reviewed:e.target.checked})}/>Fotoğrafı inceledim, yayına uygun</label>{!!item.warnings?.length&&<small>{item.warnings.length} otomatik kontrol notu var. İnceleme ekranından bakabilirsin.</small>}</div>
      </>:<>
        <Field label={kind==='projects'?'Kısa açıklama':'Yazı özeti'}><textarea rows={3} {...field(kind==='projects'?'description':'excerpt')}/></Field>
        {kind==='projects'?<><Field label="Proje bağlantısı"><input type="url" {...field('url')} placeholder="https://…"/></Field><Field label="Proje durumu"><input {...field('status')} placeholder="Devam ediyor / Tamamlandı"/></Field><Field label="Kapak renkleri"><span className="color-fields">{value.color.map((c,i)=><input aria-label={`Renk ${i+1}`} key={i} type="color" value={c} onChange={e=>patch({color:value.color.map((v,j)=>j===i?e.target.value:v)})}/>)}</span></Field></>:<Field label="Yazı tarihi" hint="Otomatik zamanlanmış yayın değildir."><input type="date" {...field('date')}/></Field>}
        <div className="cover-picker full-width">{value.cover&&<img src={value.cover} alt="Kapak önizlemesi"/>}<div><strong>Kapak görseli</strong><p className="hint">JPEG, PNG veya WebP</p><button type="button" className="secondary" disabled={uploading} onClick={()=>coverInput.current.click()}>{uploading?'Hazırlanıyor…':'Görsel yükle'}</button>{value.cover&&<button type="button" className="text-button" onClick={()=>patch({cover:''})}>Kaldır</button>}</div><input hidden ref={coverInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files[0])}/></div>
        <div className="writing-area full-width"><div className="writing-toolbar"><strong>{kind==='projects'?'Proje yazısı':'Yazı'}</strong><button type="button" onClick={()=>insert('**','**')}>B</button><button type="button" onClick={()=>insert('## ')}>H2</button><button type="button" onClick={()=>insert('[',' ](https://example.com)')}>Bağlantı</button><button type="button" disabled={uploading} onClick={()=>inlineInput.current.click()}>+ Görsel</button><button type="button" className={bodyPreview?'active':''} onClick={()=>setBodyPreview(!bodyPreview)}>{bodyPreview?'Düzenle':'Önizle'}</button><input hidden ref={inlineInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files[0],true)}/></div>{bodyPreview?<Markdown>{value[bodyKey]}</Markdown>:<textarea ref={textArea} aria-label="Yazı içeriği" rows={15} {...field(bodyKey)} placeholder="Hikâyeni burada anlat…\n\n## Bir başlık\n\nParagraflar, listeler ve görseller ekleyebilirsin."/>}</div>
      </>}</div>
    </div>
    <footer className="dialog-footer">{!isNew&&<button type="button" className="text-button danger" onClick={onRemove}>Kaldır</button>}<span>{dirty?'Kaydedilmemiş düzenlemeler':'Taslak'}</span><button type="button" className="secondary" onClick={close}>Vazgeç</button><button className="primary" disabled={busy||uploading}>{busy?'Kaydediliyor…':'Taslağı kaydet'}</button></footer>
  </form></div>
}

function BulkEditor({count,busy,onClose,onSave}) {
  const [album,setAlbum]=useState('');const [tags,setTags]=useState('');const [location,setLocation]=useState('')
  return <div className="modal-backdrop"><form className="bulk-dialog" role="dialog" aria-modal="true" aria-label="Toplu düzenle" onSubmit={e=>{e.preventDefault();onSave({...album?{album}:{},...tags?{tags:splitTags(tags)}:{},...location?{location}:{}})}}><header className="dialog-head"><h2>{count} fotoğrafı düzenle</h2><button type="button" onClick={onClose} aria-label="Toplu düzenlemeyi kapat">✕</button></header><p className="hint">Boş alanlar mevcut bilgiyi korur. Etiketler mevcut etiketlere eklenir.</p><Field label="Albüm"><input value={album} onChange={e=>setAlbum(e.target.value)}/></Field><Field label="Eklenecek etiketler"><input value={tags} onChange={e=>setTags(e.target.value)}/></Field><Field label="Konum adı"><input value={location} onChange={e=>setLocation(e.target.value)}/></Field><footer className="dialog-footer"><button type="button" className="secondary" onClick={onClose}>Vazgeç</button><button className="primary" disabled={busy}>Seçilenlere uygula</button></footer></form></div>
}
