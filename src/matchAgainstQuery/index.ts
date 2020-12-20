import { ASTPath, ASTNode } from 'jscodeshift'
import t from 'ast-types'
import BooleanLiteral from './BooleanLiteral'
import Literal from './Literal'
import NumericLiteral from './NumericLiteral'
import RegExpLiteral from './RegExpLiteral'
import StringLiteral from './StringLiteral'
import __debug from 'debug'
import { memoize } from 'lodash'

const _debug = __debug('matchAgainstQuery')

let indent = 0
const getIndent = memoize(indent => ' '.repeat(indent * 2))

const debug = (format: string, ...args: any[]): any =>
  _debug.enabled ? _debug(`%s${format}`, getIndent(indent), ...args) : null

const nodeMatchers: Record<
  string,
  (path: ASTPath<any>, query: any, options: Options) => boolean
> = {
  BooleanLiteral,
  Literal,
  NumericLiteral,
  RegExpLiteral,
  StringLiteral,
}

function isCompatibleType(path: ASTPath<any>, query: ASTNode): boolean {
  if (t.namedTypes.Function.check(query)) {
    return t.namedTypes.Function.check(path.node)
  }
  return false
}

export type Options = {
  where?: { [captureName: string]: (path: ASTPath<any>) => boolean }
  onCapture: (identifier: string, path: ASTPath<any>) => void
}

export default function matchAgainstQuery(
  path: ASTPath<any>,
  query: ASTNode | ASTNode[],
  options: Options
): boolean {
  const initIndent = indent
  try {
    if (Array.isArray(query)) {
      debug('Array')
      indent++
      if (!Array.isArray(path.value)) {
        debug('path.value is not an array')
        return false
      }
      if (path.value.length !== query.length) {
        debug(
          'path.value.length (%d) !== query.length (%d)',
          path.value.length,
          query.length
        )
        return false
      }
      for (let i = 0; i < query.length; i++) {
        debug('[%d]', i)
        indent++
        if (!matchAgainstQuery(path.get(i), query[i], options)) return false
        indent--
      }
      return true
    } else if (query.type === 'Identifier') {
      debug('identifier', query.name)
      indent++
      const captureMatch = /^\$[a-z0-9]+/i.exec(query.name)
      if (captureMatch) {
        const whereCondition = options?.where?.[captureMatch[0]]
        if (whereCondition && !whereCondition(path)) {
          debug('where condition returned false')
          return false
        }
        options.onCapture(captureMatch[0], path)
        debug('captured as %s', captureMatch[0])
        return true
      } else {
        if (
          path.node?.type === 'Identifier' &&
          path.node.name === query.name.replace(/^\$\$/g, '$')
        ) {
          debug('matched')
          return true
        } else {
          debug(`didn't match`)
          return false
        }
      }
    } else if (nodeMatchers[query.type]) {
      debug('%s (specific)', query.type)
      indent++
      if (nodeMatchers[query.type](path, query, options)) {
        debug('matched')
        return true
      } else {
        debug(`didn't match`)
        return false
      }
    } else if (
      path.node?.type === query.type ||
      isCompatibleType(path, query)
    ) {
      debug('%s (generic)', query.type)
      indent++
      for (const key of t.getFieldNames(path.node)) {
        if (key === 'type') continue
        debug('.%s', key)
        indent++
        const value = (query as any)[key]
        if (typeof value !== 'object' || value == null) {
          if (value !== path.node[key]) {
            debug('%s !== %s', value, path.node[key])
            return false
          } else {
            debug('%s === %s', value, path.node[key])
          }
        } else if (!matchAgainstQuery(path.get(key), value, options)) {
          return false
        }
        indent--
      }
      return true
    } else {
      debug(
        'path.node?.type (%s) is not compatible with query.type (%s)',
        path.node?.type,
        query.type
      )
      return false
    }
  } finally {
    indent = initIndent
  }
}
