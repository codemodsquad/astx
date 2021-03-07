import { TypeParameterDeclaration, ASTNode } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayMatcher, { ElementMatcherKind } from './AdvancedArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileTypeParameterDeclarationMatcher(
  query: TypeParameterDeclaration,
  compileOptions: CompileOptions
): CompiledMatcher {
  return compileGenericNodeMatcher(query, compileOptions, {
    keyMatchers: {
      params: compileArrayMatcher(query.params, compileOptions, {
        getElementMatcherKind: (node: ASTNode): ElementMatcherKind => {
          if (node.type === 'TypeParameter' && node.bound == null) {
            const match = /^\$_?[a-z0-9]+/i.exec(node.name)
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
