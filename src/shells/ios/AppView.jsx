import StatusBar from './StatusBar.jsx'
import IOSAppHeader from './IOSAppHeader.jsx'

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
    <div className={`ios-appview${app.immersive ? ' ios-appview-immersive' : ''}`} style={style}>
      <StatusBar dark />
      {!app.immersive && <IOSAppHeader title={app.title} onHome={onClose} />}
      <div className="ios-appview-body">
        <Body />
      </div>
    </div>
  )
}
