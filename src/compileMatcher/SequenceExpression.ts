import { SequenceExpression, ASTNode } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayMatcher, { ElementMatcherKind } from './AdvancedArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileSequenceExpressionMatcher(
  query: SequenceExpression,
  compileOptions: CompileOptions
): CompiledMatcher {
  return compileGenericNodeMatcher(query, compileOptions, {
    keyMatchers: {
      expressions: compileArrayMatcher(query.expressions, compileOptions, {
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
