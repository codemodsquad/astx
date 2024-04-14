'use client'
import { Box, Typography } from '@mui/material'
import * as React from 'react'
import Editor from './Editor'
import DiffEditor from './DiffEditor'
import { Monaco, MonacoDiffEditor } from '@monaco-editor/react'
import runTransform from '@/astx/runTransform'
import { TransformResult } from 'astx'

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
  const [modified, setModified] = React.useState('')

  React.useEffect(() => {
    runTransform({ source: original, transformSource: transformCode }).then(
      ({ transformed, error }: TransformResult) => {
        setModified(
          error instanceof Error
            ? error.stack || String(error)
            : error
            ? String(error)
            : transformed || ''
        )
      },
      (error) => {
        setModified(
          error instanceof Error ? error.stack || String(error) : String(error)
        )
      }
    )
  }, [transformCode, original])

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

  React.useEffect(() => {
    const originalEditor = diffEditor?.getOriginalEditor()
    if (originalEditor) {
      originalEditor.getModel()?.setValue(original)
      const disposables = [
        originalEditor.onDidChangeModelContent(() => {
          setOriginal(originalEditor.getValue())
        }),
      ]
      return () => {
        for (const disp of disposables) {
          disp?.dispose()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffEditor])

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
            modified={modified}
            options={{
              originalEditable: true,
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
