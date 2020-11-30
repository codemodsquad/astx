/* eslint-disable no-console */

import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import printDiff from 'print-diff'
import jscodeshift from 'jscodeshift'
import yargs from 'yargs'
import inquirer from 'inquirer'
import parseFindOrReplace from '../util/parseFindOrReplace'
import replace from '../replace'
import * as astx from '../index'
import { ASTNode } from 'jscodeshift'

const argv = yargs.option('transform', {
  alias: 't',
  describe: 'path to the transform file. Can be either a local path or url',
  default: './astx.js',
}).argv

const { _: files } = argv

// eslint-disable-next-line @typescript-eslint/no-var-requires
const transform = require(path.resolve(argv.transform))

const results: Record<string, string> = {}

const j = transform.parser
  ? jscodeshift.withParser(transform.parser)
  : jscodeshift

let parsedFind, parsedReplace: any
if (transform.find) {
  try {
    parsedFind = parseFindOrReplace(j, transform.find)
  } catch (error) {
    console.error(`failed to parse find: ${error.message}`)
    process.exit(1)
  }
}
if (transform.replace) {
  try {
    parsedReplace =
      typeof transform.replace === 'function'
        ? transform.replace
        : parseFindOrReplace(j, transform.replace)
  } catch (error) {
    console.error(`failed to parse replace: ${error.message}`)
    process.exit(1)
  }
}

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  let result
  const reports: any[] = []
  if (typeof transform === 'function') {
    result = transform(
      {
        source,
        path: file,
      },
      {
        jscodeshift: transform.parser
          ? jscodeshift.withParser(transform.parser)
          : jscodeshift,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        stats: () => {},
        report: (msg: any) => reports.push(msg),
        astx,
      },
      {}
    )
  } else if (parsedFind && parsedReplace) {
    const code = fs.readFileSync(file, 'utf8')
    const root = j(code)
    replace(
      root,
      parsedFind,
      typeof parsedReplace === 'function'
        ? (match: astx.Match<any>): ASTNode =>
            parsedReplace(
              match,
              {
                source,
                path: file,
              },
              {
                jscodeshift: transform.parser
                  ? jscodeshift.withParser(transform.parser)
                  : jscodeshift,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                stats: () => {},
                report: (msg: any) => reports.push(msg),
                astx,
              },
              {}
            )
        : parsedReplace
    )
    result = root.toSource()
  }
  if (source !== result) results[file] = result
  if (files.length > 1) {
    console.error(
      chalk.blue(`
==========================================
${file}
==========================================
`)
    )
  }
  printDiff(source, result)
  if (reports.length) {
    console.error(chalk.blue`
Reports
-------
`)
    reports.forEach(r => console.error(...r))
  }
}

if (Object.keys(results).length) {
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'apply',
        message: 'Apply changes',
        default: false,
      },
    ])
    .then(({ apply }: { apply: boolean }) => {
      if (apply) {
        for (const file in results) {
          fs.writeFileSync(file, results[file], 'utf8')
          console.error(`Wrote ${file}`)
        }
      }
      if (process.send) process.send({ exit: 0 })
    })
}
