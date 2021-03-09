import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift, { ASTNode, ASTPath, JSCodeshift } from 'jscodeshift'
import find, { FindOptions, Match, StatementsMatch } from '../../src/find'
import requireGlob from 'require-glob'
import mapValues from 'lodash/mapValues'
import prettier from 'prettier'
import replace, { ReplaceOptions } from '../../src/replace'
import parseFindOrReplace from '../../src/util/parseFindOrReplace'

type ExpectedMatch = {
  node?: string
  nodes?: string[]
  captures?: Record<string, string>
  arrayCaptures?: Record<string, string[]>
}

type Fixture = {
  input: string
  find: string
  findOptions?: FindOptions
  replace: string | ((match: Match<any>) => ASTNode)
  replaceOptions?: ReplaceOptions
  expectedFind?: ExpectedMatch[]
  expectedReplace?: string
  parsers?: string[]
  only?: boolean
  skip?: boolean
}

export function formatMatches(
  j: JSCodeshift,
  matches: Match<any>[] | StatementsMatch[]
): ExpectedMatch[] {
  function toSource(path: ASTPath<any>): string {
    return j([path]).toSource().replace(/,$/, '')
  }
  const result = []
  matches.forEach((_match: Match<any> | StatementsMatch) => {
    const { pathCaptures, arrayPathCaptures } = _match
    const { path, paths }: { path?: ASTPath; paths?: ASTPath[] } = _match as any
    const match: ExpectedMatch = {}
    if (path) match.node = toSource(path)
    if (paths) match.nodes = paths.map(toSource)
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
    const { parsers = ['babylon', 'flow', 'tsx'] } = fixture

    for (const parser of parsers) {
      const group = groups[parser] || (groups[parser] = {})
      group[key] = fixtures[key]
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
      const format = (code: string) => prettier.format(code, prettierOptions)

      for (const key in group) {
        const {
          input,
          find: _find,
          findOptions,
          replace: _replace,
          replaceOptions,
          expectedFind,
          expectedReplace,
          only,
          skip,
        } = fixtures[key] as Fixture
        ;(skip ? it.skip : only ? it.only : it)(
          path.basename(key).replace(/\.[^.]+$/, ''),
          function () {
            let j = jscodeshift
            if (parser) j = j.withParser(parser)
            const root = j(input)

            if (expectedFind) {
              const matches = find(
                root,
                parseFindOrReplace(j, [_find] as any) as any,
                findOptions
              )
              expect(formatMatches(j, matches)).to.deep.equal(expectedFind)
            }
            if (expectedReplace) {
              replace(
                root,
                parseFindOrReplace(j, [_find] as any) as any,
                typeof _replace === 'function'
                  ? _replace
                  : (parseFindOrReplace(j, [_replace] as any) as any),
                replaceOptions
              )
              const actual = root.toSource()
              expect(format(actual)).to.deep.equal(format(expectedReplace))
            }
          }
        )
      }
    })
  }
})
