import {
  NodePath,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  SpreadElement,
} from '../types'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import indentDebug from './indentDebug'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from './index'

import { getAnyCaptureAs, getArrayCaptureAs } from './Capture'
import CompilePathError from '../util/CompilePathError'

function getSimpleKey(
  property: ObjectProperty | ObjectMethod | SpreadElement
): string | undefined {
  switch (property.type) {
    case 'ObjectProperty':
    case 'ObjectMethod':
      switch (property.key.type) {
        case 'Identifier':
          return property.key.name
        case 'StringLiteral':
        case 'Literal':
          return String(property.key.value)
        default:
          return undefined
      }
    default:
      return undefined
  }
}

function getCaptureRestVariable(
  property: ObjectProperty | ObjectMethod | SpreadElement
): string | undefined {
  if (property.type !== 'SpreadElement') return undefined
  const { argument } = property
  if (argument.type !== 'Identifier') return undefined
  return getArrayCaptureAs(argument.name)
}

export default function compileObjectExpressionMatcher(
  path: NodePath<ObjectExpression, ObjectExpression>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: ObjectExpression = path.value
  const n = compileOptions.backend.t.namedTypes

  const { debug } = compileOptions

  const propertyCompileOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }

  const simpleProperties: Map<string, CompiledMatcher> = new Map()
  let captureRestVariable: string | undefined
  const otherProperties: CompiledMatcher[] = []
  const propertiesPaths = path.get('properties')

  for (let i = 0; i < pattern.properties.length; i++) {
    const property = pattern.properties[i]
    const simpleKey = getSimpleKey(property as any)

    if (simpleKey && !getAnyCaptureAs(simpleKey)) {
      simpleProperties.set(
        simpleKey,
        compileMatcher(propertiesPaths.get(i), propertyCompileOptions)
      )
      continue
    }

    const _captureRestVariable = getCaptureRestVariable(property as any)

    if (_captureRestVariable) {
      if (captureRestVariable)
        throw new CompilePathError(
          `two capture rest variables aren't allowed, found ${_captureRestVariable} and ${captureRestVariable}`,
          propertiesPaths.get(i)
        )

      captureRestVariable = _captureRestVariable
      continue
    }

    const matcher = compileMatcher(
      propertiesPaths.get(i),
      propertyCompileOptions
    )
    if (matcher.arrayCaptureAs) {
      return compileGenericNodeMatcher(path, compileOptions)
    }

    otherProperties.push(matcher)
  }

  for (const m of simpleProperties.values()) {
    if (m.captureAs || m.arrayCaptureAs) {
      return compileGenericNodeMatcher(path, {
        ...compileOptions,
        debug,
      })
    }
  }

  return {
    pattern: path,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('ObjectExpression')
      const { value: node } = path

      if (!n.ObjectExpression.check(node)) return null

      const remainingSimpleProperties = new Map(simpleProperties.entries())
      const remainingOtherProperties = new Set(otherProperties)
      const capturedRestProperties: NodePath[] | undefined = captureRestVariable
        ? []
        : undefined

      for (let i = 0; i < node.properties.length; i++) {
        const property = node.properties[i]
        const propertyPath = path.get('properties').get(i)
        const simpleKey = getSimpleKey(property as any)

        if (simpleKey) {
          const matcher = remainingSimpleProperties.get(simpleKey)

          if (matcher) {
            debug('  %s (exact key)', simpleKey)
            const result = matcher.match(propertyPath, matchSoFar)

            if (!result) return null

            matchSoFar = result
            remainingSimpleProperties.delete(simpleKey)
            continue
          }
        }

        let matched = false
        let o = 0
        for (const otherMatcher of remainingOtherProperties) {
          debug('  (other property [%d])', o++)
          const result = otherMatcher.match(propertyPath, matchSoFar)

          if (!result) continue

          matchSoFar = result
          matched = true
          remainingOtherProperties.delete(otherMatcher)
          break
        }
        if (matched) continue

        if (capturedRestProperties) {
          debug('    captured in %s', captureRestVariable)
          capturedRestProperties.push(propertyPath)
        } else {
          debug('    not found in pattern')
          return null
        }
      }

      if (remainingSimpleProperties.size) {
        if (debug.enabled) {
          debug('  missing properties from pattern:')
          for (const key of remainingSimpleProperties.keys()) {
            debug('    %s', key)
          }
        }

        return null
      }

      if (remainingOtherProperties.size) {
        debug(
          `  missing %d other properties from pattern`,
          remainingOtherProperties.size
        )
        return null
      }

      if (captureRestVariable && capturedRestProperties) {
        matchSoFar = mergeCaptures(matchSoFar, {
          arrayCaptures: {
            [captureRestVariable]: capturedRestProperties,
          },
        })
      }

      return matchSoFar || {}
    },

    nodeType: 'ObjectExpression',
  }
}
