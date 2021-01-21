import {
  ASTPath,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  Property,
  SpreadElement,
  SpreadProperty,
} from 'jscodeshift'
import indentDebug from './indentDebug'
import compileMatcher, {
  CompiledMatcher,
  CompileOptions,
  MatchResult,
  mergeCaptures,
} from './index'

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
  const captureMatch = /^\$[a-z0-9]+/i.exec(argument.name)
  return captureMatch?.[0]
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
  return {
    match: (path: ASTPath<any>): MatchResult => {
      let captures: MatchResult = null

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
            const result = matcher.match(propertyPath)
            if (!result) return null
            matched = true
            remainingSimpleProperties.delete(simpleKey)
            captures = mergeCaptures(captures, result)
          }
        } else {
          debug('(other)')
          for (const otherMatcher of remainingOtherProperties) {
            const result = otherMatcher.match(propertyPath)
            if (!result) continue
            matched = true
            remainingOtherProperties.delete(otherMatcher)
            captures = mergeCaptures(captures, result)
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
        captures = mergeCaptures(captures, {
          arrayCaptures: { [captureRestVariable]: capturedRestProperties },
        })
      }
      return captures || {}
    },
    nodeType: 'ObjectExpression',
  }
}
