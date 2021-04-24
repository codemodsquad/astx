import j, { TSTypeParameter, ASTPath, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'
import getIdentifierish from './getIdentifierish'

export function convertCaptureToTSTypeParameter(capture: ASTNode): ASTNode {
  switch (capture.type) {
    case 'TSTypeParameter':
      return capture
  }
  const name = getIdentifierish(capture)
  if (name) return j.tsTypeParameter(name)
  throw new Error(
    `converting ${capture.type} to TSTypeParameter isn't supported`
  )
}

const captureOptions = {
  convertCapture: convertCaptureToTSTypeParameter,
}
export default function compileTSTypeParameterReplacement(
  path: ASTPath<TSTypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (
    pattern.constraint == null &&
    pattern.typeAnnotation == null &&
    pattern.default == null &&
    !pattern.optional
  ) {
    const captureReplacement = compileCaptureReplacement(
      pattern,
      pattern.name,
      compileOptions,
      captureOptions
    )
    if (captureReplacement) return captureReplacement
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
