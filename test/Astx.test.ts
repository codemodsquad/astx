import { describe, it } from 'mocha'
import { expect } from 'chai'
import Astx from '../src/Astx'
import j from 'jscodeshift'
import { formatMatches } from './findReplace'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe(`Astx`, function () {
  it(`.find tagged template works`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`foo + bar`)).find`${j.identifier('foo')} + $a`()
      )
    ).to.deep.equal([{ node: 'foo + bar', captures: { $a: 'bar' } }])
  })
  it(`.find node argument works`, function () {
    expect(
      formatMatches(j, new Astx(j, j(`foo + bar`)).find(j.identifier('foo')))
    ).to.deep.equal([{ node: 'foo' }])
  })
  it(`.find tagged template plus options works`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`1 + 2; 3 + 4`)).find`$a + $b`({
          where: { $b: (path) => path.node.value < 4 },
        })
      )
    ).to.deep.equal([{ node: '1 + 2', captures: { $a: '1', $b: '2' } }])
  })
  it(`.find tagged template plus options works`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`1 + 2; 3 + 4`)).find`$a + $b`({
          where: { $b: (path) => path.node.value < 4 },
        })
      )
    ).to.deep.equal([{ node: '1 + 2', captures: { $a: '1', $b: '2' } }])
  })
  it(`.replace tagged template works`, function () {
    const root = j(`1 + 2; 3 + 4`)
    new Astx(j, root).find`$a + $b`.replace`$b + $a`
    expect(root.toSource()).to.equal(`2 + 1; 4 + 3;`)
  })
  it(`.replace tagged template after find options works`, function () {
    const root = j(`1 + 2; 3 + 4`)
    new Astx(j, root).find`$a + $b`({
      where: { $b: (path) => path.node.value < 4 },
    }).replace`$b + $a`
    expect(root.toSource()).to.equal(`2 + 1; 3 + 4`)
  })
  it(`.replace tagged template interpolation works`, function () {
    const root = j(`1 + 2; 3 + 4`)
    new Astx(j, root).find`$a + $b`.replace`$b + ${j.identifier('foo')}`
    expect(root.toSource()).to.equal(`2 + foo; 4 + foo;`)
  })
  it(`.replace function returning parse tagged template literal works`, function () {
    const root = j(`1 + FOO; 3 + BAR`)
    new Astx(j, root).find`$a + $b`.replace(
      (match, parse) =>
        parse`${j.identifier(
          (match.captures.$b as any).name.toLowerCase()
        )} + $a`
    )
    expect(root.toSource()).to.equal(`foo + 1; bar + 3;`)
  })
  it(`.replace function returning string works`, function () {
    const root = j(`1 + FOO; 3 + BAR`)
    new Astx(j, root).find`$a + $b`.replace(
      (match) => `${(match.captures.$b as any).name.toLowerCase()} + $a`
    )
    expect(root.toSource()).to.equal(`foo + 1; bar + 3;`)
  })
  it(`.replace called with string works`, function () {
    const root = j(`1 + 2; 3 + 4`)
    new Astx(j, root).find('$a + $b').replace('$b + $a')
    expect(root.toSource()).to.equal(`2 + 1; 4 + 3;`)
  })
})
