import {
  ImportSpecifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  Identifier,
  Literal,
  StringLiteral,
  ASTNode,
} from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from '.'
import compileCaptureReplacement, { unescapeIdentifier } from './Capture'

function getName(node: Identifier | Literal | StringLiteral): string {
  switch (node.type) {
    case 'Identifier':
      return node.name
    case 'Literal':
      return String(node.value)
    case 'StringLiteral':
      return node.value
  }
}

export function convertCaptureToImportSpecifiers(
  node: ASTNode
): (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[] {
  switch (node.type) {
    case 'ImportSpecifier':
    case 'ImportDefaultSpecifier':
    case 'ImportNamespaceSpecifier':
      return [node]
    case 'ObjectPattern': {
      const specifiers: (
        | ImportSpecifier
        | ImportDefaultSpecifier
        | ImportNamespaceSpecifier
      )[] = []
      for (const prop of node.properties) {
        const converted = convertCaptureToImportSpecifiers(prop)
        converted.forEach((s) => specifiers.push(s))
      }
      return specifiers
    }
    case 'Property':
    case 'ObjectProperty':
      if (node.computed) {
        throw new Error(
          `converted computed ${node.type} to ImportSpecifier(s) isn't supported`
        )
      }
  }
  throw new Error(
    `converting ${node.type} to ImportSpecifier(s) isn't supported`
  )
}

const captureOptions = {
  convertCapture: convertCaptureToImportSpecifiers,
}

export default function compileImportSpecifierReplacement(
  query: ImportSpecifier,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<
  | ImportSpecifier
  | (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[]
  | ASTNode[]
> | void {
  if (!query.local || query.local.name === query.imported.name) {
    if ((query as any).importKind == null) {
      const captureReplacement = compileCaptureReplacement(
        query,
        query.imported.name,
        compileOptions,
        captureOptions
      )
      if (captureReplacement) return captureReplacement
    }
    query.imported.name = unescapeIdentifier(query.imported.name)
  }
}
