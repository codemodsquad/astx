import { describe, it } from 'mocha'
import { expect } from 'chai'
import omitBlankLineChanges from '../src/util/omitBlankLineChanges'

describe(`omitBlankLineChanges`, function () {
  it(`works`, function () {
    expect(omitBlankLineChanges('foo\n\nbar\nqux', 'foo\nbar\n\nbaz')).to.equal(
      'foo\n\nbar\nbaz'
    )
  })
})
