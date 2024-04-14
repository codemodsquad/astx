'use client'
import { Box, Typography } from '@mui/material'
import * as React from 'react'
import Editor from './Editor'
import DiffEditor from './DiffEditor'
import { Monaco, MonacoDiffEditor } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import runTransform from '@/astx/runTransform'
import { TransformResult } from 'astx'
import './AstxEditor.css'

export default function AstxEditor({
  initTransformCode = '',
  initSource = '',
  sx,
  ...restProps
}: React.ComponentProps<typeof Box> & {
  initTransformCode?: string
  initSource?: string
}) {
  const [transformCode, setTransformCode] = React.useState(initTransformCode)
  const [original, setOriginal] = React.useState(initSource)
  const [transformResult, setTransformResult] = React.useState<
    TransformResult | undefined
  >(undefined)

  React.useEffect(() => {
    runTransform({ source: original, transformSource: transformCode }).then(
      (result: TransformResult) => {
        setTransformResult(result)
      }
    )
  }, [transformCode, original])

  const modifiedContent = React.useMemo(() => {
    const error = transformResult?.error
    const transformed = transformResult?.transformed
    return error instanceof Error
      ? error.stack || String(error)
      : error
      ? String(error)
      : transformed || ''
  }, [transformResult])

  const handleTransformChange = React.useCallback(
    (value: string | undefined) => {
      if (value) setTransformCode(value)
    },
    []
  )

  const [diffEditor, setDiffEditor] = React.useState<
    MonacoDiffEditor | undefined
  >(undefined)

  const handleDiffEditorMount = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (editor: MonacoDiffEditor, monaco: Monaco) => {
      setDiffEditor(editor)
    },
    []
  )

  const decorations = React.useRef<editor.IEditorDecorationsCollection>(null)

  React.useEffect(() => {
    const originalEditor = diffEditor?.getOriginalEditor()
    if (originalEditor) {
      originalEditor.setValue(original)
      const disposables = [
        originalEditor.onDidChangeModelContent(() => {
          setOriginal(originalEditor.getValue())
        }),
      ]
      // @ts-expect-error not readonly...
      decorations.current = originalEditor.createDecorationsCollection()
      return () => {
        for (const disp of disposables) {
          disp?.dispose()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffEditor])

  React.useEffect(() => {
    const originalEditor = diffEditor?.getOriginalEditor()
    const matches = transformResult?.matches
    const newDecorations: editor.IModelDeltaDecoration[] = []
    if (originalEditor && matches?.length) {
      for (const match of matches) {
        const nodes = match?.nodes
        if (!nodes) continue
        const captures = match?.captures
        const start = nodes[0]?.loc?.start
        const end = nodes[nodes.length - 1]?.loc?.end
        if (start == null || end == null) continue
        if (captures) {
          for (const name in captures) {
            const node = captures[name]
            const start = node.loc?.start
            const end = node.loc?.end
            if (start == null || end == null) continue
            newDecorations.push({
              range: {
                startLineNumber: start.line,
                startColumn: start.column + 1,
                endLineNumber: end.line,
                endColumn: end.column + 1,
              },
              options: {
                zIndex: 20,
                className: 'AstxEditor-capture',
                before: {
                  content: name,
                  inlineClassName: 'AstxEditor-captureName',
                  inlineClassNameAffectsLetterSpacing: true,
                },
              },
            })
          }
        }
        newDecorations.push({
          range: {
            startLineNumber: start.line,
            startColumn: start.column + 1,
            endLineNumber: end.line,
            endColumn: end.column + 1,
          },
          options: {
            zIndex: 10,
            className: 'AstxEditor-match',
          },
        })
      }
    }
    decorations.current?.set(newDecorations)
  }, [transformResult, diffEditor])

  return (
    <Box
      {...restProps}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: 600,
        width: 600,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 100,
        }}
      >
        <Typography variant="h6">ASTX Transform</Typography>
        <Box
          sx={{
            flexGrow: 1,
            flexShrink: 1,
          }}
        >
          <Editor
            height="100%"
            value={transformCode}
            onChange={handleTransformChange}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 100,
        }}
      >
        <Typography variant="h6">Code</Typography>
        <Box
          sx={{
            flexGrow: 1,
            flexShrink: 1,
          }}
        >
          <DiffEditor
            height="100%"
            onMount={handleDiffEditorMount}
            modified={modifiedContent}
            options={{
              originalEditable: true,
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
