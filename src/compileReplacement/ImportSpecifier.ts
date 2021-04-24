import j, { ImportSpecifier, ASTNode, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'
import getKeyValueIdentifierish from './getKeyValueIdentifierish'

import getIdentifierish from './getIdentifierish'

export function convertCaptureForImportSpecifiers(node: ASTNode): ASTNode[] {
  switch (node.type) {
    case 'ImportSpecifier':
    case 'ImportDefaultSpecifier':
    case 'ImportNamespaceSpecifier':
      return [node]
    case 'ObjectExpression':
    case 'ObjectTypeAnnotation':
    case 'ObjectPattern': {
      const specifiers: ASTNode[] = []
      for (const prop of node.properties) {
        const converted = convertCaptureForImportSpecifiers(prop)
        converted.forEach((s) => specifiers.push(s))
      }
      return specifiers
    }
  }
  const keyValue = getKeyValueIdentifierish(node)
  if (keyValue) {
    const { key, value } = keyValue
    return key === 'default'
      ? j.importDefaultSpecifier(j.identifier(value))
      : j.importSpecifier(j.identifier(key), j.identifier(value))
  }
  const name = getIdentifierish(node)
  if (name) return [j.importSpecifier(j.identifier(name), j.identifier(name))]
  throw new Error(
    `converting ${node.type} to replace ImportSpecifier isn't supported`
  )
}

const captureOptions = {
  convertCapture: convertCaptureForImportSpecifiers,
}

export default function compileImportSpecifierReplacement(
  path: ASTPath<ImportSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  if (!pattern.local || pattern.local.name === pattern.imported.name) {
    if ((pattern as any).importKind == null) {
      const captureReplacement = compileCaptureReplacement(
        pattern,
        pattern.imported.name,
        compileOptions,
        captureOptions
      )
      if (captureReplacement) return captureReplacement
    }
    pattern.imported.name = unescapeIdentifier(pattern.imported.name)
  }
}
