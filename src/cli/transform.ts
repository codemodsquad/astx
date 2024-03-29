import { Arguments, Argv, CommandModule } from 'yargs'
import path from 'path'
import chalk from 'chalk'
import formatDiff from '../util/formatDiff'
import lodash from 'lodash'
const { isEmpty, once } = lodash
import inquirer from 'inquirer'
import fs from 'fs-extra'
import dedent from 'dedent-js'
import CodeFrameError from '../util/CodeFrameError'
import { formatIpcMatches } from '../util/formatMatches'
import {
  AstxWorkerPool,
  astxCosmiconfig,
  runTransform,
  Progress,
} from '../node'
import {
  invertIpcError,
  IpcTransformResult,
  makeIpcTransformResult,
} from '../node/ipc'
import { Transform } from '../Astx'
import ansiEscapes from 'ansi-escapes'
import { spinner } from './spinner'
import '../node/registerTsNode'
import isInteractive from '../util/isInteractive'
import { debugConfig } from '../AstxConfig'

/* eslint-disable no-console */

type Options = {
  transform?: string
  parser?: string
  parserOptions?: string
  preferSimpleReplacement?: boolean
  find?: string
  replace?: string
  filesAndDirectories?: string[]
  yes?: boolean
  gitignore?: boolean
  threads?: number
  debugConfig?: boolean
}

