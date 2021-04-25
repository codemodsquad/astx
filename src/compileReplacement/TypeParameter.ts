import j, { TypeParameter, ASTPath, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'
import getIdentifierish from './getIdentifierish'

export function convertCaptureToTypeParameter(capture: ASTNode): ASTNode {
  switch (capture.type) {
    case 'TypeParameter':
      return capture
  }
  const name = getIdentifierish(capture)
  if (name) return j.typeParameter(name)
  throw new Error(`converting ${capture.type} to TypeParameter isn't supported`)
}

const captureOptions = {
  convertCapture: convertCaptureToTypeParameter,
}

export default function compileTypeParameterReplacement(
  path: ASTPath<TypeParameter>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.variance == null && pattern.bound == null) {
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
