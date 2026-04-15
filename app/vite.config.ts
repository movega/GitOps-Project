import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
const isTest = process.env.VITEST === 'true'

export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  plugins: [
    react({
      babel: isTest
        ? undefined
        : {
            plugins: [
              'react-dev-locator',
            ],
          },
    }),
    tsconfigPaths()
  ].filter(Boolean),
})
