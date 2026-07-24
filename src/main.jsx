import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import './styles/reset.css'
import './styles/fonts.css'
import './styles/content.css'
import './shells/xp/xp.css'
import './shells/ios/ios.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
