export const CHECKLIST_PHASES = [
  {
    id: 'prepare',
    title: 'Prepare the project',
    description: 'Make sure the production build works before Vercel ever sees it.',
    items: [
      {
        id: 'install',
        title: 'Install dependencies',
        detail: 'Run npm install from the project root and commit the generated package-lock.json.',
        command: 'npm install',
      },
      {
        id: 'build',
        title: 'Create a production build',
        detail: 'Vite writes the static bundle to dist/. A local build should finish without warnings.',
        command: 'npm run build',
      },
      {
        id: 'preview',
        title: 'Preview the built app',
        detail: 'Serve dist/ locally and click through every route before deploying.',
        command: 'npm run preview',
      },
    ],
  },
  {
    id: 'configure',
    title: 'Configure Vercel',
    description: 'Match the settings Vercel will use for builds and routing.',
    items: [
      {
        id: 'root-directory',
        title: 'Set the root directory',
        detail: 'When importing the repository, set the project root to prac 13.',
      },
      {
        id: 'env-vars',
        title: 'Add environment variables',
        detail: 'Add VITE_APP_NAME, VITE_APP_VERSION and VITE_DEPLOY_ENV for Production, Preview and Development.',
      },
      {
        id: 'rewrites',
        title: 'Confirm the SPA rewrite',
        detail: 'vercel.json rewrites every path to index.html so React Router handles deep links.',
        command: 'type vercel.json',
      },
      {
        id: 'node-version',
        title: 'Use a supported Node version',
        detail: '.nvmrc pins Node 22, which satisfies the Vite 8 engine requirement.',
      },
    ],
  },
  {
    id: 'deploy',
    title: 'Deploy',
    description: 'Create a preview first, verify it, then promote it to production.',
    items: [
      {
        id: 'login',
        title: 'Authenticate the CLI',
        detail: 'Only needed for CLI deployments. Dashboard imports authenticate through Git.',
        command: 'vercel login',
      },
      {
        id: 'preview-deploy',
        title: 'Create a preview deployment',
        detail: 'The first run links the folder to a Vercel project and returns a preview URL.',
        command: 'npx vercel',
      },
      {
        id: 'production-deploy',
        title: 'Promote to production',
        detail: 'Build the same project for the production domain.',
        command: 'npx vercel --prod',
      },
    ],
  },
  {
    id: 'verify',
    title: 'Verify the deployment',
    description: 'Check routing, environment values and build health on the live URL.',
    items: [
      {
        id: 'deep-link',
        title: 'Open a deep link directly',
        detail: 'Visit /checklist on the deployed domain. It must load the app, not a 404.',
      },
      {
        id: 'env-values',
        title: 'Check the build snapshot',
        detail: 'The overview page shows the Vite mode, environment and commit exposed at build time.',
      },
      {
        id: 'build-logs',
        title: 'Review the Vercel build log',
        detail: 'Confirm the install, build and output steps completed without errors.',
      },
      {
        id: 'custom-domain',
        title: 'Attach a custom domain (optional)',
        detail: 'Add the domain in Project Settings, then verify DNS and HTTPS.',
      },
    ],
  },
]

export const CHECKLIST_TOTAL = CHECKLIST_PHASES.reduce(
  (total, phase) => total + phase.items.length,
  0,
)
