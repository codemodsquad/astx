import { fileURLToPath } from 'url'
import { createRequire } from 'module'
const require = createRequire(fileURLToPath(import.meta.url))

const esm = require(require
  .resolve('ts-node')
  .replace(/\/node_modules\/ts-node\/.*/, '/node_modules/ts-node/dist/esm'))
export const { resolve, load, getFormat, transformSource } =
  esm.registerAndCreateEsmHooks({
    transpileOnly: true,
    experimentalResolver: true,
  })
