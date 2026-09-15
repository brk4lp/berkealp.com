import { useId, useRef } from 'react'
import { outboundHref } from '../data/outbound.js'

export default function SocialLink({ maintenance, label, children, onClick, ...props }) {
  const dialog = useRef(null)
  const titleId = useId()

  if (!maintenance) return <a {...props} href={outboundHref(props.href)} onClick={onClick}>{children}</a>

  const { href, target, rel, ...buttonProps } = props
  return (
    <>
      <button {...buttonProps} type="button" onClick={() => dialog.current.showModal()}>
        {children}
      </button>
      <dialog ref={dialog} className="maintenance-dialog" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <span className="maintenance-symbol" aria-hidden="true">⚠</span>
        <h2 id={titleId}>{label} is temporarily unavailable</h2>
        <p>This profile link is under maintenance. Please check back later.</p>
        <form method="dialog">
          <button className="link-btn" autoFocus>OK</button>
        </form>
      </dialog>
    </>
  )
}
