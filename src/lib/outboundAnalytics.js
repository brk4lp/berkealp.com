let pageviewStarted = false
const listeners = new Set()

// beforeSend signals that the SDK is about to send, not server acknowledgement.
export function beforeAnalyticsSend(event) {
  if (event.type === 'pageview' && new URL(event.url).pathname.startsWith('/go/')) {
    pageviewStarted = true
    listeners.forEach((listener) => listener())
  }
  return event
}

export function scheduleOutboundRedirect(navigate) {
  let sendTimer
  let finished = false
  const redirect = () => {
    if (finished) return
    finished = true
    navigate()
  }
  const onPageview = () => {
    if (!sendTimer) sendTimer = setTimeout(redirect, 200)
  }
  listeners.add(onPageview)
  if (pageviewStarted) onPageview()
  // A blocked or unavailable analytics script must never trap the visitor.
  const fallbackTimer = setTimeout(redirect, 1500)
  return () => {
    finished = true
    listeners.delete(onPageview)
    clearTimeout(sendTimer)
    clearTimeout(fallbackTimer)
  }
}
