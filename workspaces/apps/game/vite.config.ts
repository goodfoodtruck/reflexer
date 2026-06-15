import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@components": path.resolve(__dirname, "./src/components"),
            "@pages":      path.resolve(__dirname, "./src/pages"),
            "@hooks":      path.resolve(__dirname, "./src/hooks"),
            "@services":   path.resolve(__dirname, "./src/services"),
            "@assets":     path.resolve(__dirname, "./src/assets"),
            "@features":   path.resolve(__dirname, "./src/features"),
            "@shared":     path.resolve(__dirname, "./src/types")
        }
    }
})