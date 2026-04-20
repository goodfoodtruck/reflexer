import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

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
    },
    resolve: {
        alias: {
            '@fight':      resolve(__dirname, 'src/fight'),
            '@helpers':    resolve(__dirname, 'src/helpers'),
            '@gambits':    resolve(__dirname, 'src/fight/gambits'),
            '@test-utils': resolve(__dirname, 'src/test-utils'),
        }
    }
})