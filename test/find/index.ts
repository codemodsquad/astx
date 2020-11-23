import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift, { ASTPath } from 'jscodeshift'
import find from '../../src/find'
import requireGlob from 'require-glob'
import mapValues from '../../src/util/mapValues'
import parseFindOrReplace from '../../src/util/parseFindOrReplace'

type Fixture = {
  input: string
  find: string
  expected: {
    node: string
    captures?: Record<string, string>
  }[]
  parser?: string
}

describe(`find`, function() {
  const fixtures = requireGlob.sync(`./fixtures/*${path.extname(__filename)}`)
  for (const key in fixtures) {
    it(path.basename(key).replace(/\.[^.]+$/, ''), function() {
      const { input, find: _find, expected, parser } = fixtures[key] as Fixture

      let j = jscodeshift
      if (parser) j = j.withParser(parser || 'babylon')
      const root = j(input)

      function toSource(path: ASTPath<any>): string {
        return j([path]).toSource()
      }

      const matches = find(root, parseFindOrReplace(j, _find))
      const actual = matches.map(({ path, pathCaptures }) =>
        pathCaptures
          ? {
              node: toSource(path),
              captures: mapValues(pathCaptures, toSource),
            }
          : { node: toSource(path) }
      )
      expect(actual).to.deep.equal(expected)
    })
  }
})
