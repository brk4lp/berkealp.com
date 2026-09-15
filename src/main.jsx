import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App.jsx'
import { beforeAnalyticsSend } from './lib/outboundAnalytics.js'

import './styles/reset.css'
import './styles/fonts.css'
import './styles/content.css'
import './shells/xp/xp.css'
import './shells/ios/ios.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics beforeSend={beforeAnalyticsSend} />
    <SpeedInsights />
  </React.StrictMode>,
)
