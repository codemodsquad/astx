import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import find, { FindOptions, Match } from '../../src/find'
import replace from '../../src/replace'
import { Node, NodePath } from '../../src/types'
import requireGlob from 'require-glob'
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'
import prettier from 'prettier'
import prepareForBabelGenerate from '../../src/util/prepareForBabelGenerate'
import { jsParser, tsParser } from 'babel-parse-wild-code'
import { ParserOptions } from '@babel/parser'
import RecastBackend from '../../src/recast/RecastBackend'
import BabelBackend from '../../src/babel/BabelBackend'
import generate from '@babel/generator'
import { Backend } from '../../src/backend/Backend'
import flowParser from 'flow-parser'
const flowParserOptions = {
  enums: true,
  esproposal_class_instance_fields: true,
  esproposal_class_static_fields: true,
  esproposal_decorators: true,
  esproposal_export_star_as: true,
  esproposal_optional_chaining: true,
  esproposal_nullish_coalescing: true,
  tokens: true,
  types: true,
}

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

type ParseNodes = (
  strings: string | string[] | TemplateStringsArray,
  ...quasis: any[]
) => Node | Node[]

type Fixture = {
  input: string
  find: string
  findOptions?: FindOptions
  where?: FindOptions['where']
  replace:
    | string
    | ((match: Match, parse: ParseNodes) => string | Node | Node[])
  expectMatchesSelf?: boolean
  expectedFind?: ExpectedMatch[]
  expectedReplace?: string
  parsers?: string[]
  only?: boolean
  skip?: boolean
  expectedError?: string
}

export function extractMatchSource(
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
    if (type === 'TSPropertySignature' || type === 'TSMethodSignature') {
      if (astx?.excludeTypeAnnotationFromCapture && typeAnnotation) {
        return toSource((path as any).get('key'))
      }
      return source.substring(start, end).replace(/[,;]$/, '')
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
      'recast/babel',
      'recast/flow',
      'recast/tsx',
      'recast/babel-generator',
      'recast/tsx-babel-generator',
    ],
  } = testcase

  parsers.sort()

  for (const parser of parsers) {
    if (parser.endsWith('babel-generator') && !testcase.expectedReplace)
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
    parser.replace(/^.+?\//, '').replace(/-?babel-generator$/, '') || 'babel'

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
  const backend: Backend =
    backendName === 'recast'
      ? new RecastBackend({
          parseOptions: {
            parser:
              actualParser === 'flow'
                ? {
                    parse: (code: string) =>
                      flowParser.parse(code, flowParserOptions),
                  }
                : babelParser,
          },
        })
      : new BabelBackend({ parserOptions: babelParser.parserOpts })
  const prettierOptions = {
    parser: actualParser.startsWith('ts') ? 'babel-ts' : 'babel-flow',
  }

  const format = (code: string) =>
    prettier
      .format(code, prettierOptions)
      .trim()
      .replace(/\n{2,}/gm, '\n')

  const reformat = (code: string) =>
    format(backend.generate(backend.parse(code)).code)

  ;(parser === 'recast/flow' ? describe.skip : describe)(
    `with parser: ${parser}`,
    function () {
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
                const ast = backend.parse(input)
                const root = backend.makePath(ast)

                if (expectMatchesSelf) {
                  const matches = find(root, backend.parsePattern(input), {
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
                  const matches = find(root, backend.parsePattern(_find), {
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
                    find(root, backend.parsePattern(_find), {
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
              const ast = backend.parse(input)
              const root = backend.makePath(ast)
              const matches = find(root, backend.parsePattern(_find), {
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
                        ? backend.parsePatternToNodes(_replace)
                        : (match): Node | Node[] => {
                            const result = _replace(
                              match,
                              backend.parsePatternToNodes
                            )
                            return typeof result === 'string'
                              ? backend.parsePatternToNodes(result)
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
                    ? backend.parsePatternToNodes(_replace)
                    : (match): Node | Node[] => {
                        const result = _replace(
                          match,
                          backend.parsePatternToNodes
                        )
                        return typeof result === 'string'
                          ? backend.parsePatternToNodes(result)
                          : result
                      },
                  { backend }
                )
                if (parser.endsWith('-babel-generator')) {
                  prepareForBabelGenerate(ast)
                  const expectedAst = backend.parse(expectedReplace)
                  prepareForBabelGenerate(expectedAst)
                  expect(
                    format(generate(ast, { concise: true }).code)
                  ).to.equal(
                    format(generate(expectedAst, { concise: true }).code)
                  )
                } else {
                  const actual = backend.generate(ast).code
                  expect(format(actual)).to.deep.equal(
                    reformat(expectedReplace)
                  )
                }
              }
            }
          )
        }
      })
    }
  )
}
