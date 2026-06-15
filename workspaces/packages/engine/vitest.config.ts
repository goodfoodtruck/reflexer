import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
        coverage: {
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.types.ts'],
        },
    },
    resolve: {
        alias: {
            '@game-engine': resolve(__dirname, 'src/game-engine'),
            '@data':        resolve(__dirname, 'src/data'),
            '@fight':       resolve(__dirname, 'src/fight'),
            '@helpers':     resolve(__dirname, 'src/helpers'),
            '@gambits':     resolve(__dirname, 'src/fight/gambits'),
            '@processors':  resolve(__dirname, 'src/fight/processors'),
            '@context':     resolve(__dirname, 'src/fight/context'),
            '@tests':       resolve(__dirname, 'tests')
        }
    }
})