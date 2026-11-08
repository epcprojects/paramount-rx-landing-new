import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Polling: native file events were being missed in this folder, so edits weren't picked up.
  server: { port: 5173, watch: { usePolling: true, interval: 300 } },
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', '@gsap/react'] },
  // Two pages: the main landing page (/) and an independent copy to explore an alternative design (/option-2/).
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        option2: fileURLToPath(new URL('./option-2/index.html', import.meta.url)),
      },
    },
  },
})
