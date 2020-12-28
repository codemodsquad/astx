/* eslint-disable no-console */

import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import printDiff from 'print-diff'
import yargs from 'yargs'
import inquirer from 'inquirer'
import isEmpty from 'lodash/isEmpty'
import runTransform from '../runTransform'
import { Transform } from '../runTransformOnFile'

const argv = yargs.option('transform', {
  alias: 't',
  describe: 'path to the transform file. Can be either a local path or url',
  default: './astx.js',
}).argv

// eslint-disable-next-line @typescript-eslint/no-var-requires
const transform: Transform = require(path.resolve(argv.transform))

async function go() {
  const results: Record<string, string> = {}
  for await (const {
    file,
    source,
    transformed,
    reports,
    error,
  } of runTransform(transform, {
    paths: argv._.filter((x) => typeof x === 'string') as string[],
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
      printDiff(source, transformed)
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
