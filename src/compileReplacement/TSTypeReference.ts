import { TSTypeReference, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

export default function compileTSTypeReferenceReplacement(
  query: TSTypeReference,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<TSTypeReference | ASTNode[]> | void {
  if (query.typeName.type === 'Identifier') {
    if (query.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.typeName.name,
        compileOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.typeName.name = unescapeIdentifier(query.typeName.name)
  }
}
