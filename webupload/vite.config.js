import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: '/River%20trading/', // Must match folder name for XAMPP
    server: {
        // Forward API and uploads to XAMPP (port 80) when using dev server (port 5173)
        proxy: {
            '/River%20trading/api': {
                target: 'http://localhost',
                changeOrigin: true,
            },
            '/River%20trading/uploads': {
                target: 'http://localhost',
                changeOrigin: true,
            },
        },
    },
});
