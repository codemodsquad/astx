import { Node } from './types'
import { Match } from './find'
import compileReplacement, { CompiledReplacement } from './compileReplacement'
import createReplacementConverter, { bulkConvert } from './convertReplacement'
import { Backend } from './Backend'
import pipeline from './util/pipeline'

export type ReplaceOptions = {
  backend: Backend
}

export default function replace(
  matches: Match[],
  replace:
    | CompiledReplacement
    | Node
    | Node[]
    | ((match: Match) => Node | Node[]),
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
                  : (replace as Node | Node[]),
                (nodes: Node | Node[]) =>
                  Array.isArray(nodes)
                    ? nodes.map((n) => backend.rootPath(n))
                    : backend.rootPath(nodes)
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

    if (replacements.length > 1 || replacedPaths.length > 1) {
      const { listKey, parentPath, key } = path
      if (!parentPath || !listKey || typeof key !== 'number') continue
      const siblingPaths = parentPath.get(listKey)
      if (!Array.isArray(siblingPaths)) continue
      for (const replacement of replacements) {
        siblingPaths[key].insertBefore(replacement)
      }
      for (const path of replacedPaths) path.remove()
    } else {
      path.replaceWith(replacements[0])
    }
  }
}
