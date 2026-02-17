import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'monaco-editor',
      'monaco-yaml',
      'monaco-editor/esm/vs/editor/editor.worker',
      'monaco-worker-manager/worker',
      'vscode-languageserver-textdocument',
    ],
  },
})
