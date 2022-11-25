import { Node, NodePath } from './types'
import { Match } from './find'
import compileReplacement, { CompiledReplacement } from './compileReplacement'
import createReplacementConverter, { bulkConvert } from './convertReplacement'
import { Backend } from './backend/Backend'
import pipeline from './util/pipeline'

export type ReplaceOptions = {
  backend: Backend
}

export default function replace(
  match: Match,
  replace: CompiledReplacement | Node | readonly Node[],
  { backend }: ReplaceOptions
): void {
  const path =
    match.path.parentPath?.node.type === 'ExpressionStatement'
      ? match.path.parentPath
      : match.path
  const replacements = [
    ...bulkConvert(
      (replace instanceof Object &&
      typeof (replace as any).generate === 'function'
        ? (replace as CompiledReplacement)
        : compileReplacement(
            Array.isArray(replace)
              ? replace.map((n) => new backend.t.NodePath(n))
              : new backend.t.NodePath(replace),
            { backend }
          )
      ).generate(match),
      createReplacementConverter(path)
    ),
  ]

  const replacedPaths = match.paths.map((p) =>
    p.parentPath?.node.type === 'ExpressionStatement' ? p.parentPath : p
  )

  replacedPaths[0]?.replace(...replacements)
  for (let i = 1; i < replacedPaths.length; i++) {
    replacedPaths[i].prune()
  }
}

export function replaceAll(
  matches: Match[],
  replace:
    | CompiledReplacement
    | Node
    | readonly Node[]
    | ((match: Match) => CompiledReplacement | Node | readonly Node[]),
  { backend }: ReplaceOptions
): void {
  for (const match of matches) {
    const path =
      match.path.parentPath?.node.type === 'ExpressionStatement'
        ? match.path.parentPath
        : match.path
    const replacements = [
      ...bulkConvert(
        (replace instanceof Object &&
        typeof (replace as any).generate === 'function'
          ? (replace as CompiledReplacement)
          : compileReplacement(
              pipeline(
                typeof replace === 'function'
                  ? replace(match)
                  : (replace as any),
                (replacement: Node | readonly Node[]): NodePath | NodePath[] =>
                  Array.isArray(replacement)
                    ? replacement.map((n) => new backend.t.NodePath(n))
                    : new backend.t.NodePath(replacement)
              ),
              { backend }
            )
        ).generate(match),
        createReplacementConverter(path)
      ),
    ]

    const replacedPaths = match.paths.map((p) =>
      p.parentPath?.node.type === 'ExpressionStatement' ? p.parentPath : p
    )

    replacedPaths[0]?.replace(...replacements)
    for (let i = 1; i < replacedPaths.length; i++) {
      replacedPaths[i].prune()
    }
  }
}
