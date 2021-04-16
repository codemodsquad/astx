import { FunctionTypeParam, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileFunctionTypeParamReplacement(
  query: FunctionTypeParam,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<FunctionTypeParam | ASTNode[]> | void {
  if (query.name?.type === 'Identifier') {
    if (query.typeAnnotation == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.name.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.name.name = unescapeIdentifier(query.name.name)
  }
  if (
    query.typeAnnotation?.type === 'GenericTypeAnnotation' &&
    query.typeAnnotation.id.type === 'Identifier'
  ) {
    if (query.typeAnnotation.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.typeAnnotation.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.typeAnnotation.id.name = unescapeIdentifier(
      query.typeAnnotation.id.name
    )
  }
}
