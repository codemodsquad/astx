import * as babelGenerator from '@babel/generator'
import { Node } from '../types'
import { original, source } from '../util/symbols'

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
            const { start, end } = orig
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
    }
    return new Reprinter(node).generate(node)
  }
  return generate(node as any)
}
