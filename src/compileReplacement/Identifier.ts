import t from 'ast-types'
import { ASTNode, Identifier, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from './'
import compileCaptureReplacement from './Capture'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import { unescapeIdentifier } from '../compileReplacement/Capture'

import { Match, StatementsMatch } from '../find'

export function convertCaptureToExpression(node: ASTNode): ASTNode | ASTNode[] {
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
  convertCapture: convertCaptureToExpression,
}

export default function compileIdentifierReplacement(
  path: ASTPath<Identifier>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const pattern = path.node
  const { typeAnnotation } = pattern
  const captureReplacement = compileCaptureReplacement(
    pattern,
    pattern.name,
    compileOptions,
    captureOptions
  )
  if (captureReplacement) {
    if (typeAnnotation) {
      const typeAnnotationReplacement = compileGenericNodeReplacement(
        path.get('typeAnnotation'),
        compileOptions
      )
      return {
        ...captureReplacement,
        generate: (match: Match | StatementsMatch): ASTNode | ASTNode[] => {
          const generated = captureReplacement.generate(match)
          if (!Array.isArray(generated)) {
            ;(generated as any).typeAnnotation = typeAnnotationReplacement.generate(
              match
            )
          }
          return generated
        },
      }
    }
    return captureReplacement
  }
  pattern.name = unescapeIdentifier(pattern.name)
}
