import { JSXExpressionContainer, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileJSXExpressionContainerMatcher(
  path: NodePath<JSXExpressionContainer, JSXExpressionContainer>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXExpressionContainer = path.value
  const n = compileOptions.backend.t.namedTypes

  if (n.Identifier.check(pattern.expression)) {
    const captureMatcher = compileCaptureMatcher(
      path,
      pattern.expression.name,
      compileOptions,
      {
        nodeType: ['JSX', 'StringLiteral'],
        getCondition: () =>
          [
            function isJSXAttributeValue(path: NodePath): boolean {
              return (
                n.JSXAttribute.check(path.parent?.value) &&
                path.name === 'value'
              )
            },
            function isJSXChild(path: NodePath): boolean {
              return (
                (n.JSXElement.check(path.parent?.value) ||
                  n.JSXFragment.check(path.parent?.value)) &&
                path.parentPath?.name === 'children'
              )
            },
          ].find((c) => c(path)),
      }
    )

    if (captureMatcher) return captureMatcher
  }
}
