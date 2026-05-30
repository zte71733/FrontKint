import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
        timeout: 1000,
        proxyTimeout: 1000,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            // Silently handle proxy errors (ECONNREFUSED)
            if (res.writeHead) {
              res.writeHead(502, { 'Content-Type': 'text/plain' });
              res.end('Backend unavailable in standalone mode.');
            }
          });
        },
      },
    },
  },
})
