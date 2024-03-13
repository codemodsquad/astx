import fs from 'fs-extra'
import Gitignore from 'gitignore-fs'
import path from 'path'
import { Minimatch } from './minimatch'

interface FsEntry {
  name: string
  isDirectory(): boolean
}

export interface Fs {
  readdir(dir: string): Promise<FsEntry[]>
  realpath(path: string): Promise<string>
}

const defaultFs: Fs = {
  async readdir(dir: string): Promise<FsEntry[]> {
    return await fs.readdir(dir, { withFileTypes: true })
  },
  async realpath(path: string): Promise<string> {
    return await fs.realpath(path)
  },
}

type Options = {
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

async function* globDir({
  includeMatcher,
  excludeMatcher,
  gitignore,
  cwd,
  dir,
  fs,
  visited,
  nodir,
  includeDir,
}: {
  includeMatcher?: Minimatch
  excludeMatcher?: Minimatch
  gitignore: Gitignore | null
  cwd: string
  dir: string
  fs: Fs
  visited: Set<string>
  nodir?: boolean
  includeDir?: boolean
}): AsyncIterable<string> {
  const isAbsolute = path.isAbsolute(dir)
  dir = path.resolve(cwd, dir)
  const entries: string[] = []
  if (includeDir) {
    entries.push(dir.replace(/[/\\]?$/, '/'))
  }
  let readdir
  try {
    readdir = (await fs.readdir(dir)).map(
      (entry) => path.join(dir, entry.name) + (entry.isDirectory() ? '/' : '')
    )
  } catch (error: any) {
    if (error.code !== 'ENOTDIR') {
      throw error
    }
    readdir = [dir]
  }
  await Promise.all(
    readdir.map(async (fullpath: string) => {
      if (gitignore && (await gitignore.ignores(fullpath))) return
      const matchpath = isAbsolute ? fullpath : path.relative(cwd, fullpath)
      if (
        (includeMatcher &&
          !includeMatcher.match(matchpath, fullpath.endsWith('/'))) ||
        excludeMatcher?.match(matchpath)
      ) {
        return
      }
      const realpath = await fs.realpath(fullpath)
      if (visited.has(realpath)) return
      visited.add(realpath)
      entries.push(fullpath)
    })
  )
  for (const entry of entries) {
    if (entry.endsWith('/')) {
      if (!nodir) {
        const matchpath = isAbsolute ? entry : path.relative(cwd, entry)
        if (!includeMatcher || includeMatcher.match(matchpath)) {
          yield entry
        }
      }
      for await (const sub of globDir({
        gitignore,
        cwd,
        dir: isAbsolute ? entry : path.relative(cwd, entry),
        fs,
        visited,
        includeMatcher,
        excludeMatcher,
        nodir,
      })) {
        yield sub
      }
    } else {
      yield entry
    }
  }
}

export default async function* glob({
  include,
  exclude,
  dot,
  includeMatcher = include
    ? new Minimatch(include.replace(/\/$/, ''), { dot })
    : undefined,
  excludeMatcher = exclude
    ? new Minimatch(exclude.replace(/\/$/, ''), { dot })
    : undefined,
  gitignore = new Gitignore(),
  cwd = process.cwd(),
  fs = defaultFs,
  visited = new Set(),
  ...rest
}: Options): AsyncIterable<string> {
  const opts = {
    ...rest,
    includeMatcher,
    excludeMatcher,
    gitignore,
    cwd,
    fs,
    visited,
  }
  function* getDirs(): Iterable<string> {
    if (includeMatcher) {
      for (const splitPath of includeMatcher.set) {
        const magicIndex = splitPath.findIndex((e) => typeof e !== 'string')
        yield magicIndex === 0
          ? cwd
          : (magicIndex < 0 ? splitPath : splitPath.slice(0, magicIndex)).join(
              '/'
            )
      }
    } else {
      yield cwd
    }
  }
  for (const dir of getDirs()) {
    for await (const entry of globDir({ ...opts, dir, includeDir: true })) {
      yield entry
    }
  }
}
