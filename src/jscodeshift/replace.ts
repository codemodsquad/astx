import j, { ASTNode } from 'jscodeshift'
import { Match } from './find'
import compileReplacement, { CompiledReplacement } from './compileReplacement'
import createReplacementConverter, { bulkConvert } from './convertReplacement'

function singleOrArray<T>(values: T[]): T | T[] {
  return values.length === 1 ? values[0] : values
}

export default function replace(
  matches: Match[],
  replace:
    | CompiledReplacement
    | ASTNode
    | ASTNode[]
    | ((match: Match) => ASTNode | ASTNode[])
): void {
  for (const match of matches) {
    const path =
      match.path.parentPath.node.type === 'ExpressionStatement'
        ? match.path.parentPath
        : match.path
    const replacements = [
      ...bulkConvert(
        (replace instanceof Object &&
        typeof (replace as any).generate === 'function'
          ? (replace as CompiledReplacement)
          : compileReplacement(
              singleOrArray(
                j(
                  (typeof replace === 'function' ? replace(match) : replace) as
                    | ASTNode
                    | ASTNode[]
                ).paths()
              )
            )
        ).generate(match),
        createReplacementConverter(path)
      ),
    ]

    const replacedPaths = match.paths.map((p) =>
      p.parentPath.node.type === 'ExpressionStatement' ? p.parentPath : p
    )

    if (replacements.length > 1 || replacedPaths.length > 1) {
      const parent = path.parentPath
      let index = path.name
      for (const replacement of replacements) {
        parent.insertAt(index++, replacement)
      }
      for (const path of replacedPaths) path.prune()
    } else {
      path.replace(replacements[0])
    }
  }
}
