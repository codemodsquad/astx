import { describe, it } from 'mocha'
import { expect } from 'chai'
import find, { FindOptions, Match } from '../src/find'
import { replaceAll } from '../src/replace'
import { Node, NodePath, getAstxMatchInfo } from '../src/types'
import mapValues from 'lodash/mapValues'
import prettier from 'prettier'
import { jsParser, tsParser } from 'babel-parse-wild-code'
import { ParserOptions } from '@babel/parser'
import RecastBackend from '../src/recast/RecastBackend'
import BabelBackend from '../src/babel/BabelBackend'
import { Backend } from '../src/backend/Backend'

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
  file: string
  input: string
  find: string
  findOptions?: FindOptions
  where?: FindOptions['where']
  replace?:
    | string
    | ((match: Match, parse: ParseNodes) => string | Node | Node[])
  expectMatchesSelf?: boolean
  expectedFind?: ExpectedMatch[]
  expectedReplace?: string | ((parser: string) => string)
  parsers?: string[]
  skip?: boolean
  expectedError?: string
}

export function extractMatchSource(
  matches: readonly Match[],
  source: string,
  backend: Backend
): ExpectedMatch[] {
  function toSource(path: NodePath): string {
    const { node } = path
    const { start, end } = backend.location(node)
    if (start == null || end == null)
      throw new Error(`failed to get node source range`)
    // const { typeAnnotation } = node as any
    const astx = getAstxMatchInfo(node)
    if (astx?.subcapture) {
      return backend.generate(astx.subcapture).code
    }

    if (
      node.type === 'TSPropertySignature' ||
      node.type === 'TSMethodSignature'
    ) {
      return source.substring(start, end).replace(/[,;]$/, '')
    }

    return source.substring(start, end)
  }
  const result: ExpectedMatch[] = []
  matches.forEach((_match: Match) => {
    const { type, pathCaptures, arrayPathCaptures, stringCaptures } = _match
    const { path, paths }: { path?: NodePath; paths?: NodePath[] } =
      _match as any
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
    const { path, paths }: { path?: NodePath; paths?: NodePath[] } =
      _match as any
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

export function findReplaceTestcase(fixture: Fixture): void {
  const {
    parsers = ['babel', 'babel/tsx', 'recast/babel', 'recast/babel/tsx'],
    input,
    file,
    find: _find,
    findOptions,
    where,
    expectMatchesSelf,
    expectedFind,
    replace: _replace,
    expectedReplace,
    expectedError,
    skip,
  } = fixture

  ;(skip ? describe.skip : describe)(file, function () {
    for (const parser of parsers) {
      const backendName = parser.replace(/\/.+/, '')
      const actualParser = parser.replace(/^recast\//, '')

      const parserOpts: ParserOptions = {
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        allowUndeclaredExports: true,
        tokens: backendName === 'recast',
        plugins: [
          'jsx',
          'topLevelAwait',
          'exportDefaultFrom',
          'exportNamespaceFrom',
        ],
      }
      const babelParser =
        actualParser === 'babel/tsx'
          ? tsParser.bindParserOpts(parserOpts)
          : jsParser.bindParserOpts(parserOpts)
      const babelBackend = new BabelBackend({
        parserOptions: babelParser.parserOpts,
        preserveFormat: 'generatorHack',
      })
      const backend: Backend =
        backendName === 'recast'
          ? new RecastBackend({
              wrapped: babelBackend,
            })
          : babelBackend
      const prettierOptions = {
        parser: actualParser === 'babel/tsx' ? 'babel-ts' : 'babel-flow',
      }

      const format = (code: string) =>
        prettier
          .format(code, prettierOptions)
          .trim()
          .replace(/\n{2,}/gm, '\n')

      const reformat = (code: string) =>
        format(backend.generate(backend.parse(code)).code)

      if (expectedFind || !_replace) {
        it(`<find>    ${parser}`, function () {
          const ast = backend.parse(input)
          const root = new backend.t.NodePath(ast)

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
            expect(extractMatchSource(matches, input, backend)).to.deep.equal(
              expectedFind
            )
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
        })
      }
      if (_replace) {
        it(`<replace> ${parser}`, function () {
          const ast = backend.parse(input)
          const root = new backend.t.NodePath(ast)
          const matches = find(root, backend.parsePattern(_find), {
            ...findOptions,
            where,
            backend,
          })

          if (expectedError && _replace) {
            expect(() => {
              replaceAll(
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
            const expected =
              typeof expectedReplace === 'function'
                ? expectedReplace(parser)
                : expectedReplace
            replaceAll(
              matches,
              typeof _replace === 'string'
                ? backend.parsePatternToNodes(_replace)
                : (match): Node | Node[] => {
                    const result = _replace(match, backend.parsePatternToNodes)
                    return typeof result === 'string'
                      ? backend.parsePatternToNodes(result)
                      : result
                  },
              { backend }
            )
            const actual = backend.generate(ast).code
            expect(reformat(format(actual))).to.deep.equal(reformat(expected))
          }
        })
      }
    }
  })
}
