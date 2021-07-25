import { Arguments, Argv, CommandModule } from 'yargs'
import fs from 'fs-extra'
import dedent from 'dedent-js'
import inquirer from 'inquirer'

/* eslint-disable no-console */

type Options = {
  file?: string
  style?: string
}

const init: CommandModule<Options> = {
  command: 'init [file]',
  describe: 'create a transform file',
  builder: (yargs: Argv<Options>) =>
    yargs
      .positional('file', {
        describe: `name of the transform file to create`,
        type: 'string',
        default: 'astx.js',
      })
      .option('style', {
        alias: 's',
        type: 'string',
        choices: ['find-replace', 'function'],
      }),
  handler: async ({
    file = 'astx.js',
    style,
  }: Arguments<Options>): Promise<void> => {
    if (await fs.pathExists(file)) {
      console.error(
        `Path already exists: ${/^[./]/.test(file) ? file : './' + file}`
      )
      process.exit(1)
    }
    if (!style) {
      ;({ style } = await inquirer.prompt([
        {
          name: 'style',
          type: 'list',
          choices: ['find-replace', 'function'],
        },
      ]))
    }
    const content =
      style === 'function'
        ? dedent`
          exports.astx = ({ astx, j, root, expression, statement, statements }) => {
            // example: astx.find\`$foo\`.replace\`$foo\`
          }
        `
        : dedent`
          exports.find = \`

          \` 

          exports.where = {
          
          }

          exports.replace = \`

          \`
        `
    await fs.writeFile(file, content, 'utf8')
    console.error(`Wrote ${/^[./]/.test(file) ? file : './' + file}`)
  },
}

export default init
