import j, { ClassImplements, ASTPath, ASTNode } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'
import getIdentifierish from './getIdentifierish'

export function convertCaptureToClassImplements(capture: ASTNode): ASTNode {
  switch (capture.type) {
    case 'ClassImplements':
      return capture
    case 'InterfaceExtends':
    case 'GenericTypeAnnotation':
      return {
        ...j.classImplements(capture.id),
        typeParameters: capture.typeParameters,
      }
    case 'TSTypeReference':
      return {
        ...j.classImplements(capture.typeName),
        typeParameters: capture.typeParameters,
      }
  }
  const name = getIdentifierish(capture)
  if (name) return j.classImplements(j.identifier(name))
  throw new Error(
    `converting ${capture.type} to ClassImplements isn't supported`
  )
}

const captureOptions = {
  convertCapture: convertCaptureToClassImplements,
}

export default function compileClassImplementsReplacement(
  path: ASTPath<ClassImplements>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureReplacement = compileCaptureReplacement(
        pattern,
        pattern.id.name,
        compileOptions,
        captureOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.id.name = unescapeIdentifier(pattern.id.name)
  }
}
