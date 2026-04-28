import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleTranslateRequest } from './server/glm-service.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [
            react(),
            {
                name: 'local-translate-api',
                configureServer(server) {
                    server.middlewares.use('/api/translate', (req, res) => {
                        handleTranslateRequest(req, res, { ...process.env, ...env })
                    })
                },
            },
        ],
        server: {
            host: true,
            port: 5173,
        },
    }
})
