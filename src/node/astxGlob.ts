import defaultFs from 'fs-extra'
import Gitignore from 'gitignore-fs'
import { Minimatch } from 'minimatch'
import path from 'path'
import glob from './glob'

type Fs = typeof defaultFs

export type AstxGlobOptions = {
  include?: string
  exclude?: string
  includeMatcher?: Minimatch
  excludeMatcher?: Minimatch
  gitignore?: Gitignore | null
  cwd?: string
  fs?: Fs
  visited?: Set<string>
  nodir?: boolean
  dot?: boolean
}

const exts = [
  'js',
  'jsx',
  'flow',
  'ts',
  'tsx',
  'cjs',
  'mjs',
  'esm',
  'mts',
  'cts',
]

export default async function* astxGlob(
  options: AstxGlobOptions
): AsyncIterable<string> {
  for await (const entry of glob(options)) {
    if (entry.endsWith('/')) {
      for await (const file of glob({
        ...options,
        nodir: true,
        includeMatcher: undefined,
        include: path.join(entry, '**', `*.{${exts.join(',')}}`),
      })) {
        yield file
      }
    } else {
      yield entry
    }
  }
}
