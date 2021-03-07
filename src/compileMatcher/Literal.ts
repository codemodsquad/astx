import { ASTPath, Literal } from 'jscodeshift'
import { PredicateMatcher } from './index'
import sortFlags from './sortFlags'

export default function matchLiteral(query: Literal): PredicateMatcher {
  const { regex } = query
  if (regex) {
    const regexFlags = sortFlags(regex.flags)
    return {
      predicate: true,
      match: (path: ASTPath<any>): boolean => {
        const { node } = path
        if (node.type !== 'Literal') return false
        return (
          node.regex != null &&
          node.regex.pattern === regex.pattern &&
          sortFlags(node.regex.flags) === sortFlags(regexFlags)
        )
      },
      nodeType: 'Literal',
    }
  }
  return {
    predicate: true,
    match: (path: ASTPath<any>): boolean => {
      const { node } = path
      if (node.type !== 'Literal' || node.regex) return false
      return node.value === query.value
    },
    nodeType: 'Literal',
  }
}
