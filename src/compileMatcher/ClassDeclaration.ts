import { ASTNode, ClassDeclaration, ClassExpression } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayMatcher, { ElementMatcherKind } from './AdvancedArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileClassDeclarationMatcher(
  query: ClassDeclaration | ClassExpression,
  compileOptions: CompileOptions
): CompiledMatcher {
  return compileGenericNodeMatcher(query, compileOptions, {
    nodeType: ['ClassDeclaration', 'ClassExpression'],
    keyMatchers: {
      implements: compileArrayMatcher(query.implements, compileOptions, {
        getElementMatcherKind: (node: ASTNode): ElementMatcherKind => {
          if (
            node.type === 'ClassImplements' &&
            node.id.type === 'Identifier' &&
            node.typeParameters == null
          ) {
            const match = /^\$_?[a-z0-9]+/i.exec(node.id.name)
            if (match)
              return {
                kind: match[0].startsWith('$_') ? '*' : '$',
                captureAs: match[0],
              }
          }
          if (
            node.type === 'TSExpressionWithTypeArguments' &&
            node.expression.type === 'Identifier' &&
            node.typeParameters == null
          ) {
            const match = /^\$_?[a-z0-9]+/i.exec(node.expression.name)
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
