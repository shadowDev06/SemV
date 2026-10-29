import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const vercelEnv = process.env.VERCEL_ENV || 'local'
const vercelCommit = process.env.VERCEL_GIT_COMMIT_SHA || ''
const vercelUrl = process.env.VERCEL_URL || ''

export default defineConfig({
  plugins: [react()],
  define: {
    __VERCEL_ENV__: JSON.stringify(vercelEnv),
    __VERCEL_COMMIT__: JSON.stringify(vercelCommit ? vercelCommit.slice(0, 7) : 'local'),
    __VERCEL_URL__: JSON.stringify(vercelUrl),
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
})
