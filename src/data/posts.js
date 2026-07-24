// Placeholder blog posts — markdown text (see apps/Markdown.jsx).
export const posts = [
  {
    id: 'post-1',
    title: 'How I Built This Site',
    date: '2026-07-20',
    excerpt: 'Two different operating-system interfaces in a single codebase.',
    body: `# How I Built This Site

This site uses two **shells**: *Windows XP* on wide screens, *iOS 5* on narrow ones.

The content is written once, and both shells render the same content in their own chrome.

## Why?
- Nostalgia is nice
- It's a fun technical problem
- More memorable than an ordinary portfolio

Feel free to [get in touch](#) for details.`,
  },
  {
    id: 'post-2',
    title: 'Is Skeuomorphism Coming Back?',
    date: '2026-06-11',
    excerpt: 'The place of realistic textures and shadows in interface design.',
    body: `# Is Skeuomorphism Coming Back?

Flat design reigned for years. But iOS 5's \`linen\` textures and glossy icons
had a warmth of their own.

Maybe the right answer is somewhere in between.`,
  },
  {
    id: 'post-3',
    title: 'Draggable Windows',
    date: '2026-05-02',
    excerpt: 'Dragging windows with pointer events, no external library.',
    body: `# Draggable Windows

You don't need an external library to drag a window. With \`pointerdown\`,
\`pointermove\` and \`pointercapture\` it takes just a few lines.

- \`pointerdown\` on the title bar
- Compute the delta, update the position
- Release on \`pointerup\``,
  },
]
