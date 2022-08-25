import { NodePath, JSXText } from '../types'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from '.'
import normalizeJSXTextValue from '../util/normalizeJSXTextValue'

export default function matchJSXText(
  path: NodePath<JSXText>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: JSXText = path.node
  const normalizedValue = normalizeJSXTextValue(pattern.value)

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { node } = path

        return (
          node?.type === 'JSXText' &&
          normalizedValue === normalizeJSXTextValue(node.value)
        )
      },
      nodeType: 'JSXText',
    },
    compileOptions
  )
}
