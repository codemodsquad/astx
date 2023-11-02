import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Astx, TransformFunction, TransformOptions } from '../src'
import { jsParser, tsParser } from 'babel-parse-wild-code'
import { ParserOptions } from '@babel/parser'
import RecastBackend from '../src/recast/RecastBackend'
import BabelBackend from '../src/babel/BabelBackend'
import { Backend } from '../src/backend/Backend'

type Fixture = {
  file: string
  input: string
  astx: TransformFunction
  expectedReports?: any[]
  expected?: string
  expectedError?: string
  parsers?: string[]
  only?: boolean
  skip?: boolean
}

export function astxTestcase(testcase: Fixture): void {
  const {
    file,
    parsers = ['babel', 'babel/tsx', 'recast/babel', 'recast/babel/tsx'],
    input,
    astx: transform,
    expected,
    expectedReports,
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

      ;(skip ? it.skip : only ? it.only : it)(parser, async function () {
        const root = new backend.t.NodePath(backend.parse(input))
        const astx = new Astx(backend, [root])
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
      })
    }
  })
}
