/**
 * iOS 5 glossy uygulama ikonu: yuvarlak köşeli tint arka plan + üst parlaklık +
 * içinde app glyph'i. Altında etiket.
 */
export default function AppIcon({ app, onOpen, showLabel = true }) {
  const { Glyph, tint } = app
  return (
    <button className="ios-app" onClick={onOpen}>
      <span
        className="ios-app-tile"
        style={{
          background: `linear-gradient(to bottom, ${tint[0]}, ${tint[1]})`,
        }}
      >
        <span className="ios-app-gloss" aria-hidden="true" />
        <span className="ios-app-glyph">
          <Glyph />
        </span>
      </span>
      {showLabel && <span className="ios-app-label">{app.title}</span>}
    </button>
  )
}
