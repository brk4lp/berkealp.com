/**
 * "Recycle Bin" — boş (espri).
 */
export default function RecycleBin() {
  return (
    <div className="app-content recycle-bin">
      <div className="rb-empty">
        <div className="rb-icon" aria-hidden="true">🗑️</div>
        <p className="rb-title">Recycle Bin is empty</p>
        <p className="rb-sub">No bad ideas here. They all shipped.</p>
      </div>
    </div>
  )
}
