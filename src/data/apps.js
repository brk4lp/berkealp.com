// Tek kayıt noktası: hem XP masaüstü/Start menüsü hem iOS ana ekranı
// bu listeden üretilir. Yeni bölüm eklemek = buraya bir satır.
import About from '../apps/About.jsx'
import Projects from '../apps/Projects.jsx'
import Blog from '../apps/Blog.jsx'
import Contact from '../apps/Contact.jsx'
import MyComputer from '../apps/MyComputer.jsx'
import RecycleBin from '../apps/RecycleBin.jsx'
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
    defaultSize: { w: 640, h: 500 },
  },
  {
    id: 'blog',
    title: 'Blog',
    Glyph: BlogGlyph,
    Component: Blog,
    tint: ['#9aa0a6', '#5f6368'],
    defaultSize: { w: 560, h: 500 },
  },
  {
    id: 'contact',
    title: 'Contact',
    Glyph: ContactGlyph,
    Component: Contact,
    tint: ['#56b3d6', '#2a7f9e'],
    defaultSize: { w: 440, h: 440 },
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

export const getApp = (id) => apps.find((a) => a.id === id)
