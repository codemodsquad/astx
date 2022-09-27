import { Arguments, Argv, CommandModule } from 'yargs'
import path from 'path'
import chalk from 'chalk'
import formatDiff from '../util/formatDiff'
import isEmpty from 'lodash/isEmpty'
import once from 'lodash/once'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import dedent from 'dedent-js'
import CodeFrameError from '../util/CodeFrameError'
import runTransform from '../runTransform'
import Astx from '../Astx'
import formatMatches from '../util/formatMatches'
import { Transform } from '../runTransformOnFile'

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
        describe:
          'parser to use (options: babel, babel/auto, recast/babel, recast/babel/auto)',
        type: 'string',
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

    let transform: Transform
    let transformFile: string | undefined
    if (argv.transform) {
      transformFile = path.resolve(argv.transform)
      transform = await import(transformFile)
    } else if (argv.find) {
      const getOpt = (regex: RegExp): string | undefined => {
        const index = process.argv.findIndex((a) => regex.test(a))
        return index >= 0 ? process.argv[index + 1] : undefined
      }
      // yargs Eats quotes, not cool...
      const find = getOpt(/^(-f|--find)$/)
      const replace = getOpt(/^(-r|--replace)$/)
      transform = { find, replace }
    } else {
      transformFile = path.resolve('astx.js')
      transform = await import(transformFile)
    }

    const { parser, parserOptions } = argv

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
      transformFile,
      paths,
      config: {
        parser: parser as any,
        parserOptions: parserOptions ? JSON.parse(parserOptions) : undefined,
      },
    })) {
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
        console.log(formatMatches(backend, source, matches))
      } else {
        unchangedCount++
      }

      if (reports?.length) {
        logHeader(console.error)
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
