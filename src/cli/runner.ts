/* eslint-disable no-console */

import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import printDiff from 'print-diff'
import jscodeshift, { ASTNode, Options, Parser, Transform } from 'jscodeshift'
import yargs from 'yargs'
import inquirer from 'inquirer'
import chooseJSCodeshiftParser from 'jscodeshift-choose-parser'
import makeTemplate from '../util/template'
import * as astx from '../index'
import _resolve from 'resolve'
import { promisify } from 'util'
import memoize from 'lodash/memoize'
import { glob } from 'glob-gitignore'
const resolve = promisify(_resolve) as any

const argv = yargs.option('transform', {
  alias: 't',
  describe: 'path to the transform file. Can be either a local path or url',
  default: './astx.js',
}).argv

const { _: _files } = argv

interface TransformFile {
  astx?: astx.AstxTransform
  parser?: string | Parser
  find?: string | ASTNode
  replace?: string | astx.GetReplacement<any>
  where?: astx.ReplaceOptions['where']
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const transform: TransformFile = require(path.resolve(argv.transform))

const results: Record<string, string> = {}

const getPrettier = memoize(
  async (path: string): Promise<any> => {
    try {
      return require(await resolve('prettier', {
        basedir: path,
      }))
    } catch (error) {
      return null
    }
  }
)

async function go() {
  const files: string[] = []
  for (const f of _files) {
    if (typeof f !== 'string') continue

    if ((await fs.stat(f)).isDirectory()) {
      for (const file of await glob(
        path.join(f, '**', '*.{js,js.flow,ts,tsx,cjs,mjs}')
      )) {
        files.push(file)
      }
    } else files.push(f)
  }

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    const j = jscodeshift.withParser(
      transform.parser || chooseJSCodeshiftParser(file)
    )
    const template = makeTemplate(j)

    let result
    const reports: any[] = []

    if (
      typeof transform !== 'function' &&
      typeof transform.astx !== 'function' &&
      transform.find &&
      transform.replace
    ) {
      transform.astx = ({ astx }) =>
        astx
          .find(transform.find as any, { where: transform.where })
          .replace(transform.replace as any)
    }

    if (typeof transform === 'function') {
      // jscodeshift CLI passes source/path separately from other options, which is dumb
      result = await (transform as Transform)(
        { source, path: file },
        {
          j,
          jscodeshift: j,
          stats: () => {
            // noop
          },
          report: (msg: any) => reports.push(msg),
        },
        {}
      )
    } else if (typeof transform.astx === 'function') {
      const root = j(source)
      const options = {
        source,
        path: file,
        j,
        jscodeshift: j,
        stats: () => {
          // noop
        },
        report: (msg: any) => reports.push(msg),
        ...template,
        root,
        astx: new astx.Astx(j, root),
      }
      const [_result, prettier] = await Promise.all([
        transform.astx(options),
        getPrettier(path.dirname(file)),
      ])
      result = _result
      if (result === undefined) result = root
      if (result instanceof Object) result = result.toSource()
      if (prettier && typeof result === 'string' && result !== source) {
        const config = await prettier.resolveConfig(file)
        result = prettier.format(result, config)
      }
    }
    if (result && source !== result) {
      results[file] = result
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
    } else if (files.length > 1) {
      console.error(chalk.yellow(`no changes: ${file}`))
    }

    if (reports.length) {
      console.error(chalk.blue`
Reports
-------
`)
      reports.forEach((r) => console.error(...r))
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
}

go()
