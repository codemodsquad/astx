import { ASTPath, Literal } from 'jscodeshift'
import { compileStringCaptureMatcher } from './Capture'
import {
  CompiledMatcher,
  CompileOptions,
  convertPredicateMatcher,
} from './index'
import sortFlags from './sortFlags'

export default function matchLiteral(
  query: Literal,
  compileOptions: CompileOptions
): CompiledMatcher {
  const { regex } = query
  if (regex) {
    const regexFlags = sortFlags(regex.flags)
    return convertPredicateMatcher(
      query,
      {
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
      },
      compileOptions
    )
  }
  if (typeof query.value === 'string') {
    const captureMatcher = compileStringCaptureMatcher(
      query,
      (node: Literal) => (typeof node.value === 'string' ? node.value : null),
      compileOptions
    )
    if (captureMatcher) return captureMatcher
  }
  return convertPredicateMatcher(
    query,
    {
      predicate: true,

      match: (path: ASTPath<any>): boolean => {
        const { node } = path
        if (node.type !== 'Literal' || node.regex) return false
        return node.value === query.value
      },

      nodeType: 'Literal',
    },
    compileOptions
  )
}
