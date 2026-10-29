# Practical 13: Deploying a React Application using Vercel

## Aim
To build a React application with Vite and deploy it to Vercel as a static single-page application with client-side routing.

## Objectives
- Create a production React application with Vite.
- Add client-side routing with React Router.
- Configure Vercel explicitly with `vercel.json`: framework preset, build command, output directory and SPA rewrites.
- Expose build-time configuration through Vite environment variables.
- Surface real deployment metadata (environment, commit and deployment URL) without exposing secrets.
- Deploy through the Vercel CLI or the Vercel dashboard.
- Verify deep links, production builds and deployment health.

## What this practical demonstrates
- A deployable React 19 + Vite 8 single-page application.
- Client-side routes (`/`, `/checklist`, `/guide`) that work on refresh and when shared as deep links.
- An interactive deployment checklist persisted in `localStorage`.
- Build-time environment values and Vercel system metadata shown in the UI.
- A committed `vercel.json` that makes the deployment configuration reproducible.

## Stack
| Layer | Technology |
|-------|------------|
| UI | React 19 |
| Build tool | Vite 8 |
| Routing | React Router 7 |
| Hosting | Vercel (static build + SPA rewrite) |
| Runtime | Node.js 22.x (`.nvmrc`) |

## Folder structure
```text
prac 13/
├── README.md
├── package.json              # Scripts and dependencies
├── package-lock.json         # Created by npm install; commit it
├── .nvmrc                    # Pins Node 22 for Vercel and nvm users
├── .npmrc                    # include=dev so Vite installs under NODE_ENV=production
├── vite.config.js            # React plugin, dev/preview ports, Vercel metadata
├── vercel.json               # Framework, build, output and SPA rewrite
├── index.html                # Vite HTML entry point
├── .env.example              # Template for local VITE_ variables
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx              # React root
    ├── App.jsx               # Router and page layout
    ├── config.js             # Reads environment and deployment metadata
    ├── styles.css            # Design system and responsive layout
    ├── components/
    │   ├── CodeBlock.jsx     # Copy-to-clipboard command blocks
    │   ├── DeploymentCard.jsx
    │   ├── Footer.jsx
    │   ├── Icons.jsx
    │   ├── NavBar.jsx
    │   └── ScrollToTop.jsx
    ├── data/
    │   └── checklist.js      # Deployment runbook content
    ├── hooks/
    │   └── useLocalStorage.js
    └── pages/
        ├── Home.jsx          # Overview and build snapshot
        ├── Checklist.jsx     # Interactive deployment checklist
        ├── Guide.jsx         # CLI / dashboard deployment guide
        └── NotFound.jsx      # Client-side 404 route
```

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm. `.nvmrc` pins Node 22 for Vercel; the local machine can use any supported Node version.

```bash
cd "prac 13"
npm install
npm run dev
```

If your shell sets `NODE_ENV=production`, the local `.npmrc` (`include=dev`) still installs Vite and the React plugin. Without it, npm would skip `devDependencies` and the build would fail.

Open <http://localhost:5173>.

Optionally create a local environment file:

