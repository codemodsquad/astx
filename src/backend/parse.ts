import { Backend } from './Backend'
import { Expression, Statement, Node, NodePath } from '../types'
import ensureArray from '../util/ensureArray'

function parse0(
  backend: Backend,
  strings: TemplateStringsArray | string | string[],
  ...quasis: any[]
): Expression | Statement | Statement[] {
  try {
    const result = backend.template.statements(strings, ...quasis)
    if (result.length === 0)
      return backend.template.expression(strings, ...quasis)
    if (result.length > 1) return result
    const node = result[0]
    return node.type === 'ExpressionStatement' ? node.expression : node
  } catch (error) {
    // fallthrough
  }
  return backend.template.expression(strings, ...quasis)
}

export function parsePattern(
  this: Backend,
  strings: TemplateStringsArray | string | string[],
  ...quasis: any[]
): NodePath | NodePath[] {
  const ast = parse0(this, strings, ...quasis)
  let result: NodePath | NodePath[] = ensureArray(ast).map((n) =>
    this.makePath(n)
  )
  let extractNext = false
  let done = false
  this.forEachNode(result, ['Node'], (path: NodePath) => {
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

export function parsePatternToNodes(
  this: Backend,
  strings: TemplateStringsArray | string | string[],
  ...quasis: any[]
): Node | Node[] {
  const paths = this.parsePattern(strings, ...quasis)
  return Array.isArray(paths) ? paths.map((p) => p.node) : paths.node
}
