// App.tsx
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [value, setValue] = useState<string>(
    `// Попробуй написать код здесь\n` +
    `function hello(name: string): string {\n` +
    `  return "Привет, " + name + "!";\n` +
    `}\n\n` +
    `console.log(hello("Monaco"));`
  );

  return (
    <div className="app-container">
      <h1>Monaco Editor — тест</h1>

      <div style={{ height: '70vh', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="typescript"
          defaultValue={value}
          value={value}
          onChange={(newValue) => setValue(newValue || '')}
          theme="vs-dark"           // или "light" / "hc-black" / "hc-light"
          options={{
            fontSize: 15,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            roundedSelection: false,
            padding: { top: 12 },
            folding: true,
            lineNumbers: 'on',
            glyphMargin: false,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
          }}
        />
      </div>

      <div className="output">
        <h3>Текущий код:</h3>
        <pre>{value}</pre>
      </div>
    </div>
  );
}

export default App;