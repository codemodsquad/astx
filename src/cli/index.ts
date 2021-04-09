#!/usr/bin/env node

/* eslint-disable no-console */

import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import yargs from 'yargs'
import inquirer from 'inquirer'
import isEmpty from 'lodash/isEmpty'
import runTransform from '../runTransform'
import { Transform } from '../runTransformOnFile'
import formatDiff from '../util/formatDiff'

const argv = yargs
  .option('transform', {
    alias: 't',
    describe: 'path to the transform file. Can be either a local path or url',
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
  }).usage(`Usage:

$0 -f <code> -r <code> [<files...>] [<directories...>]
  
  Quick search and replace in the given files and directories
  (make sure to quote code)

  Example:

    astx -f 'rmdir($path, $force)' -r 'rmdir($path, { force: $force })' src

$0 -t <transformFile> [<files ...>] [<directories ...>]

  Applies a transform file to the given files and directories

$0 [<files ...>] [<directories ...>]

  Applies the default transform file (astx.js in working directory)
  to the given files and directories
`).argv

const paths = argv._.filter((x) => typeof x === 'string') as string[]
if (!paths.length) {
  yargs.showHelp()
  process.exit(1)
}

function getTransform(): Transform {
  const { transform, find, replace, parser }: any = argv
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  if (transform) return require(path.resolve(transform))
  if (find && replace) {
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

async function go() {
  const results: Record<string, string> = {}
  for await (const {
    file,
    source,
    transformed,
    reports,
    error,
  } of runTransform(transform, {
    paths,
  })) {
    if (error) {
      console.error(
        chalk.blue(`
==========================================
${file}
==========================================
`)
      )
      console.error(chalk.red(error.stack))
    } else if (source && transformed && source !== transformed) {
      results[file] = transformed
      console.error(
        chalk.blue(`
==========================================
${file}
==========================================
`)
      )
      console.log(formatDiff(source, transformed))
    } else {
      console.error(chalk.yellow(`no changes: ${file}`))
    }

    if (reports?.length) {
      console.error(chalk.blue`
Reports
-------
`)
      reports?.forEach((r) => console.error(...r))
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
}

go()
