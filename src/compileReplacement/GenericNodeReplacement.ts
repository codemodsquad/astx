import { Node, NodePath } from '../types'
import compileReplacement, {
  CompiledReplacement,
  CompileReplacementOptions,
  ReplaceableMatch,
} from './index'
import indentDebug from '../compileMatcher/indentDebug'

export default function compileGenericNodeReplacement(
  path: NodePath,
  compileOptions: CompileReplacementOptions
): CompiledReplacement {
  const pattern = path.value
  const {
    backend: { t },
  } = compileOptions

  const { debug } = compileOptions

  const propertyValues: [string, any][] = []
  const childReplacements: [string, CompiledReplacement][] = []

  for (const key of t.getFieldNames(pattern)) {
    const value = t.getFieldValue(pattern, key)
    const fieldPath = path.get(key)

    if (Array.isArray(fieldPath.value) || fieldPath.node === fieldPath.value) {
      childReplacements.push([
        key,
        compileReplacement(fieldPath, {
          ...compileOptions,
          debug: indentDebug(debug, 2),
        }),
      ])
    } else {
      propertyValues.push([key, value])
    }
  }

  return {
    generate: (match: ReplaceableMatch): Node | Node[] => {
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
