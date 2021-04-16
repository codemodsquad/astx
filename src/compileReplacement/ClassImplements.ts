import { ClassImplements, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileClassImplementsReplacement(
  query: ClassImplements,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<ClassImplements | ASTNode[]> | void {
  if (query.id.type === 'Identifier') {
    if (query.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.id.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.id.name = unescapeIdentifier(query.id.name)
  }
}
