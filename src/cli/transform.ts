import yargs, { Arguments, Argv, CommandModule } from 'yargs'
import path from 'path'
import chalk from 'chalk'
import formatDiff from '../util/formatDiff'
import isEmpty from 'lodash/isEmpty'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import dedent from 'dedent-js'

/* eslint-disable no-console */

type Options = {
  transform?: string
  parser?: string
  engine?: string
  find?: string
  replace?: string
  filesAndDirectories?: string[]
  babelGenerator?: boolean
  yes?: boolean
}

async function getEngine(
  engine: string
): Promise<{
  Astx: any
  runTransform: any
  runTransformOnFile: any
  formatMatches: any
}> {
  switch (engine) {
    case 'jscodeshift':
      return {
        Astx: (await import('../jscodeshift/Astx')).default,
        runTransform: (await import('../jscodeshift/runTransform')).default,
        runTransformOnFile: (await import('../jscodeshift/runTransformOnFile'))
          .runTransformOnFile,
        formatMatches: (await import('../jscodeshift/util/formatMatches'))
          .default,
      }
  }
  throw new Error(`invalid engine: ${engine}`)
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
      // .options('engine', {
      //   describe: 'engine to use',
      //   type: 'string',
      //   default: 'jscodeshift',
      // })
      .options('parser', {
        describe: 'parser to use',
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
      .option('babel-generator', {
        describe: 'use @babel/generator to generate output',
        type: 'boolean',
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

    const engine = await getEngine(argv.engine || 'jscodeshift')

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
    } of engine.runTransform(transform, {
      paths,
      useBabelGenerator: argv.babelGenerator,
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
        console.error(chalk.red(error.stack))
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
        console.log(engine.formatMatches(source, matches))
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
            r instanceof engine.Astx && source
              ? engine.formatMatches(source, r.matches())
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
