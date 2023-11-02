import { describe, it } from 'mocha'
import { expect } from 'chai'
import { jsParser, tsParser } from 'babel-parse-wild-code'
import { ParserOptions } from '@babel/parser'
import RecastBackend from '../src/recast/RecastBackend'
import BabelBackend from '../src/babel/BabelBackend'
import { Backend } from '../src/backend/Backend'
import { extractSource } from './extractSource'

type Fixture = {
  file: string
  input: string
  expected: string
  expectedError?: string
  parsers?: string[]
  only?: boolean
  skip?: boolean
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
