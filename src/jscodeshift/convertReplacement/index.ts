import { ASTNode, ASTPath } from '../variant'
import convertJSXChildReplacement from './convertJSXChildReplacement'
import convertJSXAttributeValueReplacement from './convertJSXAttributeValueReplacement'
import TypeParameter from './convertTypeParameterReplacement'
import TSTypeParameter from './convertTSTypeParameterReplacement'
import convertFlowTypeReplacement from './convertFlowTypeReplacement'
import convertTSTypeReplacement from './convertTSTypeReplacement'
import convertPropertyReplacement from './convertPropertyReplacement'
import convertExpressionReplacement from './convertExpressionReplacement'
import convertStatementReplacement from './convertStatementReplacement'
import convertImportSpecifierReplacement from './convertImportSpecifierReplacement'
import { isStatement, isExpression, isTSType, isFlow } from '../variant'

export type ReplacementConverter = (replacement: ASTNode) => ASTNode | ASTNode[]

function identity<T>(x: T): T {
  return x
}

const nodeConverters: Record<
  string,
  (path: ASTPath) => ReplacementConverter
> = {
  TypeParameter,
  TSTypeParameter,
  ImportSpecifier: convertImportSpecifierReplacement,
  ImportDefaultSpecifier: convertImportSpecifierReplacement,
}

export default function createReplacementConverter(
  path: ASTPath<any>
): ReplacementConverter {
  const parentNode = path.parentPath?.node
  const nodeConverter = nodeConverters[path.node.type]

  if (nodeConverter) return nodeConverter(path)

  switch (parentNode?.type) {
    case 'JSXAttribute':
      if (path.node === parentNode.value)
        return convertJSXAttributeValueReplacement

      break
    case 'JSXElement':
      return convertJSXChildReplacement
    case 'ObjectExpression':
    case 'ObjectPattern':
      return convertPropertyReplacement
  }

  if (isStatement(path.node)) {
    return convertStatementReplacement
  }

  if (isExpression(path.node)) {
    return convertExpressionReplacement
  }

  if (isFlow(path.node)) {
    return convertFlowTypeReplacement
  }

  if (isTSType(path.node)) {
    return convertTSTypeReplacement
  }

  return identity
}

export function* bulkConvert(
  nodes: ASTNode | ASTNode[],
  convert: ReplacementConverter
): Iterable<ASTNode> {
  if (Array.isArray(nodes)) {
    for (const node of nodes) {
      const converted = convert(node)
      if (Array.isArray(converted)) yield* converted
      else yield converted
    }
  } else {
    const converted = convert(nodes)
    if (Array.isArray(converted)) yield* converted
    else yield converted
  }
}
