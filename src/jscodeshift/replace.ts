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
        createReplacementConverter(match.path)
      ),
    ]

    if (replacements.length > 1 || match.paths.length > 1) {
      const parent = match.path.parentPath
      let index = match.path.name
      for (const replacement of replacements) {
        parent.insertAt(index++, replacement)
      }
      for (const path of match.paths) path.prune()
    } else {
      match.path.replace(replacements[0])
    }
  }
}
