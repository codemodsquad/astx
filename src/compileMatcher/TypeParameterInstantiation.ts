import { TypeParameterInstantiation, ASTNode } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayMatcher, { ElementMatcherKind } from './AdvancedArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileTypeParameterInstantiationMatcher(
  query: TypeParameterInstantiation,
  compileOptions: CompileOptions
): CompiledMatcher {
  return compileGenericNodeMatcher(query, compileOptions, {
    keyMatchers: {
      params: compileArrayMatcher(query.params, compileOptions, {
        getElementMatcherKind: (node: ASTNode): ElementMatcherKind => {
          if (
            node.type === 'GenericTypeAnnotation' &&
            node.id.type === 'Identifier' &&
            node.typeParameters == null
          ) {
            const match = /^\$_[a-z0-9]+/i.exec(node.id.name)
            if (match) return { kind: '*', captureAs: match[0] }
          }
          return { kind: 'element', query: node }
        },
      }),
    },
  })
}
