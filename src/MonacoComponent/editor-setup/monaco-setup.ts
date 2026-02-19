import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'
import EditorWorker from './editor.worker.js?worker'
import YamlWorker from './yaml.worker.js?worker'

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'yaml') return new YamlWorker()
    return new EditorWorker()
  }
}

loader.config({ monaco })

export { monaco }
