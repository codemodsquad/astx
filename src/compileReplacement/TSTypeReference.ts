import { TSTypeReference, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSTypeReferenceReplacement(
  path: ASTPath<TSTypeReference>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.typeName.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        path,
        pattern.typeName.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.typeName.name = unescapeIdentifier(pattern.typeName.name)
  }
}
