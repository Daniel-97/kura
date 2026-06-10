import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: '../pb_public',
        emptyOutDir: true,
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8090',
                changeOrigin: true,
                ws: true,
            },
            '/_': {
                target: 'http://127.0.0.1:8090',
                changeOrigin: true,
            },
        },
    },
});
