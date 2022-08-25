import { Backend } from './Backend'
import {
  Expression,
  Statement,
  NodePath,
  JSXExpressionContainer,
} from './types'

type ParseFindOrReplaceBackend = Pick<
  Backend,
  'parse' | 'template' | 'forEachNode' | 'rootPath'
>

function parseFindOrReplace0(
  { template: { expression, statements } }: ParseFindOrReplaceBackend,
  strings: TemplateStringsArray,
  ...quasis: any[]
): Expression | Statement | Statement[] {
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

export default function parseFindOrReplace(
  backend: ParseFindOrReplaceBackend,
  strings: TemplateStringsArray,
  ...quasis: any[]
): NodePath | NodePath[] {
  const ast = parseFindOrReplace0(backend, strings, ...quasis)
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
