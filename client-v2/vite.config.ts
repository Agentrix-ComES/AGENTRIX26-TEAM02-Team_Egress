import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    host: true,
    watch: {
      // The repo lives on a Windows drive (/mnt/d) — inotify never fires there
      // under WSL, so HMR silently serves stale modules without polling.
      usePolling: true,
      interval: 300,
    },
  },
})
