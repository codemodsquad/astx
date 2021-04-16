import {
  ASTPath,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  Property,
  SpreadElement,
  SpreadProperty,
} from 'jscodeshift'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import indentDebug from './indentDebug'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from './index'

import { getArrayCaptureAs } from './Capture'

function getSimpleKey(
  property:
    | ObjectProperty
    | Property
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
    | Property
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
  query: ObjectExpression,
  compileOptions: CompileOptions
): CompiledMatcher {
  const { debug } = compileOptions
  const propertyCompileOptions = {
    ...compileOptions,
    debug: indentDebug(debug, 1),
  }
  const simpleProperties: Map<string, CompiledMatcher> = new Map()
  let captureRestVariable: string | undefined
  const otherProperties: CompiledMatcher[] = []
  for (const property of query.properties) {
    const simpleKey = getSimpleKey(property)
    if (simpleKey) {
      simpleProperties.set(
        simpleKey,
        compileMatcher(property, propertyCompileOptions)
      )
      continue
    }
    const _captureRestVariable = getCaptureRestVariable(property)
    if (_captureRestVariable) {
      if (captureRestVariable)
        throw new Error(
          `two capture rest variables aren't allowed, found ${_captureRestVariable} and ${captureRestVariable}`
        )
      captureRestVariable = _captureRestVariable
      continue
    }
    otherProperties.push(compileMatcher(property, propertyCompileOptions))
  }
  for (const m of simpleProperties.values()) {
    if (m.captureAs || m.arrayCaptureAs) {
      return compileGenericNodeMatcher(query, { ...compileOptions, debug })
    }
  }
  return {
    match: (path: ASTPath<any>, matchSoFar: MatchResult): MatchResult => {
      const { node } = path
      if (node.type !== query.type) return null
      const remainingSimpleProperties = new Map(simpleProperties.entries())
      const remainingOtherProperties = new Set(otherProperties)
      const capturedRestProperties:
        | ASTPath<any>[]
        | undefined = captureRestVariable ? [] : undefined
      for (let i = 0; i < node.properties.length; i++) {
        const property = node.properties[i]
        const propertyPath = path.get('properties', i)
        const simpleKey = getSimpleKey(property)
        let matched = false
        if (simpleKey) {
          debug(simpleKey)
          const matcher = remainingSimpleProperties.get(simpleKey)
          if (matcher) {
            const result = matcher.match(propertyPath, matchSoFar)
            if (!result) return null
            matchSoFar = result
            matched = true
            remainingSimpleProperties.delete(simpleKey)
          }
        } else {
          debug('(other)')
          for (const otherMatcher of remainingOtherProperties) {
            const result = otherMatcher.match(propertyPath, matchSoFar)
            if (!result) continue
            matchSoFar = result
            matched = true
            remainingOtherProperties.delete(otherMatcher)
          }
        }
        if (!matched) {
          if (capturedRestProperties) {
            debug(`  captured in ${captureRestVariable}`)
            capturedRestProperties.push(propertyPath)
          } else {
            debug(`  not found in pattern`)
            return null
          }
        }
      }
      if (remainingSimpleProperties.size) {
        debug(
          `missing properties from pattern: %s`,
          [...remainingSimpleProperties.keys()].join(', ')
        )
        return null
      }
      if (remainingOtherProperties.size) {
        debug(
          `missing ${remainingOtherProperties.size} other properties from pattern`
        )
        return null
      }

      if (captureRestVariable && capturedRestProperties) {
        matchSoFar = mergeCaptures(matchSoFar, {
          arrayCaptures: { [captureRestVariable]: capturedRestProperties },
        })
      }
      return matchSoFar || {}
    },
    nodeType: 'ObjectExpression',
  }
}
