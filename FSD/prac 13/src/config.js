const env = import.meta.env

const vercelEnvironment =
  typeof __VERCEL_ENV__ !== 'undefined' ? __VERCEL_ENV__ : 'local'
const vercelCommit =
  typeof __VERCEL_COMMIT__ !== 'undefined' ? __VERCEL_COMMIT__ : 'local'
const vercelUrl = typeof __VERCEL_URL__ !== 'undefined' ? __VERCEL_URL__ : ''

const hostname =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const origin = typeof window !== 'undefined' ? window.location.origin : ''

export const appConfig = {
  name: env.VITE_APP_NAME || 'DeployBoard',
  version: env.VITE_APP_VERSION || '1.0.0',
  environment: env.VITE_DEPLOY_ENV || vercelEnvironment,
  mode: env.MODE,
  baseUrl: env.BASE_URL,
  isProduction: env.PROD,
  vercelEnvironment,
  commit: vercelCommit,
  deploymentUrl: vercelUrl ? `https://${vercelUrl}` : '',
  origin,
  hostname,
  isVercelHost: hostname.endsWith('.vercel.app'),
}
