import { Node } from './types'
import { Match } from './find'
import compileReplacement, { CompiledReplacement } from './compileReplacement'
import createReplacementConverter, { bulkConvert } from './convertReplacement'
import { Backend } from './backend/Backend'
import pipeline from './util/pipeline'

export type ReplaceOptions = {
  backend: Backend
}

export default function replace(
  matches: readonly Match[],
  replace:
    | CompiledReplacement
    | Node
    | readonly Node[]
    | ((match: Match) => Node | readonly Node[]),
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
                  : (replace as Node | readonly Node[]),
                (nodes: Node | readonly Node[]) =>
                  Array.isArray(nodes)
                    ? nodes.map((n) => new backend.t.NodePath(n))
                    : new backend.t.NodePath(nodes)
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
