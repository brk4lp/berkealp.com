/**
 * Telifsiz, CSS/SVG ile üretilmiş ikonlar.
 * Her app için bir "glyph" (ana simge) tanımlanır; hem XP masaüstü ikonu
 * hem iOS glossy ikonu bu glyph'i farklı çerçevede kullanır.
 */

export const AboutGlyph = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
    <circle cx="24" cy="17" r="9" fill="#ffe0b2" stroke="#c98a4b" strokeWidth="1.5" />
    <path
      d="M8 42c0-9 7-15 16-15s16 6 16 15z"
      fill="#4a90d9"
      stroke="#2a5f9e"
      strokeWidth="1.5"
    />
  </svg>
)

export const ProjectsGlyph = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
    <rect x="6" y="14" width="36" height="26" rx="2" fill="#f4c542" stroke="#b8860b" strokeWidth="1.5" />
    <path d="M6 16l0-3a2 2 0 012-2h11l4 5H6z" fill="#e0a800" stroke="#b8860b" strokeWidth="1.5" />
  </svg>
)

export const BlogGlyph = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
    <rect x="10" y="7" width="28" height="34" rx="2" fill="#fff" stroke="#999" strokeWidth="1.5" />
    <line x1="15" y1="15" x2="33" y2="15" stroke="#4a90d9" strokeWidth="2" />
    <line x1="15" y1="21" x2="33" y2="21" stroke="#bbb" strokeWidth="2" />
    <line x1="15" y1="27" x2="33" y2="27" stroke="#bbb" strokeWidth="2" />
    <line x1="15" y1="33" x2="26" y2="33" stroke="#bbb" strokeWidth="2" />
  </svg>
)

export const ContactGlyph = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
    <rect x="6" y="11" width="36" height="26" rx="2" fill="#fff" stroke="#999" strokeWidth="1.5" />
    <path d="M7 13l17 13 17-13" fill="none" stroke="#4a90d9" strokeWidth="2" />
  </svg>
)

export const MyComputerGlyph = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
    <rect x="8" y="9" width="32" height="23" rx="2" fill="#dfe7ef" stroke="#6b7a8d" strokeWidth="1.5" />
    <rect x="11" y="12" width="26" height="17" rx="1" fill="#2e6da4" />
    <rect x="11" y="12" width="26" height="9" rx="1" fill="#4a90d9" />
    <path d="M17 34h14l3 6H14z" fill="#c3ccd6" stroke="#6b7a8d" strokeWidth="1.5" />
    <rect x="12" y="40" width="24" height="3" rx="1.5" fill="#9aa7b5" />
  </svg>
)

export const RecycleBinGlyph = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
    <path d="M13 16h22l-2 24a2 2 0 01-2 2H17a2 2 0 01-2-2z" fill="#a9d18e" stroke="#5c8a3a" strokeWidth="1.5" />
    <path d="M20 21l1 16M24 21v16M28 21l-1 16" stroke="#4a6f2a" strokeWidth="1.5" fill="none" />
    <rect x="10" y="11" width="28" height="5" rx="2" fill="#8fbf6f" stroke="#5c8a3a" strokeWidth="1.5" />
    <rect x="19" y="7" width="10" height="4" rx="2" fill="#8fbf6f" stroke="#5c8a3a" strokeWidth="1.5" />
  </svg>
)
