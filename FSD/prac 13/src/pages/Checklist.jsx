import { useMemo, useState } from 'react'
import CodeBlock from '../components/CodeBlock.jsx'
import { CheckIcon } from '../components/Icons.jsx'
import { CHECKLIST_PHASES, CHECKLIST_TOTAL } from '../data/checklist.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const STORAGE_KEY = 'vercel-react-checklist-v1'

const FILTERS = [
  { value: 'all', label: 'All checks' },
  { value: 'remaining', label: 'Remaining' },
  { value: 'done', label: 'Completed' },
]

export default function Checklist() {
  const [done, setDone] = useLocalStorage(STORAGE_KEY, {})
  const [filter, setFilter] = useState('all')

  const completed = useMemo(
    () =>
      CHECKLIST_PHASES.reduce(
        (total, phase) =>
          total + phase.items.filter((item) => done[item.id]).length,
        0,
      ),
    [done],
  )

  const progress = Math.round((completed / CHECKLIST_TOTAL) * 100)

  const visiblePhases = useMemo(
    () =>
      CHECKLIST_PHASES.map((phase) => ({
        ...phase,
        items: phase.items.filter((item) => {
          const isDone = Boolean(done[item.id])
          if (filter === 'done') return isDone
          if (filter === 'remaining') return !isDone
          return true
        }),
      })).filter((phase) => phase.items.length > 0),
    [done, filter],
  )

  function toggle(id) {
    setDone((previous) => ({ ...previous, [id]: !previous[id] }))
  }

  function reset() {
    if (window.confirm('Reset all checklist progress in this browser?')) {
      setDone({})
    }
  }

  return (
    <div className="checklist-page">
      <header className="page-heading">
        <span className="eyebrow">Deployment runbook</span>
        <h1>Vercel launch checklist</h1>
        <p>
          Follow the phases in order. A green check means you verified the step,
          not just that the command exists.
        </p>
      </header>

      <section className="progress-panel" aria-label="Checklist progress">
        <div className="progress-summary">
          <div>
            <span className="progress-value">
              {completed}
              <span>/{CHECKLIST_TOTAL}</span>
            </span>
            <span className="progress-label">checks complete</span>
          </div>
          <span className={`progress-pill${progress === 100 ? ' is-complete' : ''}`}>
            {progress}%
          </span>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax={CHECKLIST_TOTAL}
          aria-valuenow={completed}
          aria-label={`${completed} of ${CHECKLIST_TOTAL} checks complete`}
        >
          <span className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="progress-note">
          Progress is stored in this browser with <code>localStorage</code>. It survives
          reloads but is not shared between devices.
        </p>
      </section>

      <div className="checklist-toolbar">
        <div className="filters" role="group" aria-label="Filter checks">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={filter === item.value ? 'filter is-active' : 'filter'}
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="button button--ghost button--small"
          onClick={reset}
          disabled={completed === 0}
        >
          Reset progress
        </button>
      </div>

      {visiblePhases.length === 0 ? (
        <p className="empty-state">
          No checks match this filter. Switch back to <strong>All checks</strong>.
        </p>
      ) : (
        visiblePhases.map((phase) => {
          const source = CHECKLIST_PHASES.find((entry) => entry.id === phase.id)
          const phaseDone = source.items.filter((item) => done[item.id]).length

          return (
            <section className="phase-card" key={phase.id}>
              <header className="phase-head">
                <div>
                  <h2>{phase.title}</h2>
                  <p>{phase.description}</p>
                </div>
                <span className="phase-count">
                  {phaseDone}/{source.items.length}
                </span>
              </header>

              <ul className="check-list">
                {phase.items.map((item) => {
                  const isDone = Boolean(done[item.id])

                  return (
                    <li
                      className={isDone ? 'check-item is-done' : 'check-item'}
                      key={item.id}
                    >
                      <label className="check-main">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(item.id)}
                        />
                        <span className="check-box" aria-hidden="true">
                          <CheckIcon size={14} />
                        </span>
                        <span className="check-copy">
                          <strong>{item.title}</strong>
                          <span>{item.detail}</span>
                        </span>
                      </label>

                      {item.command ? (
                        <div className="check-command">
                          <CodeBlock code={item.command} />
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })
      )}

      <p className="checklist-footnote">
        The checklist is a guide, not a substitute for reading the build log. If a
        deployment fails, fix the build locally first.
      </p>
    </div>
  )
}
