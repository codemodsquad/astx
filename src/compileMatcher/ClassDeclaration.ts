import { ClassDeclaration, ClassExpression } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'

export default function compileClassDeclarationMatcher(
  query: ClassDeclaration | ClassExpression,
  compileOptions: CompileOptions
): CompiledMatcher {
  return compileGenericNodeMatcher(query, compileOptions, {
    nodeType: ['ClassDeclaration', 'ClassExpression'],
  })
}
