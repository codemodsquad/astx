import { Node, File } from '../types'
import * as t from '@babel/types'

export default function wrapOrphan(node: Node): File {
  if (t.isTypeAnnotation(node))
    return wrapOrphan(t.typeCastExpression(t.nullLiteral(), node))
  if (t.isFlowType(node)) return wrapOrphan(t.typeAnnotation(node))
  if (t.isTSType(node))
    return wrapOrphan(t.tsAsExpression(t.nullLiteral(), node))
  if (t.isObjectProperty(node) || t.isSpreadElement(node))
    return wrapOrphan(t.objectExpression([node]))
  if (t.isTSTypeParameter(node)) return wrapOrphan(t.tsTypeLiteral([node]))
  if (t.isObjectTypeProperty(node) || t.isObjectTypeSpreadProperty(node))
    return wrapOrphan(t.objectTypeAnnotation([node]))
  if (t.isObjectTypeIndexer(node))
    return wrapOrphan(t.objectTypeAnnotation([], [node]))
  if (t.isObjectTypeCallProperty(node))
    return wrapOrphan(t.objectTypeAnnotation([], [], [node]))
  if (t.isExpression(node)) return wrapOrphan(t.expressionStatement(node))
  if (t.isStatement(node)) return wrapOrphan(t.program([node]))
  if (t.isProgram(node)) return t.file(node)
}
