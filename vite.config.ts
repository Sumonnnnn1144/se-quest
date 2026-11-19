import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // The midterm review page ships with the site until its screens move to React.
  publicDir: 'review',
  // Lessons and quizzes stay in content/, outside src/, so they can be edited without touching components.
  server: { fs: { allow: ['.'] } },
  test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
});
