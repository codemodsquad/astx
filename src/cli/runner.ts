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
  }).argv

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
    // yargs Eats quotes, not cool...
    const find =
      process.argv[process.argv.findIndex((a) => /^-f(ind)?$/.test(a)) + 1]
    const replace =
      process.argv[process.argv.findIndex((a) => /^-r(eplace)?$/.test(a)) + 1]
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
