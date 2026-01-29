import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // 允许局域网访问
        port: 5173, // 固定端口
        proxy: {
            '/dify-api': {
                target: 'http://dify.acesohealthy.com/v1',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/dify-api/, '')
            }
        }
    }
})
