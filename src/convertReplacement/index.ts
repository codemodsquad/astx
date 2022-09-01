import { Node, NodePath } from '../types'
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
import * as t from '@babel/types'
import ensureArray from '../util/ensureArray'

export type ReplacementConverter = (replacement: Node) => Node | Node[]

function identity<T>(x: T): T {
  return x
}

const nodeConverters: Record<string, (path: NodePath) => ReplacementConverter> =
  {
    TypeParameter,
    TSTypeParameter,
    ImportSpecifier: convertImportSpecifierReplacement,
    ImportDefaultSpecifier: convertImportSpecifierReplacement,
  }

export default function createReplacementConverter(
  path: NodePath<any>
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

  if (t.isStatement(path.node)) {
    return convertStatementReplacement
  }

  if (t.isExpression(path.node)) {
    return convertExpressionReplacement
  }

  if (t.isFlow(path.node)) {
    return convertFlowTypeReplacement
  }

  if (t.isTSType(path.node)) {
    return convertTSTypeReplacement
  }

  return identity
}

export function* bulkConvert(
  nodes: Node | Node[],
  convert: ReplacementConverter
): Iterable<Node> {
  for (const node of ensureArray(nodes)) {
    const converted = convert(node)
    if (Array.isArray(converted)) yield* converted
    else yield converted
  }
}
