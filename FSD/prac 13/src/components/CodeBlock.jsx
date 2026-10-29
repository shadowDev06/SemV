import { useState } from 'react'
import { CheckIcon, CopyIcon } from './Icons.jsx'

export default function CodeBlock({ code, label, block = false }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={block ? 'code-block code-block--panel' : 'code-block'}>
      {label ? <span className="code-label">{label}</span> : null}
      <div className="code-row">
        {block ? (
          <pre>
            <code>{code}</code>
          </pre>
        ) : (
          <code>{code}</code>
        )}
        <button
          type="button"
          className="copy-button"
          onClick={copy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
          title="Copy to clipboard"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className="copy-text">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <span className="sr-only" role="status">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </div>
  )
}
