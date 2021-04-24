import t from 'ast-types'
import { ASTNode, Expression, Identifier, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from './'
import compileCaptureReplacement from './Capture'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import { unescapeIdentifier } from '../compileReplacement/Capture'

export function convertCaptureToExpression(node: ASTNode): Expression {
  switch (node.type) {
    case 'JSXExpressionContainer':
    case 'ExpressionStatement':
      return node.expression
    case 'GenericTypeAnnotation':
      if (node.id.type === 'Identifier' && node.typeParameters == null)
        return node.id
      break
    case 'TSTypeReference':
      if (node.typeName.type === 'Identifier' && node.typeParameters == null)
        return node.typeName
      break
    default:
      if (t.namedTypes.Expression.check(node)) return node
  }
  throw new Error(`converting ${node.type} to Expression isn't supported`)
}

const captureOptions = {
  convertCapture: convertCaptureToExpression as any,
}

export default function compileIdentifierReplacement(
  path: ASTPath<Identifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<any> | void {
  const pattern = path.node
  if (pattern.typeAnnotation != null)
    return compileGenericNodeReplacement(path, compileOptions)
  const captureReplacement = compileCaptureReplacement(
    pattern,
    pattern.name,
    compileOptions,
    captureOptions
  )
  if (captureReplacement) return captureReplacement
  pattern.name = unescapeIdentifier(pattern.name)
}
