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
import { toPaths, ASTNode } from '../../src/jscodeshift/variant'

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
  expectedFind?: ExpectedMatch[]
  expectedReplace?: string
  parsers?: string[]
  only?: boolean
  skip?: boolean
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

  for (const parserName in groups) {
    const group = groups[parserName]

    describe(`with parser: ${parserName}`, function () {
      const prettierOptions = {
        parser:
          parserName === 'babylon'
            ? 'babel-flow'
            : parserName === 'tsx'
            ? 'babel-ts'
            : parserName,
      }
      const format = (code: string) => prettier.format(code, prettierOptions)

      for (const key in group) {
        const {
          input,
          find: _find,
          findOptions,
          replace: _replace,
          where,
          expectedFind,
          expectedReplace,
          only,
          skip,
        } = testcases[key] as Fixture
        ;(skip ? it.skip : only ? it.only : it)(
          path.basename(key).replace(/\.[^.]+$/, ''),
          function () {
            let j = jscodeshift
            if (parserName) j = j.withParser(parserName)
            const root = j(input)
            const parser = { parse: (src: string) => j(src).nodes()[0] }

            if (expectedFind) {
              const matches = find(
                root.paths(),
                toPaths(
                  parseFindOrReplace(parser, [_find] as any) as
                    | ASTNode
                    | ASTNode[]
                ),
                where ? { ...findOptions, where } : findOptions
              )
              expect(formatMatches(j, matches)).to.deep.equal(expectedFind)
            }
            if (expectedReplace) {
              const astx = new Astx(root.paths(), { parser })
              astx.find(_find, { ...findOptions, where }).replace(_replace)
              const actual = root.toSource()
              expect(format(actual)).to.deep.equal(format(expectedReplace))
            }
          }
        )
      }
    })
  }
})
