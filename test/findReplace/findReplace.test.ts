import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift from 'jscodeshift'
import find, { FindOptions, Match } from '../../src/find'
import parseFindOrReplace from '../../src/parseFindOrReplace'
import { NodePath } from '../../src/types'
import requireGlob from 'require-glob'
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'
import prettier from 'prettier'
import Astx, { GetReplacement } from '../../src/jscodeshift/Astx'
import prepareForBabelGenerate from '../../src/util/prepareForBabelGenerate'
import { jsParser, tsParser } from 'babel-parse-wild-code'
import { ParserOptions } from '@babel/parser'
import babelBackend from '../../src/babel/babelBackend'
import generate from '@babel/generator'
import { Backend } from '../../src/Backend'

const projRoot = path.resolve(__dirname, '..', '..')
const testcaseDir = path.relative(
  projRoot,
  path.resolve(__dirname, 'testcases')
)

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

export function formatExpectedMatches(
  matches: ExpectedMatch[],
  backend: Backend
): ExpectedMatch[] {
  function reformat(code: string): string {
    const paths = parseFindOrReplace(backend, [code])
    return Array.isArray(paths)
      ? paths.map((p) => backend.generate(p.node).code).join('\n')
      : backend.generate(paths.node).code
  }
  const result: ExpectedMatch[] = []
  matches.forEach(
    ({
      node,
      nodes,
      captures,
      arrayCaptures,
      stringCaptures,
    }: ExpectedMatch) => {
      const match: ExpectedMatch = {}
      if (node) match.node = reformat(node)
      if (nodes) match.nodes = nodes.map(reformat)
      if (captures) match.captures = mapValues(captures, reformat)
      if (arrayCaptures)
        match.arrayCaptures = mapValues(arrayCaptures, (c) => c.map(reformat))
      if (stringCaptures) match.stringCaptures = stringCaptures
      result.push(match)
    }
  )
  return result
}

export function formatMatches(
  matches: Match[],
  backend: Backend
): ExpectedMatch[] {
  function toSource(path: NodePath): string {
    let { node } = path
    if (node.type === 'ExpressionStatement') node = node.expression
    return backend.generate(node).code
  }
  const result: ExpectedMatch[] = []
  matches.forEach((_match: Match) => {
    const { type, pathCaptures, arrayPathCaptures, stringCaptures } = _match
    const {
      path,
      paths,
    }: { path?: NodePath; paths?: NodePath[] } = _match as any
    const match: ExpectedMatch = {}
    if (type === 'node' && path) match.node = toSource(path)
    if (type === 'nodes' && paths) match.nodes = paths.map(toSource)
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

const testcases = requireGlob.sync(`./testcases/*${path.extname(__filename)}`)

const groups = {}

for (const key in testcases) {
  const testcase = testcases[key]
  const {
    parsers = [
      'babylon',
      'flow',
      'tsx',
      'babylon-babel-generator',
      'tsx-babel-generator',
    ],
  } = testcase

  for (const parser of parsers) {
    if (parser.endsWith('-babel-generator') && !testcase.expectedReplace)
      continue
    const group = groups[parser] || (groups[parser] = {})
    group[key] = testcases[key]
  }
}

for (const parser in groups) {
  const group = groups[parser]

  const findTestcases = pickBy(group, (t) => !t.replace)
  const replaceTestcases = pickBy(group, (t) => t.replace)

  const actualParser = parser.replace('-babel-generator', '')

  const parserOpts: ParserOptions = {
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    allowUndeclaredExports: true,
    tokens: true,
    plugins: ['jsx', 'topLevelAwait'],
  }
  const babelParser = actualParser.startsWith('ts')
    ? tsParser.bindParserOpts(parserOpts)
    : jsParser.bindParserOpts(parserOpts)
  const j = jscodeshift.withParser(babelParser)
  // const backend = jscodeshiftBackend(j)
  const backend = babelBackend({
    parserOptions: babelParser.parserOpts,
  })
  const prettierOptions = {
    parser:
      actualParser === 'babylon'
        ? 'babel-flow'
        : actualParser === 'tsx'
        ? 'babel-ts'
        : actualParser,
  }

  const format = (code: string) =>
    prettier
      .format(code, prettierOptions)
      .trim()
      .replace(/\n{2,}/gm, '\n')

  describe(`with parser: ${parser}`, function () {
    if (!parser.endsWith('-babel-generator')) {
      describe('<find>', function () {
        for (const key in findTestcases) {
          const {
            input,
            find: _find,
            findOptions,
            where,
            expectMatchesSelf,
            expectedFind,
            expectedError,
            only,
            skip,
          }: Fixture = findTestcases[key]

          ;(skip ? it.skip : only ? it.only : it)(
            `${testcaseDir}/${key}.ts`,
            function () {
              const root = backend.rootPath(backend.parse(input))

              if (expectMatchesSelf) {
                const matches = find(
                  [root],
                  parseFindOrReplace(backend, [input] as any),
                  { ...findOptions, where, backend }
                )
                expect(
                  matches.length,
                  `expected input to match itself: ${input}`
                ).to.equal(1)
              }
              if (expectedFind) {
                const matches = find(
                  [root],
                  parseFindOrReplace(backend, [_find] as any),
                  { ...findOptions, where, backend }
                )
                expect(formatMatches(matches, backend)).to.deep.equal(
                  formatExpectedMatches(expectedFind, backend)
                )
              }
              if (expectedError) {
                expect(() => {
                  const astx = new Astx(j, j(input).paths())
                  astx.find(_find, { ...findOptions, where })
                }).to.throw(expectedError)
              }
            }
          )
        }
      })
    }
    describe(`<replace>`, function () {
      for (const key in replaceTestcases) {
        const {
          input,
          find: _find,
          replace: _replace,
          findOptions,
          where,
          expectedReplace,
          expectedError,
          only,
          skip,
        }: Fixture = replaceTestcases[key]

        ;(skip ? it.skip : only ? it.only : it)(
          `${testcaseDir}/${key}.ts`,
          function () {
            if (expectedError) {
              expect(() => {
                const astx = new Astx(j, j(input).paths())
                const matches = astx.find(_find, { ...findOptions, where })
                if (_replace) matches.replace(_replace)
              }).to.throw(expectedError)
            }
            if (expectedReplace) {
              const root = j(input)
              const astx = new Astx(j, root.paths())
              astx.find(_find, { ...findOptions, where }).replace(_replace)
              if (parser.endsWith('-babel-generator')) {
                const actualAst = root.get().node
                prepareForBabelGenerate(actualAst)
                const expectedAst = j(expectedReplace).get().node
                prepareForBabelGenerate(expectedAst)
                expect(
                  format(generate(actualAst, { concise: true }).code)
                ).to.equal(
                  format(generate(expectedAst, { concise: true }).code)
                )
              } else {
                const actual = backend.generate(root.get().node).code
                expect(format(actual)).to.deep.equal(format(expectedReplace))
              }
            }
          }
        )
      }
    })
  })
}
