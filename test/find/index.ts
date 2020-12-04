import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift, { ASTPath, JSCodeshift } from 'jscodeshift'
import { FindOptions, Match } from '../../src/find'
import Astx from '../../src/Astx'
import requireGlob from 'require-glob'
import mapValues from '../../src/util/mapValues'

type Fixture = {
  input: string
  find: string
  where?: FindOptions['where']
  expected: {
    node: string
    captures?: Record<string, string>
  }[]
  parser?: string
}

export function formatMatches(
  j: JSCodeshift,
  matches: Match<any>[]
): { node: string; captures?: Record<string, string> }[] {
  function toSource(path: ASTPath<any>): string {
    return j([path]).toSource()
  }
  return matches.map(({ path, pathCaptures }) =>
    pathCaptures
      ? {
          node: toSource(path),
          captures: mapValues(pathCaptures, toSource),
        }
      : { node: toSource(path) }
  )
}

describe(`find`, function() {
  const fixtures = requireGlob.sync(`./fixtures/*${path.extname(__filename)}`)
  for (const key in fixtures) {
    it(path.basename(key).replace(/\.[^.]+$/, ''), function() {
      const { input, find: _find, expected, parser, where } = fixtures[
        key
      ] as Fixture

      let j = jscodeshift
      if (parser) j = j.withParser(parser || 'babylon')
      const root = j(input)

      const astx = new Astx(j, root)

      const matches = astx.find(_find, { where })
      expect(formatMatches(j, matches)).to.deep.equal(expected)
    })
  }
})
