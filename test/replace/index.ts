import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift, { ASTNode } from 'jscodeshift'
import replace from '../../src/replace'
import requireGlob from 'require-glob'
import { Match } from '../../src/find'
import parseFindOrReplace from '../../src/util/parseFindOrReplace'

type Fixture = {
  input: string
  find: string
  replace: string | ((match: Match<any>) => ASTNode)
  expected: string
  parser?: string
}

describe(`find`, function() {
  const fixtures = requireGlob.sync(`./fixtures/*${path.extname(__filename)}`)
  for (const key in fixtures) {
    it(path.basename(key).replace(/\.[^.]+$/, ''), function() {
      const {
        input,
        find: _find,
        replace: _replace,
        expected,
        parser,
      } = fixtures[key] as Fixture

      let j = jscodeshift
      if (parser) j = j.withParser(parser || 'babylon')
      const root = j(input)

      replace(
        root,
        parseFindOrReplace(j, _find),
        typeof _replace === 'function'
          ? _replace
          : parseFindOrReplace(j, _replace)
      )
      const actual = root.toSource()
      expect(actual).to.deep.equal(expected)
    })
  }
})
