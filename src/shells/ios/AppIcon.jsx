/**
 * iOS 5 glossy uygulama ikonu: yuvarlak köşeli tint arka plan + üst parlaklık +
 * içinde app glyph'i. Altında etiket.
 */
export default function AppIcon({ app, onOpen, showLabel = true }) {
  const { Glyph, tint, iosIcon } = app
  return (
    <button className="ios-app" onClick={onOpen} aria-label={app.title}>
      <span
        className={`ios-app-tile${iosIcon ? ' has-artwork' : ''}`}
        style={
          iosIcon
            ? undefined
            : {
                background: `linear-gradient(to bottom, ${tint[0]}, ${tint[1]})`,
              }
        }
      >
        {iosIcon ? (
          <img className="ios-app-artwork" src={iosIcon} alt="" />
        ) : (
          <>
            <span className="ios-app-gloss" aria-hidden="true" />
            <span className="ios-app-glyph">
              <Glyph />
            </span>
          </>
        )}
      </span>
      {showLabel && <span className="ios-app-label">{app.title}</span>}
    </button>
  )
}
