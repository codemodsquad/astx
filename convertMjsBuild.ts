import { TransformOptions } from './src'
import fs from 'fs-extra'
import path from 'path'

async function isDirectory(path: string) {
  try {
    return (await fs.stat(path)).isDirectory()
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

export async function astx({ astx, file }: TransformOptions): Promise<void> {
  const { statement, statements } = astx.backend.template

  if (astx.find`__filename`().size) {
    astx.paths[0]
      .get('program')
      .get('body')
      .get(0)
      .insertBefore(
        ...statements`
        import { fileURLToPath } from 'url'
        const __filename = fileURLToPath(import.meta.url)
      `
      )
  }
  astx.find`import { Minimatch, $$$rest } from 'minimatch'`().replace`
    import { $$$rest } from 'minimatch'
    import __minimatch from 'minimatch'
    const { Minimatch } = __minimatch
  `()

  astx.find`import { $$imports } from 'lodash/fp'`().replace(({ $$imports }) =>
    $$imports.map(
      (imp) => statement`import ${imp.code} from 'lodash/fp/${imp.code}'`
    )
  )

  async function resolve(source: string): Promise<string> {
    if (source.startsWith('lodash') && !source.startsWith('lodash/fp'))
      return source.replace(/^lodash/, 'lodash-es')
    if (!source.startsWith('.')) {
      if (/(ast-types|lodash)\//.test(source)) {
        return require.resolve(source).replace(/(.*)\/node_modules\//, '')
      }
      return source
    }
    if (await isDirectory(path.resolve(path.dirname(file), source))) {
      return `${source}/index.mjs`
    }
    return source.replace(/(\.[cm]?js)?$/, '.mjs')
  }

  for (const pattern of [
    `import { $$imports } from '$source'`,
    `import '$source'`,
    `import('$source')`,
    `export { $$exports } from '$source'`,
  ]) {
    for (const match of astx.find(pattern)) {
      const { $source } = match
      const source = $source.stringValue
      const resolved = await resolve(source)
      if (resolved !== source)
        match.replace(pattern.replace(/\$source/, resolved))
    }
  }

  astx.find`new Worker(require.resolve('$source'))`().replace(
    ({ $source }) =>
      `new Worker(new URL('${$source.stringValue.replace(
        /\.babel\.js$/,
        '.mjs'
      )}', import.meta.url))`
  )
}
