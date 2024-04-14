import * as defaultBabelParser from '@babel/parser'
import BabelBackend from 'astx/babel/BabelBackend'

const defaultParserOpts = {}

const parser = {
  parse(code: string, parserOpts?: defaultBabelParser.ParserOptions) {
    return defaultBabelParser.parse(code, {
      ...defaultParserOpts,
      ...parserOpts,
    })
  },
  parseExpression(code: string, parserOpts?: defaultBabelParser.ParserOptions) {
    return defaultBabelParser.parseExpression(code, {
      ...defaultParserOpts,
      ...parserOpts,
    })
  },
}

export const babelBackend = new BabelBackend({
  parser: parser as any,
  preserveFormat: 'generatorHack',
})