```bash
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

The values already have defaults in `src/config.js`, so the app runs without `.env`.

### Production build locally

```bash
npm run build
npm run preview
```

`npm run build` writes the static bundle to `dist/`. `npm run preview` serves it at <http://localhost:4173>.

## Deploy to Vercel

The project is deployment-ready. Deploying requires your own Vercel account; the steps below are the complete process.

### Option A: Vercel CLI

1. Install the CLI (once):
   ```bash
   npm install -g vercel
   ```

2. Authenticate:
   ```bash
   vercel login
   ```

3. From `prac 13`, create a preview deployment:
   ```bash
   vercel
   ```
   The first run asks for the project name, scope and settings. Accept the detected Vite settings.

4. Verify the preview URL, then promote the same project to production:
   ```bash
   vercel --prod
   ```

The repository also includes helper scripts:

```bash
npm run deploy:preview   # vercel
npm run deploy           # vercel --prod
```

These call the globally installed `vercel` binary. If you do not install it globally, use `npx vercel` and `npx vercel --prod` directly.

### Option B: Vercel dashboard (Git integration)

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Set **Root Directory** to `prac 13`.
4. Keep the detected framework preset **Vite**.
5. Confirm the build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
   - Node.js version: `22.x`
6. Add the environment variables from the table below for **Production**, **Preview** and **Development**.
7. Deploy. Pushes to the production branch create production deployments; other branches and pull requests create preview URLs.

## Vercel configuration

`vercel.json` makes the deployment behaviour explicit:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

| Setting | Value | Purpose |
|---------|-------|---------|
| `framework` | `vite` | Uses Vercel's Vite preset and build defaults |
| `buildCommand` | `npm run build` | Produces the static bundle |
| `outputDirectory` | `dist` | Folder Vercel serves |
| `rewrites` | `/(.*)` → `/index.html` | Lets React Router handle deep links |
| `headers` | `nosniff`, referrer policy | Basic hardening for every response |

Vercel detects Vite automatically, but committing these values prevents a dashboard setting from silently changing the build.

## Environment variables

Only variables prefixed with `VITE_` are exposed to browser code. Vite inlines them at build time, so a running deployment must be rebuilt after a value changes. Never put API secrets in a `VITE_` variable.

| Variable | Example | Used for |
|----------|---------|----------|
| `VITE_APP_NAME` | `DeployBoard` | Header brand and document title |
| `VITE_APP_VERSION` | `1.0.0` | Version in the build snapshot |
| `VITE_DEPLOY_ENV` | `production` | Environment label in the header |

Vercel also provides system variables during the build. `vite.config.js` exposes three safe, non-secret values to the client through `define`:

| Vercel variable | Exposed as | Local default |
|-----------------|------------|---------------|
| `VERCEL_ENV` | `__VERCEL_ENV__` | `local` |
| `VERCEL_GIT_COMMIT_SHA` | `__VERCEL_COMMIT__` (first 7 characters) | `local` |
| `VERCEL_URL` | `__VERCEL_URL__` | empty string |

The overview page displays these values so you can confirm which commit and environment are live.

## Application routes

| Route | Page |
|-------|------|
| `/` | Overview, build snapshot, deployment facts |
| `/checklist` | Interactive Vercel deployment checklist |
| `/guide` | CLI and dashboard deployment guide, config reference, troubleshooting |
| `*` | Client-side 404 |

### Why the rewrite is required

React Router updates the URL with the History API without requesting a new document. When someone opens `/checklist` directly, no file exists at that path. The catch-all rewrite returns `index.html`; React boots and React Router renders the checklist. Without it, the app works while navigating internally but a refresh or shared deep link returns a 404.

## Verify a deployment

Replace the placeholder with your deployment URL:

```bash
# Home page should return 200 and HTML
curl -I https://your-app.vercel.app/

# Deep link should also return 200 and HTML, not 404
curl -I https://your-app.vercel.app/checklist
```

In the browser:
1. Open `/`, `/checklist` and `/guide` through the navigation.
2. Refresh `/checklist` directly.
3. Confirm the build snapshot shows the expected Vercel environment and commit.
4. Open the checklist, mark a few items, reload, and confirm progress is retained.

## Troubleshooting

| Symptom | Cause and fix |
|---------|---------------|
| Refreshing `/checklist` returns 404 | The SPA rewrite is missing or not deployed. Confirm `vercel.json` and that the output directory is `dist`. |
| Blank page after deployment | Assets returned HTML or the build output is wrong. Check the browser console, the build log and `outputDirectory`. |
| An environment variable is `undefined` | It lacks the `VITE_` prefix, was added to the wrong environment, or the project was not rebuilt. |
| Build fails only on Vercel | Recreate a clean install with `npm ci`, use Node 22.x and commit `package-lock.json`. |
| Live site shows an old version | The domain may point to a preview deployment, or the production deployment is stale. Check the deployment list and commit. |
| Checklist progress is missing on another device | Expected: progress is stored with `localStorage`, which is per browser and origin. |

## Theory

### Static deployment
Vite compiles React, CSS and assets into static files in `dist/`. There is no Node server at runtime; Vercel serves the files from its edge network. A deployment therefore has two phases: a build step on Vercel's build infrastructure and static file delivery from the CDN.

### Vercel builds
When a project is connected to Git, Vercel runs the install and build commands for every push. Production branches produce production deployments; other branches produce preview deployments with their own URLs. The same repository and commit therefore produce an immutable, reproducible artifact.

### SPA routing and rewrites
A single-page application ships one `index.html` and lets client-side JavaScript choose the view. The hosting layer must return `index.html` for paths that do not match a real file. The rewrite in `vercel.json` is that fallback. Hashed files under `/assets/` keep their own URLs and are served as static assets.

### Environment variables and build-time inlining
Vite exposes `import.meta.env.VITE_*` values by replacing them with literals during the build. This is convenient for non-secret configuration but means the deployed bundle cannot read a changed value without a new build. Server-side secrets belong in a backend or a Vercel Function, never in a `VITE_` variable.

### Request flow after deployment
```text
Browser requests /checklist
  -> Vercel edge network
     -> no static file at /checklist
        -> rewrite to /index.html
           -> React bundle loads
              -> React Router matches /checklist
                 -> Checklist page renders
```

## Conclusion
Deploying a React application to Vercel is a build-and-host problem: Vite produces a static `dist/` bundle, `vercel.json` declares how to build and route it, and Vercel handles the CDN, previews and production promotion. The SPA rewrite is what makes client-side routes survive refreshes, and build-time environment values let the same code run correctly in local, preview and production environments.
