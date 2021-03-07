import { ASTNode, Function as FunctionNode } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileArrayMatcher, { ElementMatcherKind } from './AdvancedArrayMatcher'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileFunctionMatcher(
  query: FunctionNode,
  compileOptions: CompileOptions
): CompiledMatcher {
  return {
    ...compileGenericNodeMatcher(query as any, compileOptions, {
      keyMatchers: {
        params: compileArrayMatcher(query.params, compileOptions, {
          getElementMatcherKind: (node: ASTNode): ElementMatcherKind => {
            if (node.type === 'Identifier') {
              const match = /^\$_[a-z0-9]+/i.exec(node.name)
              if (match) return { kind: '*', captureAs: match[0] }
            }
            return { kind: 'element', query: node }
          },
        }),
      },
    }),
    nodeType: 'Function',
  }
}
