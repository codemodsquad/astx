import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift, { ASTPath, JSCodeshift } from 'jscodeshift'
import { FindOptions, Match } from '../../src/find'
import Astx from '../../src/Astx'
import requireGlob from 'require-glob'
import mapValues from 'lodash/mapValues'

type ExpectedMatch = {
  node: string
  captures?: Record<string, string>
  arrayCaptures?: Record<string, string[]>
}

type Fixture = {
  input: string
  find: string
  where?: FindOptions['where']
  expected: ExpectedMatch[]
  parsers?: string[]
  only?: boolean
  skip?: boolean
}

export function formatMatches(
  j: JSCodeshift,
  matches: Match<any>[]
): {
  node: string
  captures?: Record<string, string>
  arrayCaptures?: Record<string, string[]>
}[] {
  function toSource(path: ASTPath<any>): string {
    return j([path]).toSource()
  }
  const result = []
  matches.forEach(({ path, pathCaptures, arrayPathCaptures }) => {
    const match: {
      node: string
      captures?: Record<string, string>
      arrayCaptures?: Record<string, string[]>
    } = { node: toSource(path) }
    if (pathCaptures) match.captures = mapValues(pathCaptures, toSource)
    if (arrayPathCaptures)
      match.arrayCaptures = mapValues(arrayPathCaptures, (paths) =>
        paths.map(toSource)
      )
    result.push(match)
  })
  return result
}

describe(`find`, function () {
  const fixtures = requireGlob.sync(`./fixtures/*${path.extname(__filename)}`)

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
        const { input, find: _find, expected, where, only, skip } = fixtures[
          key
        ] as Fixture
        ;(skip ? it.skip : only ? it.only : it)(
          path.basename(key).replace(/\.[^.]+$/, ''),
          function () {
            let j = jscodeshift
            if (parser) j = j.withParser(parser)
            const root = j(input)

            const astx = new Astx(j, root)

            const matches = astx.find(_find, { where })
            expect(formatMatches(j, matches)).to.deep.equal(expected)
          }
        )
      }
    })
  }
})
