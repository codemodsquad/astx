import { FunctionTypeParam, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileFunctionTypeParamReplacement(
  path: ASTPath<FunctionTypeParam>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.name?.type === 'Identifier') {
    if (pattern.typeAnnotation == null) {
      const captureReplacement = compileCaptureReplacement(
        pattern,
        pattern.name.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.name.name = unescapeIdentifier(pattern.name.name)
  }
  if (
    pattern.typeAnnotation?.type === 'GenericTypeAnnotation' &&
    pattern.typeAnnotation.id.type === 'Identifier'
  ) {
    if (pattern.typeAnnotation.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        pattern,
        pattern.typeAnnotation.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.typeAnnotation.id.name = unescapeIdentifier(
      pattern.typeAnnotation.id.name
    )
  }
}
