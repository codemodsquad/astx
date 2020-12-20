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
  parsers?: string[]
  only?: boolean
  skip?: boolean
}

describe(`replace`, function () {
  const fixtures: Record<string, Fixture> = requireGlob.sync(
    `./fixtures/*${path.extname(__filename)}`
  )

  const groups = {}

  for (const key in fixtures) {
    const fixture = fixtures[key]
    const { parsers = ['babylon', 'flow', 'ts'] } = fixture

    for (const parser of parsers) {
      const group = groups[parser] || (groups[parser] = {})
      group[key] = fixtures[key]
    }
  }

  for (const parser in groups) {
    const group = groups[parser]

    describe(`with parser: ${parser}`, function () {
      for (const key in group) {
        const {
          input,
          find: _find,
          replace: _replace,
          expected,
          where,
          only,
          skip,
        } = fixtures[key] as Fixture
        ;(skip ? it.skip : only ? it.only : it)(
          path.basename(key).replace(/\.[^.]+$/, ''),
          function () {
            let j = jscodeshift
            if (parser) j = j.withParser(parser)
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
          }
        )
      }
    })
  }
})
