import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // Si estamos en Vercel, la base debe ser '/', si es producción normal (GitHub Pages), usamos el nombre del repo.
  const basePath = process.env.VERCEL ? '/' : (process.env.NODE_ENV === 'production' ? '/MC-CENTINELA-FINANCIERO/' : '/');
  
  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(
        [process.env.GEMINI_API_KEY, process.env.cent, env.VITE_GEMINI_API_KEY, env.VITE_CENT].find(k => k && k !== "MY_GEMINI_API_KEY" && k !== "") || ""
      ),
      'import.meta.env.VITE_CENT': JSON.stringify(
        [process.env.cent, env.VITE_CENT].find(k => k && k !== "MY_GEMINI_API_KEY" && k !== "") || ""
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false,
    },
  };
});
