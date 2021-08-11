import { ASTNode, ASTPath } from 'jscodeshift'
import getFieldNames from '../util/getFieldNames'
import compileReplacement, {
  CompiledReplacement,
  CompileReplacementOptions,
} from './index'
import { Match } from '../find'
import indentDebug from '../compileMatcher/indentDebug'
import * as t from 'ast-types'

export default function compileGenericNodeReplacement(
  path: ASTPath<any>,
  compileOptions: CompileReplacementOptions
): CompiledReplacement {
  const pattern = path.node

  const { debug } = compileOptions

  const propertyValues: [string, any][] = []
  const childReplacements: [string, CompiledReplacement][] = []

  for (const key of getFieldNames(pattern)) {
    if (key === 'type' || key === 'extra') continue

    const value = t.getFieldValue(pattern, key)

    if (Array.isArray(value) || t.namedTypes.Node.check(value)) {
      childReplacements.push([
        key,
        compileReplacement(path.get(key), {
          ...compileOptions,
          debug: indentDebug(debug, 2),
        }),
      ])
    } else {
      propertyValues.push([key, value])
    }
  }

  return {
    generate: (match: Match): ASTNode | ASTNode[] => {
      const result: any = {
        type: pattern.type,
      }

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
