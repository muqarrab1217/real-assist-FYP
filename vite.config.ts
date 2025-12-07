import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  publicDir: 'public',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true,
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        timeout: 60000, // 60 seconds for large uploads
        onError: (err, req, res) => {
          console.error('Proxy error:', err);
          // Return JSON error instead of HTML
          if (res && !res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Backend server is not running. Please start it with: npm run dev:backend' 
            }));
          }
        },
      },
    },
  },
  preview: {
    host: true,
    port: 3000,
    allowedHosts: [
      'real-assist-fyp.onrender.com',
      'real-assist-rag.onrender.com',
    ],
  },
})
