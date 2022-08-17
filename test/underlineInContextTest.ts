import { describe, it } from 'mocha'
import { expect } from 'chai'
import dedent from 'dedent-js'
import underlineInContext from '../src/util/underlineInContext'

describe(`underlineInContext`, function () {
  it(`works`, function () {
    const code = dedent`
      foo
        bar baz
      qux glorm
      qlab
    `
    expect(
      underlineInContext(code, {
        start: code.indexOf('bar'),
        end: code.indexOf('glorm'),
      })
    ).to.equal(
      dedent`
        2 |   bar baz
              ^^^^^^^
        3 | qux glorm
            ^^^^
      `
    )
    const code2 = code.replace(/\n/g, '\r\n')
    expect(
      underlineInContext(code2, {
        start: code2.indexOf('bar'),
        end: code2.indexOf('glorm'),
      })
    ).to.equal(
      dedent`
        2 |   bar baz
              ^^^^^^^
        3 | qux glorm
            ^^^^
      `
    )
    const code3 = code.replace(/\n/g, '\r')
    expect(
      underlineInContext(code3, {
        start: code3.indexOf('bar'),
        end: code3.indexOf('glorm'),
      })
    ).to.equal(
      dedent`
        2 |   bar baz
              ^^^^^^^
        3 | qux glorm
            ^^^^
      `
    )
  })
})
