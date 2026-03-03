import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: (process.env.NODE_ENV === 'production' && !process.env.VERCEL) ? '/MC-CENTINELA-FINANCIERO/' : '/',
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_APP_URL': JSON.stringify(process.env.APP_URL || ""),
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
