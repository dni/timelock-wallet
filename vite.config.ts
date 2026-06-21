import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [solidPlugin(), viteSingleFile()],
  base: './',
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: Infinity,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    include: ['bitcoinjs-lib', '@scure/bip39', '@scure/bip32'],
  },
})
