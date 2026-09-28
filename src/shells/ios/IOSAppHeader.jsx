export default function IOSAppHeader({ title, onHome, subtitle, actions, children }) {
  return (
    <header className="ios-app-header">
      <div className="ios-app-header-topline">
        <button className="ios-app-home" onClick={onHome}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 4-8 8 8 8" />
          </svg>
          Home
        </button>
        {actions}
      </div>
      <h1>{title}</h1>
      {subtitle && <p className="ios-app-subtitle">{subtitle}</p>}
      {children}
    </header>
  )
}
