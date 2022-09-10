import { Identifier, NodePath } from '../types'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compileCaptureMatcher, { unescapeIdentifier } from './Capture'

export default function compileIdentifierMatcher(
  path: NodePath<Identifier, Identifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: Identifier = path.value
  const n = compileOptions.backend.t.namedTypes

  const typeAnnotation = path.get('typeAnnotation')

  const captureMatcher = compileCaptureMatcher(
    path,
    pattern.name,
    compileOptions,
    {
      nodeType: 'Identifier',
      getCondition: () =>
        [
          ...[
            [n.VariableDeclarator, 'id'],
            [n.Function, 'id'],
            [n.CallExpression, 'callee'],
            [n.MemberExpression, 'object'],
            [n.MemberExpression, 'property'],
            [n.ObjectProperty, 'key'],
            [n.ObjectProperty, 'value'],
            [n.SpreadElement, 'argument'],
            [(n as any).Class, 'id'],
            [(n as any).Class, 'superClass'],
            [n.TypeAlias, 'id'],
            [n.TSTypeAliasDeclaration, 'id'],
            [n.ObjectTypeProperty, 'key'],
            [n.ObjectTypeProperty, 'value'],
          ].map(
            ([type, field]) =>
              (path: NodePath) =>
                (type as any).check(path.parent?.value) && path.name === field
          ),
          ...[[n.TSFunctionType, 'parameters']].map(
            ([type, field]) =>
              (path: NodePath) =>
                (type as any).check(path.parent?.value) &&
                path.parentPath?.name === field
          ),
        ].find((cond) => cond(path)),
    }
  )

  if (captureMatcher) {
    const { captureAs } = captureMatcher

    if (typeAnnotation && typeAnnotation.value) {
      const typeAnnotationMatcher = compileMatcher(
        typeAnnotation,
        compileOptions
      )

      return {
        ...captureMatcher,

        match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
          matchSoFar = captureMatcher.match(path, matchSoFar)

          if (matchSoFar == null) return null

          const captured = captureAs ? matchSoFar.captures?.[captureAs] : null

          if (captured) {
            ;(captured.node as any).astx = {
              excludeTypeAnnotationFromCapture: true,
            }
          }

          return typeAnnotationMatcher.match(
            path.get('typeAnnotation'),
            matchSoFar
          )
        },
      }
    }

    return captureMatcher
  }

  pattern.name = unescapeIdentifier(pattern.name)
}
