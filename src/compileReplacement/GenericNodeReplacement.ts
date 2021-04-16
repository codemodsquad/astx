import { ASTNode } from 'jscodeshift'
import getFieldNames from '../util/getFieldNames'
import compileReplacement, {
  CompiledReplacement,
  CompileReplacementOptions,
} from './index'
import { Match, StatementsMatch } from '../find'
import indentDebug from '../compileMatcher/indentDebug'

export default function compileGenericNodeReplacement<N extends ASTNode>(
  pattern: N,
  compileOptions: CompileReplacementOptions
): CompiledReplacement<N> {
  const { debug } = compileOptions

  const propertyValues: [string, any][] = []
  const childReplacements: [string, CompiledReplacement<any>][] = []

  for (const key of getFieldNames(pattern)) {
    if (key === 'type') continue
    const value = (pattern as any)[key]
    if (typeof value !== 'object' || value == null) {
      propertyValues.push([key, value])
    } else {
      childReplacements.push([
        key,
        compileReplacement(value, {
          ...compileOptions,
          debug: indentDebug(debug, 2),
        }),
      ])
    }
  }

  return {
    generate: (match: Match<any> | StatementsMatch): N => {
      const result: any = { type: pattern.type }
      for (const [key, replacement] of childReplacements) {
        const value = replacement.generate(match)
        if (value !== undefined) result[key] = value
      }
      for (const [key, value] of propertyValues) {
        if (value !== undefined) result[key] = value
      }
      return result
    },
  }
}
