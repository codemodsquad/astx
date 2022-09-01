import path from 'path'
import _resolve from 'resolve'
import BabelBackend from './BabelBackend'
import { getParserAsync } from 'babel-parse-wild-code'
import { promisify } from 'util'

const resolve: (
  id: string,
  opts: _resolve.AsyncOpts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<string> = promisify(_resolve as any)

async function importLocal<T>(pkg: string, basedir: string): Promise<T> {
  try {
    const generatorPath = await resolve(pkg, {
      basedir,
    })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return await import(generatorPath)
  } catch (error) {
    return await import(pkg)
  }
}

export default async function getBabelBackend(
  file: string,
  options?: { [k in string]?: any }
): Promise<BabelBackend> {
  const basedir = path.dirname(file)
  const [parser, types, { default: generate }]: any = await Promise.all([
    getParserAsync(file, options),
    importLocal('@babel/types', basedir),
    importLocal('@babel/generator', basedir),
  ])
  return new BabelBackend({
    parser,
    parserOptions: options,
    generate,
    types,
  })
}
