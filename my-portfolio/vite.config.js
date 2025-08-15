import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function computeBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (!repo) return '/'
  if (repo.endsWith('.github.io')) return '/'
  return `/${repo}/`
}

export default defineConfig({
  plugins: [react()],
  base: computeBase(),
  define: {
    // GitHub Actions에선 커밋 SHA, 로컬에선 timestamp를 버전으로 사용
    __BUILD_ID__: JSON.stringify(process.env.GITHUB_SHA || String(Date.now()))
  }
})
