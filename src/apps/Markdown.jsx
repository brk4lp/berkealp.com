/**
 * Minik markdown renderer — harici bağımlılık yok.
 * Desteklenenler: # başlıklar, **kalın**, *italik*, `kod`, [link](url),
 * - liste öğeleri ve boş satırla ayrılmış paragraflar.
 */

function renderInline(text, keyPrefix) {
  // Sıra önemli: önce link, sonra kalın/italik/kod.
  const tokens = []
  const regex =
    /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g
  let lastIndex = 0
  let match
  let i = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index))
    }
    const key = `${keyPrefix}-${i++}`
    if (match[1]) {
      tokens.push(
        <a key={key} href={match[3]} target="_blank" rel="noreferrer noopener">
          {match[2]}
        </a>,
      )
    } else if (match[4]) {
      tokens.push(<strong key={key}>{match[5]}</strong>)
    } else if (match[6]) {
      tokens.push(<em key={key}>{match[7]}</em>)
    } else if (match[8]) {
      tokens.push(<code key={key}>{match[9]}</code>)
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex))
  }
  return tokens
}

export default function Markdown({ children }) {
  const source = (children || '').trim()
  const blocks = source.split(/\n{2,}/)

  return (
    <div className="md">
      {blocks.map((block, bi) => {
        const trimmed = block.trim()

        // Başlıklar
        const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed)
        if (heading) {
          const level = heading[1].length
          const Tag = `h${level}`
          return <Tag key={bi}>{renderInline(heading[2], `h${bi}`)}</Tag>
        }

        // Liste
        if (/^[-*]\s+/.test(trimmed)) {
          const items = trimmed.split(/\n/).map((l) => l.replace(/^[-*]\s+/, ''))
          return (
            <ul key={bi} className="md-list">
              {items.map((item, ii) => (
                <li key={ii}>{renderInline(item, `l${bi}-${ii}`)}</li>
              ))}
            </ul>
          )
        }

        // Paragraf (tek satır kırılmaları <br> olur)
        const lines = trimmed.split(/\n/)
        return (
          <p key={bi}>
            {lines.map((line, li) => (
              <span key={li}>
                {renderInline(line, `p${bi}-${li}`)}
                {li < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
