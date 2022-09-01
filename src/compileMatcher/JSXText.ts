import { NodePath, JSXText } from '../types'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from '.'
import normalizeJSXTextValue from '../util/normalizeJSXTextValue'

export default function matchJSXText(
  path: NodePath<JSXText, JSXText>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: JSXText = path.value
  const normalizedValue = normalizeJSXTextValue(pattern.value)
  const n = compileOptions.backend.t.namedTypes

  return convertPredicateMatcher(
    path,
    {
      match: (path: NodePath): boolean => {
        const { value: node } = path

        return (
          n.JSXText.check(node) &&
          normalizedValue === normalizeJSXTextValue(node.value)
        )
      },
      nodeType: 'JSXText',
    },
    compileOptions
  )
}
