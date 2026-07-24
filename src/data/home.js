import { profile } from './profile.js'

/**
 * iOS ana ekranı için harici bağlantı "uygulamaları" (launcher).
 * Hem 2. sayfada hem "Links" klasöründe kullanılır.
 */
export const links = [
  {
    id: 'github',
    label: 'GitHub',
    letter: 'G',
    url: profile.social.find((s) => s.label === 'GitHub')?.url || '#',
    tint: ['#4a4a4f', '#1f1f22'],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    letter: 'in',
    url: profile.social.find((s) => s.label === 'LinkedIn')?.url || '#',
    tint: ['#3a8fd0', '#0a66c2'],
  },
  {
    id: 'x',
    label: 'X',
    letter: 'X',
    url: profile.social.find((s) => s.label.startsWith('Twitter'))?.url || '#',
    tint: ['#1c1c1e', '#000'],
  },
  {
    id: 'email',
    label: 'Email',
    letter: '✉',
    url: `mailto:${profile.email}`,
    tint: ['#4aa3ea', '#1f6fd0'],
  },
]
