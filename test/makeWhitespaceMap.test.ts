import { describe, it } from 'mocha'
import { makeWhitespaceMap } from '../src/util/makeWhitespaceMap'
import { expect } from 'chai'

describe(`makeWhitespaceMap`, function () {
  it(`works`, function () {
    expect(makeWhitespaceMap(' abc   def g ')).to.deep.equal({
      starts: [0, 0, 2, 3, 4, 4, 4, 4, 8, 9, 10, 10, 12],
      ends: [1, 1, 2, 3, 7, 7, 7, 7, 8, 9, 11, 11, 13],
    })
    expect(makeWhitespaceMap('ab  ')).to.deep.equal({
      starts: [0, 1, 2, 2],
      ends: [0, 1, 4, 4],
    })
    expect(makeWhitespaceMap('  ab')).to.deep.equal({
      starts: [0, 0, 0, 3],
      ends: [2, 2, 2, 3],
    })
  })
})
