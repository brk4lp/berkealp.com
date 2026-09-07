const discoverySteps = [
  { label: 'Bot entry', detail: 'The flow started inside a Telegram bot.' },
  { label: 'User storefront', detail: 'Each visitor was sent to a separate storefront.' },
  { label: 'Protected root', detail: 'Opening the main domain directly returned 403.' },
  { label: 'Open media index', detail: 'A public media directory exposed randomly named files.' },
]

const monitoringSteps = [
  { label: 'Daily trigger', detail: 'The monitor starts once a day.' },
  { label: 'Scan and compare', detail: 'Current filenames are compared with SQLite.' },
  { label: 'New file?', detail: 'Known files are skipped. New files continue.' },
  { label: 'Archive and record', detail: 'The file is saved by date and added to the history.' },
]

function FlowDiagram({ number, title, steps }) {
  return (
    <figure className={`project-flow project-flow-${number}`}>
      <figcaption>
        <span>Diagram {String(number).padStart(2, '0')}</span>
        <strong>{title}</strong>
      </figcaption>
      <ol className="project-flow-list">
        {steps.map((step, index) => (
          <li className="project-flow-step" key={step.label}>
            <div className="project-flow-node">
              <span className="project-flow-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <strong>{step.label}</strong>
                <p>{step.detail}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <span className="project-flow-arrow" aria-hidden="true">→</span>
            )}
          </li>
        ))}
      </ol>
    </figure>
  )
}

export default function GorleakDiagram({ variant }) {
  const diagram = variant === 'discovery'
    ? { number: 1, title: 'How I found the exposure', steps: discoverySteps }
    : { number: 2, title: 'The daily monitoring loop', steps: monitoringSteps }

  return (
    <section className="project-flow-section" aria-label={diagram.title}>
      <FlowDiagram {...diagram} />
    </section>
  )
}
