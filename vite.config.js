import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import config from './app.config.js'

export default defineConfig({
  plugins: [
    react(),
    // Replaces %APP_NAME% in index.html with the value from app.config.js
    {
      name: 'html-inject-app-config',
      transformIndexHtml: html => html.replace(/%APP_NAME%/g, config.name),
    },
  ],
  // Must match basePath in app.config.js
  base: config.basePath + '/',
})
