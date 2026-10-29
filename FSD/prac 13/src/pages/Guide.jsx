import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock.jsx'
import { ArrowIcon, CloudIcon, CubeIcon, RouteIcon, ShieldIcon } from '../components/Icons.jsx'
import { appConfig } from '../config.js'

const VERCEL_JSON = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`

const ENV_VARS = [
  {
    name: 'VITE_APP_NAME',
    example: 'DeployBoard',
    purpose: 'Brand name shown in the header and document title.',
  },
  {
    name: 'VITE_APP_VERSION',
    example: '1.0.0',
    purpose: 'Version label in the build snapshot.',
  },
  {
    name: 'VITE_DEPLOY_ENV',
    example: 'production',
    purpose: 'Environment label displayed in the header.',
  },
]

const CONFIG_ROWS = [
  ['Framework preset', 'Vite', 'Auto-detected by Vercel'],
  ['Root directory', 'prac 13', 'Dashboard import settings'],
  ['Build command', 'npm run build', 'vercel.json'],
  ['Output directory', 'dist', 'vercel.json'],
  ['Install command', 'npm install', 'Vercel default'],
  ['Node.js version', '22.x', '.nvmrc'],
  ['SPA fallback', '/(.*) → /index.html', 'vercel.json rewrites'],
]

const TROUBLESHOOTING = [
  {
    problem: 'Refreshing /checklist returns 404',
    fix: 'Confirm the catch-all rewrite is deployed and the output directory is dist. Vercel must return index.html for unknown paths.',
  },
  {
    problem: 'The deployed page is blank',
    fix: 'Open the browser console and the build log. A blank page usually means assets returned HTML or the build output path was wrong.',
  },
  {
    problem: 'An environment variable is undefined',
    fix: 'Only VITE_ prefixed names are exposed to the browser. Add the variable to Vercel, then redeploy because Vite inlines values at build time.',
  },
  {
    problem: 'The build works locally but fails on Vercel',
    fix: 'Use the Node version pinned in package.json (22.x), commit package-lock.json, and run npm ci locally to reproduce a clean install.',
  },
  {
    problem: 'Changes are not visible on the live site',
    fix: 'Check whether the deployment is Production or Preview, and confirm the domain points at the latest production deployment.',
  },
  {
    problem: 'Checklist progress is missing on another device',
    fix: 'That is expected. Progress uses localStorage, which is scoped to one browser and origin.',
  },
]

export default function Guide() {
  return (
    <div className="guide-page">
      <header className="page-heading">
        <span className="eyebrow">Deployment guide</span>
        <h1>From local build to live URL</h1>
        <p>
          Two supported paths: the Vercel CLI for a quick deploy, or the dashboard
          for a Git-connected project that redeploys on every push.
        </p>
      </header>

      <section className="guide-grid">
        <article className="panel">
          <div className="panel-heading">
            <span className="feature-icon feature-icon--small">
              <CubeIcon size={20} />
            </span>
            <div>
              <span className="section-kicker">Option A</span>
              <h2>Deploy with the CLI</h2>
            </div>
          </div>

          <ol className="steps">
            <li>
              <span className="step-index">1</span>
              <div>
                <h3>Install the CLI</h3>
                <CodeBlock code="npm install -g vercel" />
              </div>
            </li>
            <li>
              <span className="step-index">2</span>
              <div>
                <h3>Log in to your account</h3>
                <CodeBlock code="vercel login" />
              </div>
            </li>
            <li>
              <span className="step-index">3</span>
              <div>
                <h3>Link a preview deployment</h3>
                <p>Run this from the practical folder. The first run asks a few setup questions.</p>
                <CodeBlock code={'cd "prac 13"\nnpx vercel'} block />
              </div>
            </li>
            <li>
              <span className="step-index">4</span>
              <div>
                <h3>Promote to production</h3>
                <CodeBlock code="npx vercel --prod" />
              </div>
            </li>
          </ol>

          <p className="panel-note">
            The CLI prints the deployment URL. Keep that URL for the verification
            step.
          </p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <span className="feature-icon feature-icon--small">
              <CloudIcon size={20} />
            </span>
            <div>
              <span className="section-kicker">Option B</span>
              <h2>Deploy from the dashboard</h2>
            </div>
          </div>

          <ol className="steps">
            <li>
              <span className="step-index">1</span>
              <div>
                <h3>Push the project to Git</h3>
                <p>Commit the app to GitHub, GitLab or Bitbucket.</p>
              </div>
            </li>
            <li>
              <span className="step-index">2</span>
              <div>
                <h3>Import the repository</h3>
                <p>In Vercel choose <strong>Add New &rarr; Project</strong>, then import the repository.</p>
              </div>
            </li>
            <li>
              <span className="step-index">3</span>
              <div>
                <h3>Set the root directory</h3>
                <p>
                  Point the root at <code>prac 13</code> so Vercel finds this
                  <code> package.json</code>.
                </p>
              </div>
            </li>
            <li>
              <span className="step-index">4</span>
              <div>
                <h3>Confirm the build settings</h3>
                <p>
                  Framework preset <strong>Vite</strong>, build command{' '}
                  <code>npm run build</code>, output directory <code>dist</code>.
                </p>
              </div>
            </li>
            <li>
              <span className="step-index">5</span>
              <div>
                <h3>Add environment variables</h3>
                <p>Add the three VITE_ variables for Production, Preview and Development.</p>
              </div>
            </li>
            <li>
              <span className="step-index">6</span>
              <div>
                <h3>Deploy</h3>
                <p>
                  Every push to the production branch redeploys. Other branches and
                  pull requests receive preview URLs.
                </p>
              </div>
            </li>
          </ol>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading section-heading--compact">
          <div>
            <span className="section-kicker">Reference</span>
            <h2>Project settings</h2>
          </div>
          <p>The same values are declared in the repository, so the dashboard can stay on auto-detect.</p>
        </div>

        <div className="table-wrap">
          <table className="config-table">
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {CONFIG_ROWS.map(([setting, value, source]) => (
                <tr key={setting}>
                  <td>{setting}</td>
                  <td>
                    <code>{value}</code>
                  </td>
                  <td>{source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="guide-grid">
        <article className="panel">
          <div className="section-heading section-heading--compact">
            <div>
              <span className="section-kicker">Configuration</span>
              <h2>vercel.json</h2>
            </div>
          </div>
          <p>
            Vercel auto-detects Vite, but committing this file makes the build and
            routing explicit. The rewrite is what keeps deep links alive.
          </p>
          <CodeBlock code={VERCEL_JSON} label="vercel.json" block />
        </article>

        <article className="panel">
          <div className="section-heading section-heading--compact">
            <div>
              <span className="section-kicker">Build-time values</span>
              <h2>Environment variables</h2>
            </div>
          </div>
          <p>
            Vite replaces <code>import.meta.env.VITE_*</code> with literal values
            during the build. Never put secrets in a <code>VITE_</code> variable.
          </p>
          <div className="table-wrap">
            <table className="config-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                {ENV_VARS.map((item) => (
                  <tr key={item.name}>
                    <td>
                      <code>{item.name}</code>
                      <span className="table-note">{item.purpose}</span>
                    </td>
                    <td>
                      <code>{item.example}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="panel-note">
            Current environment: <strong>{appConfig.environment}</strong> &middot;
            Vercel env: <code>{appConfig.vercelEnvironment}</code>
          </p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading panel-heading--spread">
          <div>
            <span className="section-kicker">Why it works</span>
            <h2>SPA routing on Vercel</h2>
          </div>
          <span className="feature-icon feature-icon--small">
            <RouteIcon size={20} />
          </span>
        </div>
        <p>
          React Router changes the URL with the History API without requesting a new
          document. If someone opens <code>/checklist</code> directly, Vercel has no
          file at that path. The catch-all rewrite returns <code>index.html</code>,
          React boots, and React Router renders the checklist. Hashed files under{' '}
          <code>/assets/</code> keep their own URLs and are served normally.
        </p>
        <div className="callout">
          <ShieldIcon />
          <p>
            Without the rewrite, the app works while navigating inside it but breaks
            on refresh or when a deep link is shared.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading section-heading--compact">
          <div>
            <span className="section-kicker">Post-deploy</span>
            <h2>Verify the live deployment</h2>
          </div>
        </div>
        <p>Run these against your deployment URL. The deep link must return HTML, not a 404.</p>
        <div className="command-stack">
          <CodeBlock code="curl -I https://your-app.vercel.app/" label="Home page" />
          <CodeBlock
            code="curl -I https://your-app.vercel.app/checklist"
            label="Deep link (SPA rewrite)"
          />
        </div>
      </section>

      <section className="panel">
        <div className="section-heading section-heading--compact">
          <div>
            <span className="section-kicker">Troubleshooting</span>
            <h2>Common deployment failures</h2>
          </div>
        </div>

        <div className="troubleshoot-grid">
          {TROUBLESHOOTING.map((item) => (
            <article className="troubleshoot-card" key={item.problem}>
              <h3>{item.problem}</h3>
              <p>{item.fix}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-panel">
        <div>
          <span className="section-kicker">Next step</span>
          <h2>Track the deployment as you go.</h2>
          <p>The checklist keeps every phase in one place and remembers your progress.</p>
        </div>
        <Link className="button" to="/checklist">
          Open the checklist
          <ArrowIcon />
        </Link>
      </section>
    </div>
  )
}
