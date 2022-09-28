/* eslint-env commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */

require('@babel/register')({ extensions: ['.ts'] })
require('./AstxWorker.ts').workerProcess()
