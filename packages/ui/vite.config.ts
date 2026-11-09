import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /<repo>/. Override with BASE_PATH if the URL changes.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/AlloraII/',
  plugins: [react()],
});
