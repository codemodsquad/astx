import { CodeGenerator, default as generate } from '@babel/generator'
import { Comment, Node } from '../types'
import { original, rangeWithWhitespace, source } from '../util/symbols'

const excludedNodeTypes = new Set([
  // @babel/generator prints ` ${ and } around TemplateElement
  // even though their range doesn't include those characters
  'TemplateElement',
])

export default function reprint(node: Node): { code: string } {
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
            const wsRange = (node as any)[rangeWithWhitespace]
            const loc = wsRange || orig
            let { start } = loc
            const { end } = loc
            if (start < orig.start) {
              const leading = src.substring(start, orig.start)
              if (/^\s+$/.test(leading) && !/\n/.test(leading))
                start = orig.start
            }
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
                const substr = src.substring(start, end)
                this[node.type] = () =>
                  this._append(substr, /\n\s*$/.test(substr))
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

          let commentStr = src.substring(start, end)
          if (comment.type === 'CommentLine' && !/\n\s*$/.test(commentStr))
            commentStr += '\n'

          this._append(
            commentStr,
            comment.type === 'CommentLine' || src.charCodeAt(end - 1) === 10
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
