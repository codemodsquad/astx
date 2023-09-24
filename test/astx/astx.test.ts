import { describe, it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import { Astx, TransformFunction, TransformOptions } from '../../src'
import { NodePath } from '../../src/types'
import requireGlob from 'require-glob'
import { jsParser, tsParser } from 'babel-parse-wild-code'
import { ParserOptions } from '@babel/parser'
import RecastBackend from '../../src/recast/RecastBackend'
import BabelBackend from '../../src/babel/BabelBackend'
import { Backend } from '../../src/backend/Backend'

const projRoot = path.resolve(__dirname, '..', '..')
const testcaseDir = path.relative(
  projRoot,
  path.resolve(__dirname, 'testcases')
)

type Fixture = {
  input: string
  astx: TransformFunction
  expectedReports?: any[]
  expected?: string
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

const testcases = requireGlob.sync(`./testcases/*${path.extname(__filename)}`)

const groups = {}

for (const key in testcases) {
  const testcase = testcases[key]
  const {
    parsers = ['babel', 'babel/tsx', 'recast/babel', 'recast/babel/tsx'],
  } = testcase

  parsers.sort()

  for (const parser of parsers) {
    const group = groups[parser] || (groups[parser] = {})
    group[key] = testcases[key]
  }
}

for (const parser in groups) {
  const group = groups[parser]

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

  describe(`with parser: ${parser}`, function () {
    describe('<astx>', function () {
      for (const key in group) {
        const {
          input,
          astx: transform,
          expected,
          expectedReports,
          expectedError,
          only,
          skip,
        }: Fixture = group[key]

        ;(skip ? it.skip : only ? it.only : it)(
          `${testcaseDir}/${key}.ts`,
          async function () {
            const root = new backend.t.NodePath(backend.parse(input))
            const astx = new Astx({ backend }, [root])
            const reports: any[] = []
            const options: TransformOptions = {
              astx,
              file: './file',
              source: input,
              t: backend.t,
              report: (message) => reports.push(message),
              ...backend.template,
            }
            if (expectedError) {
              await expect(transform(options)).to.be.rejectedWith(expectedError)
            } else {
              let transformed = await transform(options)
              if (transformed !== null) {
                transformed = backend.generate(root.node).code
              }
              if (expected) {
                expect(transformed?.trim()).to.equal(expected?.trim())
              }
              if (expectedReports) {
                expect(reports).to.deep.equal(expectedReports)
              }
            }
          }
        )
      }
    })
  })
}
