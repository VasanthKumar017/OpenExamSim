import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'open_exam_sim', // The name other apps will use to find this
      filename: 'remoteEntry.js', // The "manifest" file for the MFE
      exposes: {
        // We expose our core modules so they can be loaded independently
        './Engine': './src/core/engine.ts',
        './Renderer': './src/core/renderer.ts',
        './Styles': './src/styles/main.scss'
      },
      shared: ['typescript'] // Prevents loading the same library multiple times
    })
  ],
  build: {
    target: 'esnext', // Required for Module Federation to work with top-level await
    minify: false,
    cssCodeSplit: false
  }
});