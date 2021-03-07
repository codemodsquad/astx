import { ASTNode, ClassBody } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayMatcher, { ElementMatcherKind } from './AdvancedArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileClassBodyMatcher(
  query: ClassBody,
  compileOptions: CompileOptions
): CompiledMatcher {
  return compileGenericNodeMatcher(query, compileOptions, {
    keyMatchers: {
      body: compileArrayMatcher(query.body, compileOptions, {
        getElementMatcherKind: (node: ASTNode): ElementMatcherKind => {
          if (
            node.type === 'ClassProperty' &&
            !node.computed &&
            !node.static &&
            node.variance == null &&
            node.value == null &&
            node.key.type === 'Identifier'
          ) {
            const match = /^\$_?[a-z0-9]+/i.exec(node.key.name)
            if (match)
              return {
                kind: match[0].startsWith('$_') ? '*' : '$',
                captureAs: match[0],
              }
          }
          return { kind: 'element', query: node }
        },
      }),
    },
  })
}
