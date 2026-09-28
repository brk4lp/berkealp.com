import { useSyncExternalStore } from 'react'

const titles = {
  '/': 'Portfolio', '/about': 'About', '/projects': 'Projects',
  '/photos': 'Photos',
  '/projects/gorleak': 'Gorleak', '/blog': 'Blog', '/contact': 'Contact',
  '/my-computer': 'My Computer', '/recycle-bin': 'Recycle Bin', '/cv': 'Résumé',
}
export function normalizePath(path) {
  return path === '/' ? '/' : path.replace(/\/+$/, '')
}
export function routeApp(path) {
  const normalized = normalizePath(path)
  if (!isKnownPath(normalized) || normalized === '/' || normalized === '/cv') return null
  return normalized.split('/')[1]
}
export function isKnownPath(path) {
  return Object.hasOwn(titles, normalizePath(path)) || /^\/(projects|blog)\/[a-z0-9][a-z0-9-]{0,99}$/.test(normalizePath(path))
}
export function navigate(path, { replace = false } = {}) {
  if (!isKnownPath(path)) return
  path = normalizePath(path)
  if (window.location.pathname === path) return
  const query = import.meta.env.DEV && new URLSearchParams(location.search).has('studio-preview') ? '?studio-preview=1' : ''
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path + query)
  window.dispatchEvent(new Event('portfolio:navigate'))
}
function subscribe(listener) {
  window.addEventListener('popstate', listener)
  window.addEventListener('portfolio:navigate', listener)
  return () => {
    window.removeEventListener('popstate', listener)
    window.removeEventListener('portfolio:navigate', listener)
  }
}
export function usePath() {
  return useSyncExternalStore(subscribe, () => normalizePath(window.location.pathname), () => '/')
}
export function pageTitle(path) {
  return `${titles[path] || (/^\/projects\//.test(path) ? 'Projects' : /^\/blog\//.test(path) ? 'Blog' : 'Page not found')} - Berke Alp`
}
