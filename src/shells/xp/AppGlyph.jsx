export default function AppGlyph({ app }) {
  if (app.xpIcon) return <img className="xp-app-artwork" src={app.xpIcon} alt="" draggable="false" />
  const Glyph = app.Glyph
  return Glyph ? <Glyph /> : null
}
