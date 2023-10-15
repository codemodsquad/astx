const fs = require('fs-extra')

const files = process.argv.slice(2).filter((f) => fs.pathExistsSync(f))

module.exports = {
  extension: ['js', 'ts'],
  require: ['test/configure.js'],
  spec: [
    'test/clearConsole.js',
    ...(files.length ? files : ['src/**/*.spec.ts', 'test/**/*.ts']),
  ],
}
