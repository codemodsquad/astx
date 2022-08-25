import { Backend } from './Backend'
import { Expression, Statement, Node, NodePath } from './types'

type ParseBackend = Pick<
  Backend,
  'parse' | 'template' | 'forEachNode' | 'rootPath'
>

export default function createParse(
  backend: ParseBackend
): {
  parsePaths: (
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ) => NodePath | NodePath[]
  parseNodes: (
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ) => Node | Node[]
} {
  const {
    template: { expression, statements },
  } = backend

  function parse0(
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ): Expression | Statement | Statement[] {
    if (typeof strings === 'string') strings = [strings]
    if (strings.length > 1 || quasis.length)
      throw new Error('...quasis not supported yet')
    // try {
    //   const result = statements(strings[0]) //, ...quasis)
    //   if (result.length === 1) {
    //     return result[0].type === 'ExpressionStatement'
    //       ? result[0].expression
    //       : result[0]
    //   }
    //   if (!result.length) return result
    // } catch (error) {
    //   // fallthrough
    // }
    // return expression(strings[0]) //, ...quasis)

    try {
      return expression(strings[0]) //, ...quasis)
    } catch (error) {
      // fallthrough
    }
    const result = statements(strings[0]) //, ...quasis)
    if (result.length === 1) {
      return result[0].type === 'ExpressionStatement'
        ? result[0].expression
        : result[0]
    }
    return result
  }

  function parsePaths(
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ): NodePath | NodePath[] {
    const ast = parse0(strings, ...quasis)
    let result: NodePath | NodePath[] = Array.isArray(ast)
      ? ast.map((n) => backend.rootPath(n))
      : [backend.rootPath(ast)]
    let extractNext = false
    let done = false
    backend.forEachNode(result, ['Node'], (path: NodePath) => {
      if (done) return
      if (extractNext) {
        result = path
        done = true
        return
      }
      const { node } = path
      const { comments, leadingComments, innerComments } = node as any
      if (comments) {
        for (let i = 0; i < comments.length; i++) {
          const c = comments[i]
          if (!c.value && c.leading) {
            comments.splice(i, 1)
            result = path
            done = true
            return
          } else if (!c.value && c.inner) {
            extractNext = true
            return
          }
        }
      }
      if (leadingComments) {
        for (let i = 0; i < leadingComments.length; i++) {
          const c = leadingComments[i]
          if (!c.value) {
            leadingComments.splice(i, 1)
            result = path
            done = true
            return
          }
        }
      }
      if (innerComments) {
        for (let i = 0; i < innerComments.length; i++) {
          const c = innerComments[i]
          if (!c.value) {
            innerComments.splice(i, 1)
            extractNext = true
            return
          }
        }
      }
    })
    return result
  }

  function parseNodes(
    strings: TemplateStringsArray | string | string[],
    ...quasis: any[]
  ): Node | Node[] {
    const paths = parsePaths(strings, ...quasis)
    return Array.isArray(paths) ? paths.map((p) => p.node) : paths.node
  }
  return { parsePaths, parseNodes }
}
