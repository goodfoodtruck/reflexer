import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
    },
    resolve: {
        alias: {
            '@fight':       resolve(__dirname, 'src/fight'),
            '@data':        resolve(__dirname, 'src/data'),
            '@processors':  resolve(__dirname, 'src/fight/processors'),
            '@context':     resolve(__dirname, 'src/fight/context'),
            '@game-engine': resolve(__dirname, 'src/game-state'),
            '@helpers':     resolve(__dirname, 'src/helpers'),
            '@gambits':     resolve(__dirname, 'src/fight/gambits'),
            '@tests':       resolve(__dirname, 'tests'),
        }
    }
})