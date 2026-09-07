import StatusBar from './StatusBar.jsx'

/**
 * Tam ekran iOS uygulama görünümü: durum çubuğu + başlık barı + içerik.
 * İkondan açılan zoom animasyonu için transform-origin `origin` ile ayarlanır.
 */
export default function AppView({ app, origin, onClose }) {
  const Body = app.Component
  const style = origin
    ? { transformOrigin: `${origin.x}px ${origin.y}px` }
    : undefined
  return (
    <div className="ios-appview" style={style}>
      <StatusBar dark />
      <div className="ios-navbar">
        <button className="ios-nav-back" onClick={onClose} aria-label="Close app">
          <span aria-hidden="true">‹</span>
          Home
        </button>
        <span className="ios-nav-title">{app.title}</span>
      </div>
      <div className="ios-appview-body">
        <Body />
      </div>
    </div>
  )
}
