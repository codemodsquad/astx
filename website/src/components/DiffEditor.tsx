'use client'
import React from 'react'
import { DiffEditor, Monaco, MonacoDiffEditor } from '@monaco-editor/react'

export default function Editor(props: React.ComponentProps<typeof DiffEditor>) {
  function handleEditorDidMount(editor: MonacoDiffEditor, monaco: Monaco) {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
    })
    props.onMount?.(editor, monaco)
  }

  return (
    <DiffEditor
      language="typescript"
      onMount={handleEditorDidMount}
      {...props}
    />
  )
}
