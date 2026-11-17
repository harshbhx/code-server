import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const here = fileURLToPath(new URL('.', import.meta.url));
const webUi = fileURLToPath(new URL('../packages/web-ui/', import.meta.url));
const stub = (n: string) => `${here}stubs/${n}.tsx`;

export default defineConfig({
    root: here,
    plugins: [react()],
    css: {postcss: webUi},
    server: {fs: {strict: false}},
    resolve: {
        alias: [
            {find: '@/hooks/useDatabase', replacement: stub('useDatabase')},
            {find: '@/hooks/useAlert', replacement: stub('useAlert')},
            {find: '@/hooks/useTabularisClient', replacement: stub('useTabularisClient')},
            {find: '@/hooks/usePlatformCapabilities', replacement: stub('usePlatformCapabilities')},
            {find: '@/hooks/useToast', replacement: stub('useToast')},
            {find: '@/hooks/useSettings', replacement: stub('useSettings')},
            {find: '@/hooks/useRightSidebar', replacement: stub('useRightSidebar')},
            {find: '@/platform/secondaryWindowSessions', replacement: stub('secondaryWindowSessions')},
            {find: '@tauri-apps/api/event', replacement: stub('tauriEvent')},
            {find: /^buffer$/, replacement: 'buffer'},
            {find: /^util$/, replacement: 'util'},
            {find: '@', replacement: `${webUi}src`},
        ],
    },
    define: {global: 'globalThis', 'process.env': {}},
});
