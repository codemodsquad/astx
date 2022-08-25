import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import jscodeshift from 'jscodeshift'
import find, { FindOptions, Match } from '../../src/find'
import replace from '../../src/replace'
import { Node, NodePath } from '../../src/types'
import requireGlob from 'require-glob'
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'
import prettier from 'prettier'
import { ParseTag } from '../../src/jscodeshift/Astx'
import prepareForBabelGenerate from '../../src/util/prepareForBabelGenerate'
import { jsParser, tsParser } from 'babel-parse-wild-code'
import { ParserOptions } from '@babel/parser'
import jscodeshiftBackend from '../../src/jscodeshift/jscodeshiftBackend'
import babelBackend from '../../src/babel/babelBackend'
import generate from '@babel/generator'
import { Backend } from '../../src/Backend'
import createParse from '../../src/createParse'

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
  replace: string | ((match: Match, parse: ParseTag) => string | Node | Node[])
  expectMatchesSelf?: boolean
  expectedFind?: ExpectedMatch[]
  expectedReplace?: string
  parsers?: string[]
  only?: boolean
  skip?: boolean
  expectedError?: string
}

function extractMatchSource(
  matches: Match[],
  source: string,
  backend: Backend
): ExpectedMatch[] {
  function toSource(path: NodePath): string {
    const { node } = path
    const [start, end] = backend.sourceRange(node)
    if (start == null || end == null)
      throw new Error(`failed to get node source range`)
    const { type, astx, typeAnnotation } = node as any
    if (type === 'TSPropertySignature') {
      if (astx?.excludeTypeAnnotationFromCapture && typeAnnotation) {
        return toSource((path as any).get('key'))
      }
      return source.substring(start, end).replace(/,$/, '')
    }
    if (astx?.excludeTypeAnnotationFromCapture && typeAnnotation) {
      return source.substring(start, typeAnnotation.start)
    }
    return source.substring(start, end)
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
      'babel',
      'babel/tsx',
      'recast/babylon',
      'recast/flow',
      'recast/tsx',
      'recast/babylon-babel-generator',
      'recast/tsx-babel-generator',
    ],
  } = testcase

  parsers.sort()

  for (const parser of parsers) {
    if (parser.endsWith('-babel-generator') && !testcase.expectedReplace)
      continue
    const group = groups[parser] || (groups[parser] = {})
    group[key] = testcases[key]
  }
}

for (const parser in groups) {
  const group = groups[parser]

  const findTestcases = pickBy(group, (t) => t.expectedFind || !t.replace)
  const replaceTestcases = pickBy(group, (t) => t.replace)

  const backendName = parser.replace(/\/.+/, '')
  const actualParser =
    parser.replace(/^.+?\//, '').replace('-babel-generator', '') || 'babylon'

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
  const backend =
    backendName === 'recast'
      ? jscodeshiftBackend(j)
      : babelBackend({
          parserOptions: babelParser.parserOpts,
        })
  const prettierOptions = {
    parser:
      parser === 'babel' || actualParser === 'babylon'
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

  const reformat = (code: string) =>
    format(backend.generate(backend.parse(code)).code)

  const { parsePaths, parseNodes } = createParse(backend)

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
                const matches = find([root], parsePaths(input), {
                  ...findOptions,
                  where,
                  backend,
                })
                expect(
                  matches.length,
                  `expected input to match itself: ${input}`
                ).to.equal(1)
              }
              if (expectedFind) {
                const matches = find([root], parsePaths(_find), {
                  ...findOptions,
                  where,
                  backend,
                })
                expect(
                  extractMatchSource(matches, input, backend)
                ).to.deep.equal(expectedFind)
              }
              if (expectedError) {
                expect(() => {
                  find([root], parsePaths(_find), {
                    ...findOptions,
                    where,
                    backend,
                  })
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
            const root = backend.rootPath(backend.parse(input))
            const matches = find([root], parsePaths(_find), {
              ...findOptions,
              where,
              backend,
            })

            if (expectedError) {
              expect(() => {
                if (_replace)
                  replace(
                    matches,
                    typeof _replace === 'string'
                      ? parseNodes(_replace)
                      : (match): Node | Node[] => {
                          const result = _replace(match)
                          return typeof result === 'string'
                            ? parseNodes(result)
                            : result
                        },
                    { backend }
                  )
              }).to.throw(expectedError)
            }
            if (expectedReplace) {
              replace(
                matches,
                typeof _replace === 'string'
                  ? parseNodes(_replace)
                  : (match): Node | Node[] => {
                      const result = _replace(match)
                      return typeof result === 'string'
                        ? parseNodes(result)
                        : result
                    },
                { backend }
              )
              if (parser.endsWith('-babel-generator')) {
                const actualAst = root.node
                prepareForBabelGenerate(actualAst)
                const expectedAst = j(expectedReplace).get().node
                prepareForBabelGenerate(expectedAst)
                expect(
                  format(generate(actualAst, { concise: true }).code)
                ).to.equal(
                  format(generate(expectedAst, { concise: true }).code)
                )
              } else {
                const actual = backend.generate(root.node).code
                expect(format(actual)).to.deep.equal(reformat(expectedReplace))
              }
            }
          }
        )
      }
    })
  })
}
