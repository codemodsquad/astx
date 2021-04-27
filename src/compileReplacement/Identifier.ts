import t from 'ast-types'
import j, { ASTNode, Identifier, ASTPath } from 'jscodeshift'
import { CompiledReplacement, CompileReplacementOptions } from './'
import compileCaptureReplacement from './Capture'
import compileGenericNodeReplacement from './GenericNodeReplacement'
import { unescapeIdentifier } from '../compileReplacement/Capture'
import { Match, StatementsMatch } from '../find'

import getIdentifierish from './getIdentifierish'

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
  if (t.namedTypes.Expression.check(node)) return node

  throw new Error(`can't convert ${node.type} to Expression`)
}

export function convertCaptureToPatternKind(
  node: ASTNode
): ASTNode | ASTNode[] {
  switch (node.type) {
    case 'ObjectPattern':
    case 'ArrayPattern':
    case 'Identifier':
      return node
  }

  const name = getIdentifierish(node)
  if (name) return j.identifier(name)

  throw new Error(`can't convert ${node.type} to PatternKind`)
}

const expressionCaptureOptions = {
  convertCapture: convertCaptureToExpression,
}

const variableDeclaratorIdCaptureOptions = {
  convertCapture: convertCaptureToPatternKind,
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
    path.parentPath &&
      path.parentPath.node.type === 'VariableDeclarator' &&
      path.node === path.parentPath.node.id
      ? variableDeclaratorIdCaptureOptions
      : expressionCaptureOptions
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
