import { ImportDeclaration } from '@babel/types'
import Astx from '../Astx'
import { Node, NodePath } from '../types'
import * as t from '@babel/types'
import { stripImportKind } from './imports'

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

        removeFoundImport(astx, decl, found)
      }
    } else {
      const found = astx.findImports(
        t.importDeclaration([], decl.source)
      ).matched
      if (!found) continue
      result = true
      removeFoundImport(astx, decl, found)
    }
  }
  if (result) astx.context.simpleReplacements?.bail()
  return result
}

export function removeFoundImport(
  astx: Astx,
  decl: ImportDeclaration,
  found: Astx
) {
  if (decl.specifiers?.length) {
    if (decl.specifiers.length > 1) {
      throw new Error(`decl must have a single specifier`)
    }
    const [specifier] = decl.specifiers
    found.find(specifier).remove()
    if (
      specifier.type === 'ImportSpecifier' &&
      specifier.importKind === 'type'
    ) {
      found
        .find(
          (a) =>
            a.node.type === 'ImportDeclaration' && a.node.importKind === 'type'
        )
        .find(stripImportKind(specifier))
        .remove()
    }
    for (const path of found) {
      if (
        path.node.type === 'ImportDeclaration' &&
        !path.node.specifiers?.length
      ) {
        path.remove()
      }
    }
  } else {
    found.remove()
  }
}