const transform: CommandModule<Options> = {
  command: '$0 [filesAndDirectories..]',
  describe: 'apply a transform to the given files and directories',
  builder: (yargs: Argv<Options>) =>
    yargs
      .positional('filesAndDirectories', {
        type: 'string',
        array: true,
      })
      .option('transform', {
        alias: 't',
        describe: `path to the transform file. Can be either a local path or url. Defaults to ./astx.ts or ./astx.js if --find isn't given`,
      })
      .options('parser', {
        describe:
          'parser to use (options: babel, babel/auto, recast/babel, recast/babel/auto)',
        type: 'string',
      })
      .options('parserOptions', {
        describe: 'options for parser',
        type: 'string',
      })
      .option('preferSimpleReplacement', {
        describe:
          'avoid reprinting any code outside of replaced nodes if possible',
        type: 'boolean',
      })
      .option('find', {
        alias: 'f',
        describe: 'search pattern',
        type: 'string',
      })
      .option('replace', {
        alias: 'r',
        describe: 'replace pattern',
        type: 'string',
      })
      .option('yes', {
        alias: 'y',
        describe: `don't ask for confirmation before writing changes`,
        type: 'boolean',
      })
      .option('gitignore', {
        type: 'boolean',
        describe: `ignore gitignored files`,
        default: true,
      })
      .option('workers', {
        type: 'number',
        describe: 'number of worker threads to use',
      })
      .option('debugConfig', {
        type: 'boolean',
        describe: 'print found config and location',
      }),

  handler: async (argv: Arguments<Options>) => {
    const startTime = Date.now()

    const configResult = await astxCosmiconfig.search()
    if (argv.debugConfig) {
      console.log(JSON.stringify(configResult, null, 2))
      process.exit(0)
    }
    const config = configResult?.config

    const paths = (argv.filesAndDirectories || []).filter(
      (x) => typeof x === 'string'
    ) as string[]

    const { transform, transformFile } = await (async (): Promise<{
      transform: Transform
      transformFile?: string
    }> => {
      if (argv.transform) {
        const transformFile = path.resolve(argv.transform)
        return {
          transformFile,
          transform: await import(transformFile),
        }
      } else if (argv.find) {
        const getOpt = (regex: RegExp): string | undefined => {
          const index = process.argv.findIndex((a) => regex.test(a))
          return index >= 0 ? process.argv[index + 1] : undefined
        }
        // yargs Eats quotes, not cool...
        const find = getOpt(/^(-f|--find)$/)
        const replace = getOpt(/^(-r|--replace)$/)
        return { transform: { find, replace } }
      } else {
        const files = [path.resolve('astx.ts'), path.resolve('astx.js')]
        for (const transformFile of files) {
          if (await fs.pathExists(transformFile)) {
            return { transformFile, transform: await import(transformFile) }
          }
        }
        throw new Error(`missing transform file: ${files.join(' or ')}`)
      }
    })()
    const { parser, parserOptions, preferSimpleReplacement, gitignore } = argv

    debugConfig('transform', 'cli overrides', {
      parser,
      parserOptions,
      preferSimpleReplacement,
    })

    const results: Record<string, string> = {}
    let errorCount = 0
    let changedCount = 0
    let unchangedCount = 0

    let progress: Progress = {
      type: 'progress',
      completed: 0,
      total: 0,
      globDone: false,
    }

    let progressDisplayed = false
    function clearProgress() {
      if (progressDisplayed) {
        process.stderr.write(ansiEscapes.cursorLeft + ansiEscapes.eraseLine)
        progressDisplayed = false
      }
    }
    function showProgress() {
      clearProgress()
      progressDisplayed = true
      const { completed, total, globDone } = progress
      process.stderr.write(
        chalk.magenta(
          `${spinner()} Running... ${completed}/${total}${
            globDone && total
              ? ` (${((completed * 100) / total).toFixed(1)}%)`
              : ''
          } ${((Date.now() - startTime) / 1000).toFixed(2)}s`
        )
      )
    }
    let spinnerInterval

    const interactive = isInteractive()
    const workers =
      argv.workers ??
      (process.env.ASTX_WORKERS
        ? parseInt(process.env.ASTX_WORKERS)
        : undefined) ??
      config?.workers
    const pool =
      workers === 0 ? null : new AstxWorkerPool({ capacity: workers })
    try {
      if (interactive) {
        spinnerInterval = setInterval(showProgress, 30)
      }
      const runTransformOptions = {
        gitignore: gitignore ? undefined : null,
        transform,
        transformFile,
        paths,
        config: {
          ...(parser ? { parser: parser as any } : null),
          ...(parserOptions
            ? { parserOptions: JSON.parse(parserOptions) }
            : null),
          ...(preferSimpleReplacement != null
            ? { preferSimpleReplacement }
            : null),
        },
      }
      for await (const _event of pool
        ? pool.runTransform(runTransformOptions)
        : runTransform(runTransformOptions)) {
        const event: { type: 'result'; result: IpcTransformResult } | Progress =
          !pool && _event.type === 'result'
            ? { type: 'result', result: makeIpcTransformResult(_event as any) }
            : (_event as any)
        if (event.type === 'progress') {
          progress = event
          if (interactive) showProgress()
          continue
        }
        clearProgress()
        const {
          file,
          source,
          transformed,
          reports,
          matches,
          error: _error,
        } = event.result
        const error = _error ? invertIpcError(_error) : undefined
        const relpath = path.relative(process.cwd(), file)
        const logHeader = once((logFn: (value: string) => any) =>
          logFn(
            chalk.blue(dedent`
            ${'='.repeat(relpath.length)}
            ${chalk.bold(relpath)}
            ${'='.repeat(relpath.length)}
          `)
          )
        )

        if (error) {
          errorCount++
          logHeader(console.error)
          if (error instanceof CodeFrameError) {
            console.error(
              error.format({
                highlightCode: true,
                forceColor: true,
                stack: true,
              })
            )
          } else {
            console.error(chalk.red(error.stack))
          }
        } else if (source && transformed && source !== transformed) {
          changedCount++
          results[file] = transformed
          if (!argv.yes) {
            logHeader(console.log)
            console.log(formatDiff(source, transformed))
          }
        } else if (
          matches?.length &&
          source &&
          transform.find &&
          !transform.replace &&
          !transform.astx
        ) {
          logHeader(console.log)
          console.log(formatIpcMatches(source, matches))
        } else {
          unchangedCount++
        }

        if (reports?.length && !transform.onReport) {
          logHeader(console.error)
          console.error(
            chalk.blue(dedent`
            Reports
            -------
          `)
          )
          reports?.forEach((r: any) => console.error(r))
        }
      }
    } catch (error) {
      console.error(
        chalk.red(error instanceof Error ? error.stack : String(error))
      )
      process.exit(1)
    } finally {
      if (spinnerInterval != null) clearInterval(spinnerInterval)
      clearProgress()
    }

    if (transform.replace || transform.astx) {
      console.error(
        chalk.yellow(
          `${changedCount} file${changedCount === 1 ? '' : 's'} changed`
        )
      )
      console.error(
        chalk.green(
          `${unchangedCount} file${unchangedCount === 1 ? '' : 's'} unchanged`
        )
      )
      if (errorCount > 0) {
        console.error(
          chalk.red(`${errorCount} file${errorCount === 1 ? '' : 's'} errored`)
        )
      }
    } else if (transform.find) {
      console.error(
        chalk.yellow(
          `\n${unchangedCount} file${
            changedCount === 1 ? '' : 's'
          } had no matches`
        )
      )
    }

    if (!isEmpty(results)) {
      const apply = argv.yes
        ? true
        : (
            await inquirer.prompt([
              {
                type: 'confirm',
                name: 'apply',
                message: 'Apply changes',
                default: false,
              },
            ])
          ).apply
      if (apply) {
        for (const file in results) {
          await fs.writeFile(file, results[file], 'utf8')
          console.error(`Wrote ${file}`)
        }
      }
      if (process.send) process.send({ exit: 0 })
    }
    await pool?.end()
    process.exit(0)
  },
}

export default transform
