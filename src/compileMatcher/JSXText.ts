import { ASTPath, JSXText } from 'jscodeshift'
import { CompileOptions, convertPredicateMatcher, CompiledMatcher } from './'
import normalizeJSXTextValue from '../util/normalizeJSXTextValue'

export default function matchJSXText(
  pattern: JSXText,
  compileOptions: CompileOptions
): CompiledMatcher {
  const normalizedValue = normalizeJSXTextValue(pattern.value)
  return convertPredicateMatcher(
    pattern,
    {
      predicate: true,

      match: (path: ASTPath): boolean => {
        const { node } = path
        return (
          node.type === 'JSXText' &&
          normalizedValue === normalizeJSXTextValue(node.value)
        )
      },

      nodeType: 'JSXText',
    },
    compileOptions
  )
}
