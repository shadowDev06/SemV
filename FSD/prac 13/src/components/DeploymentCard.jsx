import { appConfig } from '../config.js'
import { CheckIcon } from './Icons.jsx'

export default function DeploymentCard() {
  return (
    <aside className="deploy-card" aria-label="Example production deployment">
      <div className="deploy-card-head">
        <span className="deploy-live">
          <span className="pulse" aria-hidden="true" />
          Production
        </span>
        <span className="deploy-env">{appConfig.vercelEnvironment}</span>
      </div>

      <p className="deploy-url" title={appConfig.deploymentUrl || 'Preview URL after deployment'}>
        {appConfig.deploymentUrl || 'https://your-app.vercel.app'}
      </p>

      <ol className="deploy-steps">
        <li className="is-done">
          <span className="step-num">01</span>
          <span className="step-copy">
            <strong>Install &amp; build</strong>
            <small>npm run build</small>
          </span>
          <span className="step-state">
            <CheckIcon />
          </span>
        </li>
        <li className="is-done">
          <span className="step-num">02</span>
          <span className="step-copy">
            <strong>Upload dist/</strong>
            <small>Static assets + index.html</small>
          </span>
          <span className="step-state">
            <CheckIcon />
          </span>
        </li>
        <li className="is-active">
          <span className="step-num">03</span>
          <span className="step-copy">
            <strong>Assign domain</strong>
            <small>Preview &rarr; production</small>
          </span>
          <span className="step-state">Live</span>
        </li>
      </ol>

      <dl className="deploy-meta">
        <div>
          <dt>Framework</dt>
          <dd>Vite</dd>
        </div>
        <div>
          <dt>Output</dt>
          <dd>dist/</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{appConfig.mode}</dd>
        </div>
        <div>
          <dt>Commit</dt>
          <dd>{appConfig.commit}</dd>
        </div>
      </dl>
    </aside>
  )
}
