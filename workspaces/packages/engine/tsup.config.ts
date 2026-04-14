import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,          // génère les .d.ts
    clean: true,
    sourcemap: true,
})