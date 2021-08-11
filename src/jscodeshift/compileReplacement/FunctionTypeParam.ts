import { FunctionTypeParam, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement from './Capture'

export default function compileFunctionTypeParamReplacement(
  path: ASTPath<FunctionTypeParam>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node

  if (
    pattern.typeAnnotation?.type === 'GenericTypeAnnotation' &&
    pattern.typeAnnotation.id.type === 'Identifier'
  ) {
    if (pattern.typeAnnotation.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.typeAnnotation.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
  }
}
