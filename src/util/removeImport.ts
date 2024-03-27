import { ImportDeclaration } from '@babel/types'
import Astx from '../Astx'
import { Node, NodePath } from '../types'
import findImports from './findImports'

export default function removeImport(
  astx: Astx,
  pattern: readonly NodePath<Node, any>[]
): boolean {
  if (pattern.length !== 1) {
    throw new Error('pattern must contain a single import declaration')
  }
  const decl: ImportDeclaration = pattern[0].node as any
  if (decl.specifiers && decl.specifiers.length > 1) {
    throw new Error('pattern must not contain more than one import specifier')
  }
  const specifier = decl.specifiers?.[0]
  const found = findImports(astx, pattern).matched
  if (!found) return false
  if (specifier) {
    const foundSpec = found.find(specifier).matched
    if (!foundSpec) return false
    foundSpec.remove()
    return true
  } else {
    found.remove()
    return true
  }
}
