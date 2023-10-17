import CompilePathError from './CompilePathError'
import generate from '@babel/generator'
import { NodePath } from '../types'
import { codeFrameColumns } from '@babel/code-frame'
import chalk from 'chalk'
import dedent from 'dedent-js'

interface BabelCodeFrameOptions {
  /** Syntax highlight the code as JavaScript for terminals. default: false */
  highlightCode?: boolean | undefined
  /**  The number of lines to show above the error. default: 2 */
  linesAbove?: number | undefined
  /**  The number of lines to show below the error. default: 3 */
  linesBelow?: number | undefined
  /**
   * Forcibly syntax highlight the code as JavaScript (for non-terminals);
   * overrides highlightCode.
   * default: false
   */
  forceColor?: boolean | undefined
}

export interface SourceLocation {
  start: {
    line: number
    column: number
  }
  end?: {
    line: number
    column: number
  }
}

function formatSource(path: NodePath | null | undefined): string | undefined {
  while (path?.parentPath) path = path?.parentPath
  const node = path?.node
  if (!node) return undefined
  return generate(node as any, { retainLines: true })?.code
}

export default class CodeFrameError extends Error {
  filename: string | undefined
  source: string | undefined
  path: NodePath | undefined
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
      path?: NodePath
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
        start: { line: start.line, column: start.column },
        end: { line: end.line, column: end.column },
      }
    }
    this.loc = loc
  }

  static rethrow(
    error: Error,
    { filename, source }: { filename?: string; source?: string }
  ): void {
    if (error instanceof CodeFrameError) {
      if (filename) error.filename = filename
      if (source) error.source = source
      throw error
    }
    if (error instanceof CompilePathError) {
      throw new CodeFrameError(error.message, {
        filename,
        source,
        path: error.path,
      })
    }
    if (error instanceof SyntaxError) {
      const { lineNumber, columnNumber, loc } = error as any
      throw new CodeFrameError(error.message.replace(/\s*\(\d+:\d+\)$/, ''), {
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

  format(options: BabelCodeFrameOptions & { stack?: boolean }): string {
    const red =
      options.highlightCode || options.forceColor ? chalk.red : (s: string) => s
    const { loc, source, stack, message, filename } = this
    if (!loc || !source) return red(options.stack && stack ? stack : message)
    const start = {
      line: loc.start.line,
      column: loc.start.column + 1,
    }
    const end = loc.end
      ? {
          line: loc.end.line,
          column: loc.end.column + 1,
        }
      : undefined
    return dedent`
      ${red(`Error in ${filename} (${start.line}:${start.column})`)}
      ${codeFrameColumns(source, { start, end }, { message, ...options })}${
        options.stack && stack
          ? '\n' + red(stack?.replace(/^.*?(\r\n?|\n)/, ''))
          : ''
      }
    `
  }
}
