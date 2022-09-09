import yargs, { Arguments, Argv, CommandModule } from 'yargs'
import path from 'path'
import chalk from 'chalk'
import formatDiff from '../util/formatDiff'
import isEmpty from 'lodash/isEmpty'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import dedent from 'dedent-js'
import CodeFrameError from '../util/CodeFrameError'
import { codeFrameColumns } from '@babel/code-frame'
import runTransform from '../runTransform'
import Astx from '../Astx'
import formatMatches from '../util/formatMatches'
import chooseGetBackend from '../chooseGetBackend'
import getBabelBackend from '../babel/getBabelBackend'
import { Backend } from '../backend/Backend'

/* eslint-disable no-console */

type Options = {
  transform?: string
  parser?: string
  parserOptions?: string
  find?: string
  replace?: string
  filesAndDirectories?: string[]
  yes?: boolean
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
        describe: `path to the transform file. Can be either a local path or url. Defaults to ./astx.js if --find isn't given`,
      })
      .options('parser', {
        describe: 'parser to use (options: babel, recast/babel)',
        type: 'string',
        default: 'babel',
      })
      .options('parserOptions', {
        describe: 'options for parser',
        type: 'string',
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
      }),

  handler: async (argv: Arguments<Options>) => {
    const paths = (argv.filesAndDirectories || []).filter(
      (x) => typeof x === 'string'
    ) as string[]
    if (!paths.length) {
      yargs.showHelp()
      process.exit(1)
    }

    let getBackend = argv.parser
      ? chooseGetBackend(argv.parser)
      : getBabelBackend
    if (argv.parserOptions) {
      const parserOptionsObj = JSON.parse(argv.parserOptions)
      getBackend = async (
        file: string,
        options?: { [k in string]?: any }
      ): Promise<Backend> => {
        return await getBackend(file, { ...parserOptionsObj, ...options })
      }
    }

    function getTransform(): any {
      const { transform, find, parser }: any = argv
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      if (transform) return require(path.resolve(transform))
      if (find) {
        const getOpt = (regex: RegExp): string | undefined => {
          const index = process.argv.findIndex((a) => regex.test(a))
          return index >= 0 ? process.argv[index + 1] : undefined
        }
        // yargs Eats quotes, not cool...
        const find = getOpt(/^(-f|--find)$/)
        const replace = getOpt(/^(-r|--replace)$/)
        return { find, replace, parser }
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(path.resolve('./astx.js'))
    }

    const transform = getTransform()

    const results: Record<string, string> = {}
    let errorCount = 0
    let changedCount = 0
    let unchangedCount = 0
    for await (const {
      file,
      source,
      transformed,
      reports,
      error,
      matches,
      backend,
    } of runTransform({
      transform,
      paths,
      getBackend,
    })) {
      const logHeader = (logFn: (value: string) => any) =>
        logFn(
          chalk.blue(dedent`
            ==========================================
            ${file}
            ==========================================
          `)
        )

      if (error) {
        errorCount++
        logHeader(console.error)
        if (error instanceof CodeFrameError && error.source && error.loc) {
          console.error(
            dedent`
              ${chalk.red(
                `Error in ${error.filename} (${error.loc.start.line}:${error.loc.start.column})`
              )}
              ${codeFrameColumns(error.source, error.loc, {
                highlightCode: true,
                forceColor: true,
                message: error.message,
              })}
              ${chalk.red(error.stack?.replace(/^.*?(\r\n?|\n)/, ''))}
            `
          )
        } else {
          console.error(chalk.red(error.stack))
        }
      } else if (source && transformed && source !== transformed) {
        changedCount++
        results[file] = transformed
        if (!argv.yes) {
          logHeader(console.error)
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
        console.log(formatMatches(backend, source, matches))
      } else {
        unchangedCount++
      }

      if (reports?.length) {
        console.error(
          chalk.blue(dedent`
            Reports
            -------
          `)
        )
        reports?.forEach((r: any) =>
          console.error(
            r instanceof Astx && source
              ? formatMatches(backend, source, r.matches)
              : r
          )
        )
      }
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
  },
}

export default transform
