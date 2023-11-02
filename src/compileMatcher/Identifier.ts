import { Identifier, NodePath, setAstxMatchInfo } from '../types'
import compileMatcher, { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compilePlaceholderMatcher, { unescapeIdentifier } from './Placeholder'

export default function compileIdentifierMatcher(
  path: NodePath<Identifier, Identifier>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: Identifier = path.value
  const n = compileOptions.backend.t.namedTypes

  const typeAnnotation = path.get('typeAnnotation')

  const placeholderMatcher = compilePlaceholderMatcher(
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

  if (placeholderMatcher) {
    const { placeholder } = placeholderMatcher

    if (typeAnnotation && typeAnnotation.value) {
      const typeAnnotationMatcher = compileMatcher(
        typeAnnotation,
        compileOptions
      )

      return {
        ...placeholderMatcher,

        match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
          matchSoFar = placeholderMatcher.match(path, matchSoFar)

          if (matchSoFar == null) return null

          const captured = placeholder
            ? matchSoFar.captures?.[placeholder]
            : null

          if (captured) {
            setAstxMatchInfo(captured.node, {
              subcapture: {
                type: 'Identifier',
                name: (captured.node as Identifier).name,
              },
            })
          }

          return typeAnnotationMatcher.match(
            path.get('typeAnnotation'),
            matchSoFar
          )
        },
      }
    }

    return placeholderMatcher
  }

  pattern.name = unescapeIdentifier(pattern.name)
}
