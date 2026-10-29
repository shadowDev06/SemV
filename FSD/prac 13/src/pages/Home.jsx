import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock.jsx'
import DeploymentCard from '../components/DeploymentCard.jsx'
import {
  ArrowIcon,
  CloudIcon,
  CubeIcon,
  RouteIcon,
  ShieldIcon,
} from '../components/Icons.jsx'
import { appConfig } from '../config.js'
import { CHECKLIST_TOTAL } from '../data/checklist.js'

export default function Home() {
  const snapshot = [
    { label: 'Application', value: `${appConfig.name} v${appConfig.version}` },
    { label: 'Vite mode', value: <code>{appConfig.mode}</code> },
    { label: 'Deployment environment', value: appConfig.environment },
    { label: 'Vercel environment', value: <code>{appConfig.vercelEnvironment}</code> },
    { label: 'Commit', value: <code>{appConfig.commit}</code> },
    { label: 'Host', value: appConfig.hostname || 'local' },
    { label: 'Base URL', value: <code>{appConfig.baseUrl}</code> },
    {
      label: 'Deployment URL',
      value: appConfig.deploymentUrl ? (
        <a href={appConfig.deploymentUrl} target="_blank" rel="noreferrer">
          {appConfig.deploymentUrl}
        </a>
      ) : (
        <code>{appConfig.origin || 'local preview'}</code>
      ),
    },
  ]

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Practical 13 &middot; Vercel deployment
          </span>
          <h1>
            Ship your React app to <span className="gradient-text">Vercel</span>.
          </h1>
          <p className="hero-lede">
            A production-ready Vite + React single-page application with client-side
            routing, build-time environment values and a deployment runbook. Push it to
            Git or use the CLI, and Vercel handles the rest.
          </p>

          <div className="hero-actions">
            <Link className="button" to="/checklist">
              Open the checklist
              <ArrowIcon />
            </Link>
            <Link className="button button--secondary" to="/guide">
              Read the guide
            </Link>
          </div>

          <CodeBlock label="Deploy from the CLI" code="npx vercel --prod" />
        </div>

        <DeploymentCard />
      </section>

      <ul className="stat-strip" aria-label="Deployment facts">
        <li>
          <span>Framework</span>
          <strong>Vite 8 + React 19</strong>
        </li>
        <li>
          <span>Build</span>
          <strong>npm run build</strong>
        </li>
        <li>
          <span>Output</span>
          <strong>dist/</strong>
        </li>
        <li>
          <span>Routing</span>
          <strong>SPA rewrites</strong>
        </li>
      </ul>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Snapshot</span>
            <h2>This build, right now</h2>
          </div>
          <p>
            Vite injects these values while building. On Vercel, the deployment
            environment, commit and URL come from Vercel&apos;s system variables.
          </p>
        </div>

        <dl className="info-grid">
          {snapshot.map((item) => (
            <div key={item.label} className="info-item">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">How it works</span>
            <h2>Three moving parts</h2>
          </div>
          <p>
            The app is static after the build. Vercel&apos;s job is to build it,
            host the files, and route deep links back to React.
          </p>
        </div>

        <div className="card-grid">
          <article className="feature-card">
            <span className="feature-icon">
              <CubeIcon />
            </span>
            <h3>Build once</h3>
            <p>
              <code>npm run build</code> bundles React into <code>dist/</code> with
              hashed asset names. Vercel caches those files on its edge network.
            </p>
          </article>

          <article className="feature-card">
            <span className="feature-icon">
              <CloudIcon />
            </span>
            <h3>Preview, then promote</h3>
            <p>
              Every branch or pull request gets its own preview URL. Promote the
              verified build to production with one command or one click.
            </p>
          </article>

          <article className="feature-card">
            <span className="feature-icon">
              <RouteIcon />
            </span>
            <h3>Route safely</h3>
            <p>
              React Router handles the URL in the browser. A <code>vercel.json</code>{' '}
              rewrite sends unknown paths to <code>index.html</code> so refreshes work.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Hardening</span>
            <h2>Production details that matter</h2>
          </div>
          <p>Small settings that prevent the usual deployment surprises.</p>
        </div>

        <div className="card-grid card-grid--two">
          <article className="feature-card feature-card--inline">
            <span className="feature-icon">
              <ShieldIcon />
            </span>
            <div>
              <h3>Environment variables</h3>
              <p>
                Only variables prefixed with <code>VITE_</code> reach the browser.
                Vite inlines them at build time, so redeploy after changing one.
              </p>
            </div>
          </article>

          <article className="feature-card feature-card--inline">
            <span className="feature-icon">
              <CloudIcon />
            </span>
            <div>
              <h3>Node version pin</h3>
              <p>
                <code>.nvmrc</code> pins Node 22, satisfying the Vite 8 engine
                requirement and keeping local and Vercel builds aligned.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="cta-panel">
        <div>
          <span className="section-kicker">Ready when you are</span>
          <h2>Work through {CHECKLIST_TOTAL} deployment checks.</h2>
          <p>
            Each step is saved in your browser, so you can leave and come back
            without losing your place.
          </p>
        </div>
        <Link className="button" to="/checklist">
          Start the checklist
          <ArrowIcon />
        </Link>
      </section>
    </>
  )
}
