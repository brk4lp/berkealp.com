// Only these fixed destinations can be used by the outbound routes.
export const outboundLinks = [
  { id: 'github', label: 'GitHub', url: 'https://github.com/brk4lp' },
  { id: 'tiny11', label: 'Tiny11 GUI', url: 'https://github.com/brk4lp/Tiny11-GUI' },
  { id: 'adapos', label: 'AdaPOS', url: 'https://drive.google.com/drive/folders/1qyLYlMFZs1EiKW1w8y9pikfIe0_rtIJ8?usp=sharing' },
  { id: 'photoscript', label: 'Photo Studio Folder Script', url: 'https://github.com/brk4lp/detayFolderScript' },
  { id: 'spotify', label: 'Spotify', url: 'https://open.spotify.com/user/qwvsfd1gbu135l7d9iynji6w9' },
]

export function outboundHref(url) {
  const link = outboundLinks.find((item) => item.url === url)
  return link ? `/go/${link.id}` : url
}

export function getOutboundLink(path) {
  return outboundLinks.find((item) => `/go/${item.id}` === path)
}
