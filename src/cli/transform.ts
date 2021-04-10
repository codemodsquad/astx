import yargs, { Arguments, Argv, CommandModule } from 'yargs'
import { Transform } from '../runTransformOnFile'
import path from 'path'
import runTransform from '../runTransform'
import chalk from 'chalk'
import formatDiff from '../util/formatDiff'
import isEmpty from 'lodash/isEmpty'
import inquirer from 'inquirer'
import fs from 'fs-extra'

import dedent from 'dedent-js'

import { Match } from '../find'

/* eslint-disable no-console */

type Options = {
  transform?: string
  parser?: string
  find?: string
  replace?: string
  filesAndDirectories?: string[]
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
      }),

  handler: async (argv: Arguments<Options>) => {
    const paths = (argv.filesAndDirectories || []).filter(
      (x) => typeof x === 'string'
    ) as string[]
    if (!paths.length) {
      yargs.showHelp()
      process.exit(1)
    }

    function getTransform(): Transform {
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

    const transform: Transform = getTransform()

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
    } of runTransform(transform, {
      paths,
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
        logHeader(console.error)
        console.log(formatDiff(source, transformed))
      } else if (matches?.length && source) {
        logHeader(console.log)
        const lineCount = countLines(source)
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i]
          switch (match.type) {
            case 'node': {
              if (i > 0)
                console.log(' '.repeat(String(lineCount).length + 1) + '|')
              console.log(formatNodeMatch(source, lineCount, match))
              break
            }
            case 'statements': {
              break
            }
          }
        }
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
        reports?.forEach((r) => console.error(...r))
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
    }

    if (!isEmpty(results)) {
      const { apply } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'apply',
          message: 'Apply changes',
          default: false,
        },
      ])
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

function countLines(source: string): number {
  if (!source) return 0
  let lines = 1
  const eolRegex = /\r\n?|\n/gm
  while (eolRegex.exec(source)) lines++
  return lines
}

function formatNodeMatch(
  source: string,
  lineCount: number,
  match: Match<any>
): string {
  const {
    start: nodeStart,
    end: nodeEnd,
    loc: {
      start: { line: startLine, column: startCol },
    },
  } = match.node
  const start = nodeStart - startCol
  const eolRegex = /\r\n?|\n/gm
  eolRegex.lastIndex = nodeEnd
  const eolMatch = eolRegex.exec(source)
  const end = eolMatch ? eolMatch.index : nodeEnd

  const bolded =
    source.substring(start, nodeStart) +
    chalk.bold(source.substring(nodeStart, nodeEnd)) +
    source.substring(nodeEnd, end)

  const lines = bolded.split(/\r\n?|\n/gm)

  const lineNumberLength = String(lineCount).length

  let line = startLine
  return lines
    .map((l) => `${String(line++).padStart(lineNumberLength, ' ')} | ${l}`)
    .join('\n')
}
