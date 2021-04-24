import j, {
  ImportSpecifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ASTNode,
  ASTPath,
} from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'
import getKeyValueIdentifierish from './getKeyValueIdentifierish'

import getIdentifierish from './getIdentifierish'

export function convertCaptureForImportDefaultSpecifier(
  node: ASTNode
): (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[] {
  switch (node.type) {
    case 'ImportSpecifier':
    case 'ImportDefaultSpecifier':
    case 'ImportNamespaceSpecifier':
      return [node]
    case 'ObjectExpression':
    case 'ObjectTypeAnnotation':
    case 'ObjectPattern': {
      const specifiers: (
        | ImportSpecifier
        | ImportDefaultSpecifier
        | ImportNamespaceSpecifier
      )[] = []
      for (const prop of node.properties) {
        const converted = convertCaptureForImportDefaultSpecifier(prop)
        if (converted) converted.forEach((s) => specifiers.push(s))
      }
      return specifiers
    }
  }
  const keyValue = getKeyValueIdentifierish(node)
  if (keyValue) {
    const { key, value } = keyValue
    return key === 'default'
      ? [j.importDefaultSpecifier(j.identifier(value))]
      : [j.importSpecifier(j.identifier(key), j.identifier(value))]
  }
  const name = getIdentifierish(node)
  if (name) return [j.importDefaultSpecifier(j.identifier(name))]
  throw new Error(
    `converting ${node.type} to replace ImportDefaultSpecifier isn't supported`
  )
}

const captureOptions = {
  convertCapture: convertCaptureForImportDefaultSpecifier,
}

export default function compileImportDefaultSpecifierReplacement(
  path: ASTPath<ImportDefaultSpecifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportSpecifier
  | (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[]
  | ASTNode[]
> | void {
  const pattern = path.node
  const { local } = pattern
  if (local != null) {
    if ((pattern as any).importKind == null) {
      const captureReplacement = compileCaptureReplacement(
        pattern,
        local.name,
        compileOptions,
        captureOptions
      )
      if (captureReplacement) return captureReplacement
    }
    local.name = unescapeIdentifier(local.name)
  }
}
