import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // En GitHub Actions (CI) se despliega con el prefijo del repo;
  // en local el servidor de desarrollo sirve en la raíz.
  base: process.env.GITHUB_ACTIONS ? '/Prueba-01/' : '/',
  build: {
    rollupOptions: {
      external: [/^@epicgames-ps\//],
    },
  },
})
