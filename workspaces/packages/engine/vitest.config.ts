import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,          // describe/it/expect sans import
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/index.ts'],
        }
    }
})