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

export function generateReplacements(
  match: Match,
  replace: ASTNode | ((match: Match) => ASTNode)
): ASTNode | ASTNode[] | Statement | Statement[] {
  const replacement = compileReplacement(
    j([typeof replace === 'function' ? replace(match) : replace]).paths()[0]
  ).generate(match)
  const ensureSameType =
    match.path.parentPath.node.type === 'ExpressionStatement' ||
    t.namedTypes.Statement.check(match.node)
      ? ensureStatement
      : ensureExpression
  if (Array.isArray(replacement)) return replacement.map(ensureSameType)
  return ensureSameType(replacement)
}

export function replaceMatches(
  matches: Match[],
  replace: ASTNode | ((match: Match) => ASTNode)
): void {
  for (const match of matches) {
    const replacements = generateReplacements(match, replace)
    if (match.path.parentPath.node.type === 'ExpressionStatement') {
      match.path.parentPath.replace(replacements)
    } else {
      match.path.replace(replacements)
    }
  }
}

function ensureExpression(value: ASTNode): Expression {
  switch (value.type) {
    case 'ClassDeclaration':
      return { ...value, type: 'ClassExpresion' }
    case 'FunctionDeclaration':
      return { ...value, type: 'FunctionExpresion' }
    case 'ExpressionStatement':
      return value.expression
  }
  if (t.namedTypes.Expression.check(value)) return value
  throw new Error(`can't convert ${value.type} to an expression`)
}

function ensureStatement(value: ASTNode): Statement {
  switch (value.type) {
    case 'ClassExpression':
      return { ...value, type: 'ClassDeclaration' }
    case 'FunctionExpression':
      return { ...value, type: 'FunctionDeclaration' }
  }
  if (t.namedTypes.Expression.check(value)) return j.expressionStatement(value)
  if (t.namedTypes.Statement.check(value)) return value
  throw new Error(`expected an expression or statement, but got: ${value.type}`)
}

function ensureStatements(value: ASTNode | ASTNode[]): Statement[] {
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
  where?: { [captureName: string]: (path: ASTPath) => boolean }
}
export default function replace(
  root: Collection,
  pattern: ASTNode,
  replace: ASTNode | ((match: Match) => ASTNode),
  options?: ReplaceOptions
): void
export default function replace(
  root: Collection,
  pattern: Statement[],
  replace:
    | Statement
    | Statement[]
    | ((match: StatementsMatch) => Statement | Statement[]),
  options?: ReplaceOptions
): void
export default function replace(
  root: Collection,
  pattern: ASTNode | Statement[],
  replace:
    | ASTNode
    | Statement
    | Statement[]
    | ((match: Match) => ASTNode)
    | ((match: StatementsMatch) => Statement | Statement[]),
  options?: ReplaceOptions
): void {
  if (Array.isArray(pattern)) {
    const matches = find(root, pattern, options)
    replaceStatementsMatches(
      matches,
      replace as
        | Expression
        | Statement
        | Statement[]
        | ((match: StatementsMatch) => Statement | Statement[])
    )
  } else {
    const matches = find(root, pattern, options)
    replaceMatches(matches, replace as ASTNode | ((match: Match) => ASTNode))
  }
}
