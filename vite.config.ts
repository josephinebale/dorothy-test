import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths, so the built site also works from a sub-path like GitHub Pages
  base: './',
  plugins: [react(), tailwindcss()],
});
