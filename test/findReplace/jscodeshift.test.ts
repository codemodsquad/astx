import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift, { ASTPath, JSCodeshift } from 'jscodeshift'
import find, { FindOptions, Match } from '../../src/jscodeshift/find'
import requireGlob from 'require-glob'
import mapValues from 'lodash/mapValues'
import prettier from 'prettier'
import parseFindOrReplace from '../../src/jscodeshift/util/parseFindOrReplace'
import Astx, { GetReplacement } from '../../src/jscodeshift/Astx'

type ExpectedMatch = {
  node?: string
  nodes?: string[]
  captures?: Record<string, string>
  arrayCaptures?: Record<string, string[]>
  stringCaptures?: Record<string, string>
}

type Fixture = {
  input: string
  find: string
  findOptions?: FindOptions
  where?: FindOptions['where']
  replace: string | GetReplacement
  expectMatchesSelf?: boolean
  expectedFind?: ExpectedMatch[]
  expectedReplace?: string
  parsers?: string[]
  only?: boolean
  skip?: boolean
  expectedError?: string
}

export function formatMatches(
  j: JSCodeshift,
  matches: Match[]
): ExpectedMatch[] {
  function toSource(path: ASTPath<any>): string {
    return j([path]).toSource().replace(/,$/, '')
  }
  const result = []
  matches.forEach((_match: Match) => {
    const { type, pathCaptures, arrayPathCaptures, stringCaptures } = _match
    const { path, paths }: { path?: ASTPath; paths?: ASTPath[] } = _match as any
    const match: ExpectedMatch = {}
    if (type === 'node') match.node = toSource(path)
    if (type === 'nodes') match.nodes = paths.map(toSource)
    if (pathCaptures) match.captures = mapValues(pathCaptures, toSource)
    if (arrayPathCaptures)
      match.arrayCaptures = mapValues(arrayPathCaptures, (paths) =>
        paths.map(toSource)
      )
    if (stringCaptures) match.stringCaptures = stringCaptures
    result.push(match)
  })
  return result
}

describe(`find`, function () {
  const testcases = requireGlob.sync(`./testcases/*${path.extname(__filename)}`)

  const groups = {}

  for (const key in testcases) {
    const testcase = testcases[key]
    const { parsers = ['babylon', 'flow', 'tsx'] } = testcase

    for (const parser of parsers) {
      const group = groups[parser] || (groups[parser] = {})
      group[key] = testcases[key]
    }
  }

  for (const parser in groups) {
    const group = groups[parser]

    describe(`with parser: ${parser}`, function () {
      const prettierOptions = {
        parser:
          parser === 'babylon'
            ? 'babel-flow'
            : parser === 'tsx'
            ? 'babel-ts'
            : parser,
      }
      const format = (code: string) =>
        prettier.format(code, prettierOptions).trim()

      for (const key in group) {
        const {
          input,
          find: _find,
          findOptions,
          replace: _replace,
          where,
          expectMatchesSelf,
          expectedFind,
          expectedReplace,
          expectedError,
          only,
          skip,
        } = testcases[key] as Fixture
        ;(skip ? it.skip : only ? it.only : it)(
          path.basename(key).replace(/\.[^.]+$/, ''),
          function () {
            let j = jscodeshift
            if (parser) j = j.withParser(parser)
            const root = j(input)

            if (
              !expectMatchesSelf &&
              !expectedFind &&
              !expectedReplace &&
              !expectedError
            ) {
              throw new Error(
                `at least one must be exported: expectMatchesSelf, expectedFind, expectedReplace, expectedError`
              )
            }

            if (expectMatchesSelf) {
              const astx = new Astx(j, root.paths())
              const matches = astx.find(input)
              expect(
                matches.length,
                `expected input to match itself: ${input}`
              ).to.equal(1)
            }
            if (expectedFind) {
              const matches = find(
                root.paths(),
                j(parseFindOrReplace(j, [_find] as any)).paths(),
                where ? { ...findOptions, where } : findOptions
              )
              expect(formatMatches(j, matches)).to.deep.equal(expectedFind)
            }
            if (expectedReplace) {
              const astx = new Astx(j, root.paths())
              astx.find(_find, { ...findOptions, where }).replace(_replace)
              const actual = root.toSource()
              expect(format(actual)).to.deep.equal(format(expectedReplace))
            }
            if (expectedError) {
              expect(() => {
                const astx = new Astx(j, root.paths())
                const matches = astx.find(_find, { ...findOptions, where })
                if (_replace) matches.replace(_replace)
              }).to.throw(expectedError)
            }
          }
        )
      }
    })
  }
})
