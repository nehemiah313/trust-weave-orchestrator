import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['supabase/functions/__tests__/**/*.test.ts'],
    exclude: ['trustEngine/**'],
  },
})
