import * as monaco from 'monaco-editor'
import { configureMonacoYaml } from 'monaco-yaml'
import schema from './schema.json'
import EditorWorker from './editor.worker.js?worker'
import YamlWorker from './yaml.worker.js?worker'

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'yaml') return new YamlWorker()
    return new EditorWorker()
  }
}

configureMonacoYaml(monaco, {
  enableSchemaRequest: false,
  hover: true,
  completion: true,
  validate: true,
  format: true,
  schemas: [
    {
      uri: 'schema://config',
      fileMatch: ['**/config.yaml'],
      schema: schema as unknown as Record<string, unknown>
    }
  ]
})

export { monaco }
