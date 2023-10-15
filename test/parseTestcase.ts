import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Node, NodePath } from '../src/types'
import { jsParser, tsParser } from 'babel-parse-wild-code'
import { ParserOptions } from '@babel/parser'
import RecastBackend from '../src/recast/RecastBackend'
import BabelBackend from '../src/babel/BabelBackend'
import { Backend } from '../src/backend/Backend'

type Fixture = {
  file: string
  input: string
  expected: string
  expectedError?: string
  parsers?: string[]
  only?: boolean
  skip?: boolean
}

export function extractSource(
  path: NodePath<Node, any>,
  source: string,
  backend: Backend
): string
export function extractSource(
  path: NodePath<Node, any>[],
  source: string,
  backend: Backend
): string[]
export function extractSource(
  path: NodePath<Node, any> | NodePath<Node, any>[],
  source: string,
  backend: Backend
): string | string[] {
  if (Array.isArray(path))
    return path.map((p) => extractSource(p, source, backend))
  const { node } = path
  const { start, end } = backend.location(node)
  if (start == null || end == null)
    throw new Error(`failed to get node source range`)
  const { type, astx, typeAnnotation } = node as any

  if (astx?.excludeTypeAnnotationFromCapture && typeAnnotation) {
    const { start: typeAnnotationStart } = backend.location(typeAnnotation)
    if (typeAnnotationStart != null && Number.isFinite(typeAnnotationStart)) {
      return source.substring(start, typeAnnotationStart)
    }
  }
  if (type === 'TSPropertySignature' || type === 'TSMethodSignature') {
    if (astx?.excludeTypeAnnotationFromCapture && typeAnnotation) {
      return extractSource((path as any).get('key'), source, backend)
    }
    return source.substring(start, end).replace(/[,;]$/, '')
  }

  return source.substring(start, end)
}

export function parseTestcase(testcase: Fixture): void {
  const {
    file,
    parsers = ['babel', 'babel/tsx', 'recast/babel', 'recast/babel/tsx'],
    input,
    expected,
    expectedError,
    only,
    skip,
  } = testcase

  describe(file, function () {
    for (const parser of parsers) {
      const backendName = parser.replace(/\/.+/, '')
      const actualParser = parser.replace(/^recast\//, '')

      const parserOpts: ParserOptions = {
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        allowUndeclaredExports: true,
        tokens: backendName === 'recast',
        plugins: ['jsx', 'topLevelAwait'],
      }
      const babelParser =
        actualParser === 'babel/tsx'
          ? tsParser.bindParserOpts(parserOpts)
          : jsParser.bindParserOpts(parserOpts)
      const babelBackend = new BabelBackend({
        parserOptions: babelParser.parserOpts,
      })
      const backend: Backend =
        backendName === 'recast'
          ? new RecastBackend({
              wrapped: babelBackend,
            })
          : babelBackend

      ;(skip ? it.skip : only ? it.only : it)(`<parse> ${parser}`, function () {
        if (expected) {
          expect(
            extractSource(backend.parsePattern(input) as any, input, backend)
          ).to.deep.equal(expected)
        }
        if (expectedError) {
          expect(() => backend.parsePattern(input)).to.throw(expectedError)
        }
      })
    }
  })
}
