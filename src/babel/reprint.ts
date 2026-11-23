import { CodeGenerator, default as generate } from '@babel/generator'
// @ts-expect-error no type defs
import { default as _Printer } from '@babel/generator/lib/printer.js'
const Printer: any = 'default' in _Printer ? _Printer.default : _Printer
import { Comment, Node } from '../types'
import { original, rangeWithWhitespace, source } from '../util/symbols'

const excludedNodeTypes = new Set([
  // @babel/generator prints ` ${ and } around TemplateElement
  // even though their range doesn't include those characters
  'TemplateElement',
])

export default function reprint(node: Node): { code: string } {
  // const gen: any = new CodeGenerator(node as any)
  const lastPrintedRange = { start: 0, end: 0 }
  if (Printer) {
    class ReprinterGenerator extends CodeGenerator {
      constructor(ast: Node, opts: any = {}, code?: string) {
        super(ast as any, opts, code)
      }
      generate() {
        const printer = new Reprinter((this as any)._format, (this as any)._map)
        return printer.generate((this as any)._ast)
      }
    }
    class Reprinter extends Printer {
      // needs type def
      // eslint-disable-next-line @typescript-eslint/no-useless-constructor
      constructor(format: any, map: any) {
        super(format, map)
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
      _printComment(comment: Comment, skipNewLines?: number) {
        // const noLineTerminator = this._noLineTerminator;
        // const isBlockComment = comment.type === "CommentBlock";
        // const printNewLines = isBlockComment && skipNewLines !== 1 && !noLineTerminator;
        const orig = (comment as any)[original]
        const src: string = (comment as any)[source]
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
          if (comment.type === 'CommentLine' && !/\n\s*$/.test(commentStr)) {
            commentStr += '\n'
          }

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
    return new ReprinterGenerator(node).generate()
  }
  return generate(node as any)
}
