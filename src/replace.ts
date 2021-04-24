import j, {
  ASTNode,
  ASTPath,
  Collection,
  Expression,
  Statement,
} from 'jscodeshift'
import t from 'ast-types'
import find, { Match, StatementsMatch } from './find'
import compileReplacement from './compileReplacement'

export function generateReplacements<Node extends ASTNode>(
  matches: Match<Node>[],
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): ASTNode[] {
  return matches.map(
    (match: Match<Node>): ASTNode => {
      const replacement = compileReplacement(
        j([typeof replace === 'function' ? replace(match) : replace]).paths()[0]
      ).generate(match)
      if (
        t.namedTypes.Statement.check(match.node) !==
        t.namedTypes.Statement.check(replacement)
      ) {
        switch (replacement.type) {
          case 'ClassDeclaration':
            ;(replacement as any).type = 'ClassExpression'
            break
          case 'ClassExpression':
            ;(replacement as any).type = 'ClassDeclaration'
            break
          case 'FunctionDeclaration':
            ;(replacement as any).type = 'FunctionExpression'
            break
          case 'FunctionExpression':
            ;(replacement as any).type = 'FunctionDeclaration'
            break
          case 'ExpressionStatement':
            return replacement.expression
          default:
            if (t.namedTypes.Statement.check(match.node))
              return j.expressionStatement(replacement)
        }
      }
      return replacement
    }
  )
}

export function replaceMatches<Node extends ASTNode>(
  matches: Match<Node>[],
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): void {
  const replacements = generateReplacements(matches, replace)
  for (let i = 0; i < matches.length; i++) {
    matches[i].path.replace(replacements[i])
  }
}

function ensureStatement(value: Expression | Statement): Statement {
  if (t.namedTypes.Statement.check(value)) return value
  if (t.namedTypes.Expression.check(value)) return j.expressionStatement(value)
  throw new Error(`expected an expression or statement, but got: ${value.type}`)
}

function ensureStatements(
  value: Expression | Expression[] | Statement | Statement[]
): Statement[] {
  if (Array.isArray(value)) return value.map(ensureStatement)
  return [ensureStatement(value)]
}

export function replaceStatementsMatches(
  matches: StatementsMatch[],
  replace:
    | Expression
    | Statement
    | Statement[]
    | ((match: StatementsMatch) => Expression | Statement | Statement[])
): void {
  for (const match of matches) {
    const replacements = ensureStatements(
      compileReplacement(
        j(typeof replace === 'function' ? replace(match) : replace).paths()
      ).generate(match)
    )
    const parent = match.paths[0].parentPath
    let index = match.paths[0].name
    for (const replacement of replacements) {
      parent.insertAt(index++, replacement)
    }
    for (const path of match.paths) path.prune()
  }
}

export type ReplaceOptions = {
  where?: { [captureName: string]: (path: ASTPath<any>) => boolean }
}
export default function replace<Node extends ASTNode>(
  root: Collection,
  query: Node,
  replace: ASTNode | ((match: Match<Node>) => ASTNode),
  options?: ReplaceOptions
): void
export default function replace(
  root: Collection,
  query: Statement[],
  replace:
    | Statement
    | Statement[]
    | ((match: StatementsMatch) => Statement | Statement[]),
  options?: ReplaceOptions
): void
export default function replace<Node extends ASTNode>(
  root: Collection,
  query: Node | Statement[],
  replace:
    | ASTNode
    | Statement
    | Statement[]
    | ((match: Match<Node>) => ASTNode)
    | ((match: StatementsMatch) => Statement | Statement[]),
  options?: ReplaceOptions
): void {
  if (Array.isArray(query)) {
    const matches = find(root, query, options)
    replaceStatementsMatches(
      matches,
      replace as
        | Expression
        | Statement
        | Statement[]
        | ((match: StatementsMatch) => Statement | Statement[])
    )
  } else {
    const matches = find(root, query, options)
    replaceMatches(
      matches,
      replace as ASTNode | ((match: Match<Node>) => ASTNode)
    )
  }
}
