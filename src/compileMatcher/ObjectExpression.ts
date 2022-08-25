import {
  NodePath,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  SpreadElement,
  SpreadProperty,
} from '../types'
import t from 'ast-types'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import indentDebug from './indentDebug'
import compileMatcher, {
  CompiledMatcher,
  CompiledNodeMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from './index'

import { getAnyCaptureAs, getArrayCaptureAs } from './Capture'
import CompilePathError from '../util/CompilePathError'

function getSimpleKey(
  property:
    | ObjectProperty
    | t.namedTypes.Property
    | ObjectMethod
    | SpreadProperty
    | SpreadElement
): string | undefined {
  switch (property.type) {
    case 'ObjectProperty':
    case 'Property':
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
  property:
    | ObjectProperty
    | t.namedTypes.Property
    | ObjectMethod
    | SpreadProperty
    | SpreadElement
): string | undefined {
  if (property.type !== 'SpreadElement' && property.type !== 'SpreadProperty')
    return undefined
  const { argument } = property
  if (argument.type !== 'Identifier') return undefined
  return getArrayCaptureAs(argument.name)
}

export default function compileObjectExpressionMatcher(
  path: NodePath<ObjectExpression>,
  compileOptions: CompileOptions
): CompiledMatcher {
  const pattern: ObjectExpression = path.node

  const { debug } = compileOptions

  const propertyCompileOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 2),
  }

  const simpleProperties: Map<string, CompiledNodeMatcher> = new Map()
  let captureRestVariable: string | undefined
  const otherProperties: CompiledNodeMatcher[] = []
  const propertiesPaths = path.get('properties')

  for (let i = 0; i < pattern.properties.length; i++) {
    const property = pattern.properties[i]
    const simpleKey = getSimpleKey(property)

    if (simpleKey && !getAnyCaptureAs(simpleKey)) {
      simpleProperties.set(
        simpleKey,
        compileMatcher(propertiesPaths[i], propertyCompileOptions)
      )
      continue
    }

    const _captureRestVariable = getCaptureRestVariable(property)

    if (_captureRestVariable) {
      if (captureRestVariable)
        throw new CompilePathError(
          `two capture rest variables aren't allowed, found ${_captureRestVariable} and ${captureRestVariable}`,
          path.get('properties')[i]
        )

      captureRestVariable = _captureRestVariable
      continue
    }

    const matcher = compileMatcher(propertiesPaths[i], propertyCompileOptions)
    if (matcher.arrayCaptureAs) {
      return compileGenericNodeMatcher(path, compileOptions)
    }

    otherProperties.push(matcher)
  }

  for (const m of simpleProperties.values()) {
    if (m.type === 'node' && (m.captureAs || m.arrayCaptureAs)) {
      return compileGenericNodeMatcher(path, {
        ...compileOptions,
        debug,
      })
    }
  }

  return {
    type: 'node',
    pattern: path,
    match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
      debug('ObjectExpression')
      const { node } = path

      if (node.type !== pattern.type) return null

      const remainingSimpleProperties = new Map(simpleProperties.entries())
      const remainingOtherProperties = new Set(otherProperties)
      const capturedRestProperties: NodePath[] | undefined = captureRestVariable
        ? []
        : undefined

      for (let i = 0; i < node.properties.length; i++) {
        const property = node.properties[i]
        const propertyPath = (path as NodePath<ObjectExpression>).get(
          'properties'
        )[i]
        const simpleKey = getSimpleKey(property)

        if (simpleKey) {
          const matcher = remainingSimpleProperties.get(simpleKey)

          if (matcher) {
            debug(`  ${simpleKey} (exact key)`)
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
          debug(`  (other property [${o++}])`)
          const result = otherMatcher.match(propertyPath, matchSoFar)

          if (!result) continue

          matchSoFar = result
          matched = true
          remainingOtherProperties.delete(otherMatcher)
          break
        }
        if (matched) continue

        if (capturedRestProperties) {
          debug(`    captured in ${captureRestVariable}`)
          capturedRestProperties.push(propertyPath)
        } else {
          debug(`    not found in pattern`)
          return null
        }
      }

      if (remainingSimpleProperties.size) {
        debug(
          `  missing properties from pattern: %s`,
          [...remainingSimpleProperties.keys()].join(', ')
        )

        return null
      }

      if (remainingOtherProperties.size) {
        debug(
          `  missing ${remainingOtherProperties.size} other properties from pattern`
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
