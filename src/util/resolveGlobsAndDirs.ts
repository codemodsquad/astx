import fs from 'fs-extra'
import * as Path from 'path'
import { glob, hasMagic } from 'glob-gitignore'

export default async function resolveGlobsAndDirs(
  args: readonly string[],
  extensions: readonly string[]
): Promise<string[]> {
  const args2: string[] = []

  await Promise.all(
    args.map(async (arg: string) => {
      if (hasMagic(arg)) {
        for (const result of await glob(arg)) args2.push(result)
      } else {
        args2.push(arg)
      }
    })
  )

  const extensionPattern = `*.{${extensions.join(',')}}`
  const results: string[] = []

  await Promise.all(
    args2.map(async (arg: string) => {
      if ((await fs.stat(arg)).isDirectory()) {
        const files = await glob(Path.join(arg, '**', extensionPattern))
        for (const file of files) results.push(file)
      } else {
        results.push(arg)
      }
    })
  )

  return results
}
