import { ImportDeclaration } from '@babel/types'
import Astx from '../Astx'
import { Node, NodePath } from '../types'
import * as t from '@babel/types'

export default function removeImports(
  astx: Astx,
  pattern: readonly NodePath<Node, any>[]
): boolean {
  for (const { node } of pattern) {
    if (node.type !== 'ImportDeclaration') {
      throw new Error(
        `statement is not an import declaration: ${
          astx.backend.generate(node).code
        }`
      )
    }
  }
  let result = false
  for (const { node } of pattern) {
    const decl: ImportDeclaration = node as any
    if (decl.specifiers?.length) {
      for (const specifier of decl.specifiers) {
        const found = astx.findImports({
          ...decl,
          specifiers: [specifier],
        }).matched
        if (!found) continue
        result = true
        found.find(specifier).remove()
        for (const path of found) {
          if (!(path.node as ImportDeclaration)?.specifiers.length) {
            path.remove()
          }
        }
      }
    } else {
      const found = astx.findImports(
        t.importDeclaration([], decl.source)
      ).matched
      if (!found) continue
      result = true
      found.remove()
    }
  }
  return result
}
