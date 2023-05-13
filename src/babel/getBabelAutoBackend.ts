import path from 'path'
import _resolve from 'resolve'
import BabelBackend from './BabelBackend'
import defaultBabelTypes from '@babel/types'
import defaultBabelGenerator from '@babel/generator'
import { getParserAsync } from 'babel-parse-wild-code'
import { promisify } from 'util'

const resolve: (
  id: string,
  opts: _resolve.AsyncOpts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<string> = promisify(_resolve as any)

async function importLocal<T>(pkg: string, basedir: string): Promise<T> {
  const resolved = await resolve(pkg, {
    basedir,
  })
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return await import(/* webpackIgnore: true */ resolved)
}

export default async function getBabelAutoBackend(
  file: string,
  { preserveFormat, ...options }: { [k in string]?: any } = {}
): Promise<BabelBackend> {
  const basedir = path.dirname(file)
  const [_parser, types, generator] = await Promise.all([
    getParserAsync(file, options),
    importLocal('@babel/types', basedir).catch(() => defaultBabelTypes),
    importLocal('@babel/generator', basedir).catch(() => defaultBabelGenerator),
  ])
  const parser = (
    _parser.parserOpts.sourceType
      ? _parser
      : _parser.bindParserOpts({ sourceType: 'unambiguous' })
  ).forExtension(file)
  return new BabelBackend({
    parser,
    parserOptions: options,
    preserveFormat,
    generator: generator as any,
    types: types as any,
  })
}
