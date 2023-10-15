/* eslint-disable */

const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('chai-subset'))

require('@babel/register')({ extensions: ['.js', '.ts'] })
