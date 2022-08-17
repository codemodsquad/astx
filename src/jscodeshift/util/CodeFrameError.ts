import { ASTPath } from 'jscodeshift'
import CompilePathError from './CompilePathError'
import generate from '@babel/generator'

interface SourceLocation {
  start: {
    line: number
    column: number
  }
  end?: {
    line: number
    column: number
  }
}

function formatSource(path: ASTPath | null | undefined): string | undefined {
  while (path?.parentPath) path = path?.parentPath
  const node = path?.node
  if (!node) return undefined
  return generate(node as any, { retainLines: true })?.code
}

export default class CodeFrameError extends Error {
  filename: string | undefined
  source: string | undefined
  path: ASTPath | undefined
  loc: SourceLocation | undefined

  constructor(
    message: string,
    {
      filename,
      source,
      path,
      loc,
    }: {
      filename?: string
      source?: string
      path?: ASTPath
      loc?: SourceLocation
    }
  ) {
    super(message)
    this.filename = filename
    this.path = path
    this.source = source ?? formatSource(path)
    if (loc == null && (path?.node as any)?.loc) {
      const { start, end } = (path?.node as any).loc
      loc = {
        start: { line: start.line, column: start.column + 1 },
        end: { line: end.line, column: end.column + 1 },
      }
    }
    this.loc = loc
  }

  static rethrow(
    error: Error,
    { filename, source }: { filename?: string; source?: string }
  ): void {
    if (error instanceof CompilePathError) {
      throw new CodeFrameError(error.message, {
        filename,
        source,
        path: error.path,
      })
    }
    if (error instanceof SyntaxError) {
      const { lineNumber, columnNumber, loc } = error as any
      throw new CodeFrameError(error.message, {
        filename,
        source,
        loc:
          typeof loc?.line === 'number' && typeof loc?.column === 'number'
            ? { start: loc }
            : typeof lineNumber === 'number' && typeof columnNumber === 'number'
            ? { start: { line: lineNumber, column: columnNumber } }
            : undefined,
      })
    }
    throw error
  }
}
