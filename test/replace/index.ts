import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift, { ASTNode } from 'jscodeshift'
import replace, { ReplaceOptions } from '../../src/replace'
import requireGlob from 'require-glob'
import { Match } from '../../src/find'
import parseFindOrReplace from '../../src/util/parseFindOrReplace'

type Fixture = {
  input: string
  find: string
  replace: string | ((match: Match<any>) => ASTNode)
  where?: ReplaceOptions['where']
  expected: string
  parser?: string
}

describe(`replace`, function() {
  const fixtures = requireGlob.sync(`./fixtures/*${path.extname(__filename)}`)
  for (const key in fixtures) {
    it(path.basename(key).replace(/\.[^.]+$/, ''), function() {
      const {
        input,
        find: _find,
        replace: _replace,
        expected,
        parser,
        where,
      } = fixtures[key] as Fixture

      let j = jscodeshift
      if (parser) j = j.withParser(parser || 'babylon')
      const root = j(input)

      replace(
        root,
        parseFindOrReplace(j, [_find] as any),
        typeof _replace === 'function'
          ? _replace
          : parseFindOrReplace(j, [_replace] as any),
        { where }
      )
      const actual = root.toSource()
      expect(actual).to.deep.equal(expected)
    })
  }
})
