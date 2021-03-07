import {
  ASTNode,
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

import compileArrayMatcher, { ElementMatcherKind } from './AdvancedArrayMatcher'

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

function hasArrayCaptures(query: ObjectExpression): boolean {
  return query.properties.some(
    (property) =>
      (property.type === 'ObjectProperty' || property.type === 'Property') &&
      property.shorthand &&
      !property.computed &&
      property.key.type === 'Identifier' &&
      /^\$_?[a-z0-9]+/.test(property.key.name)
  )
}

export default function compileObjectExpressionMatcher(
  query: ObjectExpression,
  compileOptions: CompileOptions
): CompiledMatcher {
  if (hasArrayCaptures(query)) {
    return compileGenericNodeMatcher(query, compileOptions, {
      keyMatchers: {
        properties: compileArrayMatcher(query.properties, compileOptions, {
          getElementMatcherKind: (node: ASTNode): ElementMatcherKind => {
            if (
              (node.type === 'ObjectProperty' || node.type === 'Property') &&
              node.shorthand &&
              !node.computed &&
              node.key.type === 'Identifier'
            ) {
              const match = /^\$_?[a-z0-9]+/i.exec(node.key.name)
              if (match)
                return {
                  kind: match[0].startsWith('$_') ? '*' : '$',
                  captureAs: match[0],
                }
            }
            return { kind: 'element', query: node }
          },
        }),
      },
    })
  }

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
