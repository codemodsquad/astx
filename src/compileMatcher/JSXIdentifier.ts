import { JSXIdentifier, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compilePlaceholderMatcher, { unescapeIdentifier } from './Placeholder'

export default function compileJSXIdentifierMatcher(
  path: NodePath<JSXIdentifier, JSXIdentifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXIdentifier = path.value
  const n = compileOptions.backend.t.namedTypes
  const placeholderMatcher = compilePlaceholderMatcher(
    path,
    pattern.name,
    compileOptions,
    {
      nodeType: 'JSXIdentifier',
      getCondition: () =>
        [
          function isJSXElementName(path: NodePath): boolean {
            return (
              n.JSXOpeningElement.check(path.parent?.value) &&
              path.name === 'name'
            )
          },
          function isJSXAttributeName(path: NodePath): boolean {
            return (
              n.JSXAttribute.check(path.parent?.value) && path.name === 'name'
            )
          },
          function isJSXSpreadAttribute(path: NodePath): boolean {
            return n.JSXSpreadAttribute.check(path.parent?.value)
          },
        ].find((c) => c(path)),
    }
  )

  if (placeholderMatcher) return placeholderMatcher

  pattern.name = unescapeIdentifier(pattern.name)
}
