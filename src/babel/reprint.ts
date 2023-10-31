import type * as babelGenerator from '@babel/generator'
import { Comment, Node } from '../types'
import { original, rangeWithWhitespace, source } from '../util/symbols'

const excludedNodeTypes = new Set([
  'File',
  // @babel/generator prints ` ${ and } around TemplateElement
  // even though their range doesn't include those characters
  'TemplateElement',
])

export default function reprint(
  generator: typeof babelGenerator,
  node: Node
): { code: string } {
  const { CodeGenerator, default: generate } = generator
  const gen: any = new CodeGenerator(node as any)
  const lastPrintedRange = { start: 0, end: 0 }
  if (gen._generator instanceof Object) {
    const Generator = gen._generator.constructor
    class Reprinter extends Generator {
      constructor(
        ast: Node,
        opts: any = {},
        code?: string | { [filename: string]: string }
      ) {
        super(ast, opts, code)
      }
      print(
        node: Node | null,
        parent?: Node,
        noLineTerminatorAfter?: boolean,
        trailingCommentsLineOffset?: number,
        forceParens?: boolean
      ) {
        // Nodes with typeAnnotations are screwy in Babel...
        if (
          node &&
          !excludedNodeTypes.has(node.type) &&
          !(node as any).typeAnnotation
        ) {
          const orig = (node as any)[original]
          const src = (node as any)[source]

          if (orig && src) {
            const { start: _start, end } =
              (node as any)[rangeWithWhitespace] || orig
            let start = _start
            if (
              start < lastPrintedRange.end &&
              orig.start >= lastPrintedRange.end
            ) {
              start = lastPrintedRange.end
            }
            lastPrintedRange.start = start
            lastPrintedRange.end = end

            if (Number.isInteger(start) && Number.isInteger(end)) {
              const origPrintMethod = this[node.type]
              try {
                // massive hack to override the node printing with
                // the original source formatting,
                // while letting @babel/generator decide if it needs
                // to wrap in parens etc
                this[node.type] = () =>
                  this._append(src.substring(start, end), false)
                super.print(
                  node,
                  parent,
                  noLineTerminatorAfter,
                  trailingCommentsLineOffset,
                  forceParens
                )

                return
              } finally {
                this[node.type] = origPrintMethod
              }
            }
          }
        }
        super.print(
          node,
          parent,
          noLineTerminatorAfter,
          trailingCommentsLineOffset,
          forceParens
        )
      }
      _printComment(comment: Comment, skipNewLines?: boolean) {
        if ((comment as any).ignore) return
        if (this._printedComments.has(comment)) return
        if (!this.format.shouldPrintComment(comment.value)) return

        const orig = (comment as any)[original]
        const src = (comment as any)[source]
        if (orig && src) {
          const loc = (comment as any)[rangeWithWhitespace] || orig
          let { start } = loc
          const { end } = loc
          if (
            start < lastPrintedRange.end &&
            orig.start >= lastPrintedRange.end
          ) {
            start = lastPrintedRange.end
          }
          lastPrintedRange.start = start
          lastPrintedRange.end = end

          this._append(
            src.substring(start, end),
            src.charCodeAt(end - 1) === 10
          )
          this._printedComments.add(comment)
          return
        }
        return super._printComment(comment, skipNewLines)
      }
    }
    return new Reprinter(node).generate(node)
  }
  return generate(node as any)
}
