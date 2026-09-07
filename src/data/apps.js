// Tek kayıt noktası: hem XP masaüstü/Start menüsü hem iOS ana ekranı
// bu listeden üretilir. Yeni bölüm eklemek = buraya bir satır.
import About from '../apps/About.jsx'
import Projects from '../apps/Projects.jsx'
import Blog from '../apps/Blog.jsx'
import Contact from '../apps/Contact.jsx'
import MyComputer from '../apps/MyComputer.jsx'
import RecycleBin from '../apps/RecycleBin.jsx'
import notesIOSIcon from '../../icons/apple-notes-app-icon_svgstack_com_5891788779607.svg'
import mailIOSIcon from '../../icons/ios-mail-app-icon_svgstack_com_6001788779615.svg'
import pagesIOSIcon from '../../icons/pages-ios-app-logo_svgstack_com_71851788779651.svg'
import spotifyIOSIcon from '../../icons/spotify-ios-app-icon_svgstack_com_71681788779695.svg'
import {
  AboutGlyph,
  ProjectsGlyph,
  BlogGlyph,
  ContactGlyph,
  MyComputerGlyph,
  RecycleBinGlyph,
} from './icons.jsx'

export const apps = [
  {
    id: 'about',
    title: 'About',
    Glyph: AboutGlyph,
    Component: About,
    tint: ['#5b9bd5', '#2e6da4'],
    defaultSize: { w: 460, h: 420 },
  },
  {
    id: 'projects',
    title: 'Projects',
    Glyph: ProjectsGlyph,
    Component: Projects,
    tint: ['#f0b429', '#b8860b'],
    iosIcon: pagesIOSIcon,
    defaultSize: { w: 640, h: 500 },
  },
  {
    id: 'blog',
    title: 'Blog',
    Glyph: BlogGlyph,
    Component: Blog,
    tint: ['#9aa0a6', '#5f6368'],
    iosIcon: notesIOSIcon,
    defaultSize: { w: 560, h: 500 },
  },
  {
    id: 'contact',
    title: 'Contact',
    Glyph: ContactGlyph,
    Component: Contact,
    tint: ['#56b3d6', '#2a7f9e'],
    iosIcon: mailIOSIcon,
    defaultSize: { w: 440, h: 440 },
  },
  {
    id: 'spotify',
    title: 'Spotify',
    Glyph: null,
    Component: null,
    tint: ['#1ed760', '#121212'],
    iosIcon: spotifyIOSIcon,
    externalUrl: 'https://open.spotify.com/user/qwvsfd1gbu135l7d9iynji6w9',
    mobileOnly: true,
  },
  {
    id: 'my-computer',
    title: 'My Computer',
    Glyph: MyComputerGlyph,
    Component: MyComputer,
    tint: ['#7c8b9c', '#4a5b6d'],
    defaultSize: { w: 520, h: 460 },
    desktopOnly: true,
  },
  {
    id: 'recycle-bin',
    title: 'Recycle Bin',
    Glyph: RecycleBinGlyph,
    Component: RecycleBin,
    tint: ['#8fbf6f', '#5c8a3a'],
    defaultSize: { w: 420, h: 320 },
    desktopOnly: true,
  },
]

// iOS ana ekranı/dock/Spotlight yalnızca masaüstüne-özel olmayanları gösterir.
export const mobileApps = apps.filter((a) => !a.desktopOnly)
export const desktopApps = apps.filter((a) => !a.mobileOnly)

export const getApp = (id) => apps.find((a) => a.id === id)
