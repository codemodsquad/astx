import { ArrayExpression, ASTNode } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayMatcher, { ElementMatcherKind } from './AdvancedArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileArrayExpressionMatcher(
  query: ArrayExpression,
  compileOptions: CompileOptions
): CompiledMatcher {
  const elements = []
  for (let i = 0; i < query.elements.length; i++) {
    const element = query.elements[i]
    if (element == null) {
      throw new Error(
        `query.elements[i] is null, not sure how this can happen but it's not supported`
      )
    }
    elements.push(element)
  }

  return compileGenericNodeMatcher(query, compileOptions, {
    keyMatchers: {
      elements: compileArrayMatcher(elements, compileOptions, {
        getElementMatcherKind: (node: ASTNode): ElementMatcherKind => {
          if (node.type === 'Identifier') {
            const match = /^\$_[a-z0-9]+/i.exec(node.name)
            if (match) return { kind: '*', captureAs: match[0] }
          }
          return { kind: 'element', query: node }
        },
      }),
    },
  })
}
