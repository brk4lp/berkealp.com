import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App.jsx'
import { ContentContext } from './data/ContentContext.jsx'

import './styles/reset.css'
import './styles/fonts.css'
import './styles/content.css'
import './shells/xp/xp.css'
import './shells/ios/ios.css'
import './shells/ios/ios-content.css'

async function start() {
const preview = import.meta.env.DEV && new URLSearchParams(location.search).has('studio-preview')
const draft = preview ? await fetch('/api/studio/preview').then(r => { if (!r.ok) throw new Error('Taslak önizlemesi yüklenemedi'); return r.json() }) : null
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {draft ? <ContentContext.Provider value={draft}><App /></ContentContext.Provider> : <App />}
    {!preview && <Analytics />}
    {!preview && <SpeedInsights />}
  </React.StrictMode>,
)
}
start().catch(() => { document.getElementById('root').textContent = 'Önizleme yüklenemedi. Studio üzerinden yeniden açın.' })
