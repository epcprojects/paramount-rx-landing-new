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
  // Pages: the main landing page (/) and independent copies to explore alternative designs (/option-2/ … /option-5/; option-5 is a copy of the main page).
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        option2: fileURLToPath(new URL('./option-2/index.html', import.meta.url)),
        option3: fileURLToPath(new URL('./option-3/index.html', import.meta.url)),
        option4: fileURLToPath(new URL('./option-4/index.html', import.meta.url)),
        option5: fileURLToPath(new URL('./option-5/index.html', import.meta.url)),
      },
    },
  },
})
