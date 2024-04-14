'use client'
import React from 'react'
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'

export default function Editor(
  props: React.ComponentProps<typeof MonacoEditor>
) {
  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
    })
    props.onMount?.(editor, monaco)
  }

  return (
    <MonacoEditor
      language="typescript"
      onMount={handleEditorDidMount}
      {...props}
    />
  )
}
