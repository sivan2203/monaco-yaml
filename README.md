# YAML Config Editor

A React component for editing YAML configuration files with real-time validation, JSON Schema support, and diff preview — built on top of [Monaco Editor](https://microsoft.github.io/monaco-editor/) and [monaco-yaml](https://github.com/remcohaszing/monaco-yaml).

## Features

- **Schema-driven validation & autocompletion** — Validates YAML against a JSON Schema in real-time and provides context-aware suggestions via `monaco-yaml`.
- **Disabled block management** — YAML blocks with `enabled: false` are automatically stripped from the editor and displayed in a sidebar panel. Users can re-enable them with a single click.
- **Deleted block tracking** — When a user removes a top-level block from the editor, it is preserved internally with `enabled: false` so the full config can always be reconstructed.
- **Backend problem markers** — Supports injecting external (server-side) validation errors and warnings alongside built-in schema diagnostics.
- **Diff preview on save** — Before confirming changes, a side-by-side diff modal shows the original vs. modified YAML using Monaco's built-in `DiffEditor`.
- **Changed block extraction** — On save, only the top-level blocks that actually changed are reported to the consumer via `onSave` callback.
- **Dark / Light theme** — Fully supports both themes, toggled at runtime.
- **Code folding** — Top-level blocks are auto-folded on mount for a cleaner overview.

## Tech Stack

| Layer | Library |
|-------|---------|
| UI | React 19, TypeScript |
| Editor | `monaco-editor` 0.52, `@monaco-editor/react` 4.7 |
| YAML intelligence | `monaco-yaml` 5.4 |
| YAML parsing | `yaml` (js-yaml successor) |
| Build | Vite 7 |

## Project Structure

```
src/
├── App.tsx                          # Demo app with mock config & backend problems
├── MonacoComponent/
│   ├── index.ts                     # Public API — exports component & types
│   ├── yaml-config-editor.tsx       # Main editor component
│   ├── diff-modal.tsx               # Side-by-side diff confirmation dialog
│   ├── types.ts                     # Shared TypeScript interfaces
│   ├── styles.css                   # Component styles (dark/light themes)
│   ├── hooks/
│   │   └── use-yaml-editor.ts       # Core hook: editing, filtering, problem tracking
│   ├── utils/
│   │   └── yaml-utils.ts            # YAML parsing, diffing, block manipulation
│   ├── ui/
│   │   └── problems-panel.tsx       # Inline problems list (errors, warnings, info)
│   └── editor-setup/
│       ├── monaco-setup.ts          # Monaco environment bootstrap
│       ├── schema.json              # JSON Schema for the demo config
│       ├── editor.worker.js         # Monaco base web worker
│       └── yaml.worker.js           # monaco-yaml language worker
```

## How It Works

### 1. Initialization

`YamlConfigEditor` receives raw YAML, a JSON Schema, and optional backend problems as props. On mount it:

1. Configures `monaco-yaml` with the supplied schema (autocompletion, hover docs, validation).
2. Parses the YAML using the `yaml` library and separates **enabled** blocks (displayed in the editor) from **disabled** blocks (`enabled: false` — moved to the sidebar).
3. Stores the original block map so it can later detect deletions and reconstruct the full config.

### 2. Editing

While the user edits:

- **Content change handler** (debounced at 500 ms) re-parses the editor value on every change. If a block has just been set to `enabled: false`, it is silently removed from the editor and pushed to the disabled sidebar.
- **Deleted blocks** — if a top-level key disappears from the editor and is not already tracked, it is recorded as a deleted block with `enabled: false`.
- **Monaco markers listener** transforms Monaco diagnostic markers into a unified `EditorProblem[]` array and renders error line decorations.

### 3. Sidebar (Disabled Blocks)

The sidebar lists all blocks that are currently disabled or deleted. Clicking a block:

1. Parses its stored YAML, flips `enabled` back to `true`.
2. Appends the block to the editor's document model.
3. Removes it from the sidebar.

### 4. Saving

When the user clicks **Save**:

1. `getFullYaml()` merges the editor content with all disabled/deleted blocks, preserving the original key order.
2. A `DiffModal` opens showing a read-only side-by-side diff (original ↔ current).
3. On confirmation, `getChangedBlocks()` compares old and new JS representations and returns only the top-level keys whose values changed.
4. The `onSave` callback receives the array of changed blocks.

## Getting Started

```bash
npm install
npm run dev
```

## Component API

```tsx
<YamlConfigEditor
  yamlConfig={rawYamlString}
  schema={jsonSchemaObject}
  theme="dark"                        // "dark" | "light"
  backendProblems={[                  // optional server-side markers
    {
      source: "backend",
      severity: "error",
      message: "Cluster not found",
      startLineNumber: 23,
      startColumn: 3,
    },
  ]}
  onSave={(changedBlocks) => { ... }} // only modified top-level blocks
  onCancel={() => { ... }}            // optional cancel handler
/>
```

## License

MIT
