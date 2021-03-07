import { Function as FunctionNode } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileFunctionMatcher(
  query: FunctionNode,
  compileOptions: CompileOptions
): CompiledMatcher {
  return {
    ...compileGenericNodeMatcher(query as any, compileOptions),
    nodeType: 'Function',
  }
}
