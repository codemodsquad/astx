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
        new Astx(j, j(`foo + bar`)).find`${j.identifier(
          'foo'
        )} + $a`().matches()
      )
    ).to.deep.equal([{ node: 'foo + bar', captures: { $a: 'bar' } }])
  })
  it(`.match()`, function () {
    const astx = new Astx(j, j(`foo + bar; baz + qux, qlomb`)).find`$a + $b`()
    expect(astx.match()).to.equal(astx.matches()[0])
  })
  it(`.at()`, function () {
    const astx = new Astx(j, j(`foo + bar; baz + qux, qlomb`)).find`$a + $b`()
    expect(astx.at(1).matches()).to.deep.equal([astx.matches()[1]])
  })
  it(`.filter()`, function () {
    const astx = new Astx(j, j(`foo + bar; baz + qux, qlomb`)).find`$a + $b`()
    expect(
      astx.filter((m) => (m.captures?.$a as any)?.name === 'baz').matches()
    ).to.deep.equal(astx.at(1).matches())
  })
  it(`.nodes()`, function () {
    const astx = new Astx(j, j(`foo + bar; baz + qux, qlomb`)).find`$a + $b`()
    expect(astx.length).to.be.above(0)
    expect(astx.nodes()).to.deep.equal(astx.matches().map((m) => m.node))
  })
  it(`.paths()`, function () {
    const astx = new Astx(j, j(`foo + bar; baz + qux, qlomb`)).find`$a + $b`()
    expect(astx.length).to.be.above(0)
    expect(astx.paths()).to.deep.equal(astx.matches().map((m) => m.path))
  })
  it(`.nodes() -- array capture`, function () {
    const astx = new Astx(
      j,
      j(`const a = [1, 2, 3, 4]; const b = [1, 4, 5, 6]`)
    ).find`[1, $$a]`()
    expect(astx.length).to.be.above(0)
    expect(astx.nodes()).to.deep.equal(
      astx
        .matches()
        .map((m) => m.nodes)
        .flat()
    )
  })
  it(`.paths() -- array capture`, function () {
    const astx = new Astx(
      j,
      j(`const a = [1, 2, 3, 4]; const b = [1, 4, 5, 6]`)
    ).find`[1, $$a]`()
    expect(astx.length).to.be.above(0)
    expect(astx.paths()).to.deep.equal(
      astx
        .matches()
        .map((m) => m.paths)
        .flat()
    )
  })
  it(`.captures()`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`foo + bar; baz + qux`)).find`$a + $b`()
          .captures('$a')
          .matches()
      )
    ).to.deep.equal([{ node: 'foo' }, { node: 'baz' }])
  })
  it(`.arrayCaptures() works`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`const a = [1, 2, 3, 4]; const b = [1, 4, 5, 6]`))
          .find`[1, $$a]`()
          .arrayCaptures('$$a')
          .matches()
      )
    ).to.deep.equal([{ nodes: ['2', '3', '4'] }, { nodes: ['4', '5', '6'] }])
  })
  it(`.closest tagged template works`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`foo + bar; baz + qux`).find(j.Identifier))
          .closest`$a + $b`().matches()
      )
    ).to.deep.equal([
      { node: 'foo + bar', captures: { $a: 'foo', $b: 'bar' } },
      { node: 'baz + qux', captures: { $a: 'baz', $b: 'qux' } },
    ])
  })
  it(`.find node argument works`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`foo + bar`)).find(j.identifier('foo')).matches()
      )
    ).to.deep.equal([{ node: 'foo' }])
  })
  it(`.find tagged template plus options works`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`1 + 2; 3 + 4`)).find`$a + $b`({
          where: { $b: (path) => path.node.value < 4 },
        }).matches()
      )
    ).to.deep.equal([{ node: '1 + 2', captures: { $a: '1', $b: '2' } }])
  })
  it(`.find tagged template plus options works`, function () {
    expect(
      formatMatches(
        j,
        new Astx(j, j(`1 + 2; 3 + 4`)).find`$a + $b`({
          where: { $b: (path) => path.node.value < 4 },
        }).matches()
      )
    ).to.deep.equal([{ node: '1 + 2', captures: { $a: '1', $b: '2' } }])
  })
  it(`.replace tagged template works`, function () {
    const root = j(`1 + 2; 3 + 4`)
    new Astx(j, root).find`$a + $b`().replace`$b + $a`()
    expect(root.toSource()).to.equal(`2 + 1; 4 + 3;`)
  })
  it(`.replace tagged template after find options works`, function () {
    const root = j(`1 + 2; 3 + 4`)
    new Astx(j, root).find`$a + $b`({
      where: { $b: (path) => path.node.value < 4 },
    }).replace`$b + $a`()
    expect(root.toSource()).to.equal(`2 + 1; 3 + 4`)
  })
  it(`.replace tagged template interpolation works`, function () {
    const root = j(`1 + 2; 3 + 4`)
    new Astx(j, root).find`$a + $b`().replace`$b + ${j.identifier('foo')}`()
    expect(root.toSource()).to.equal(`2 + foo; 4 + foo;`)
  })
  it(`.replace function returning parse tagged template literal works`, function () {
    const root = j(`1 + FOO; 3 + BAR`)
    new Astx(j, root).find`$a + $b`().replace(
      (match, parse) =>
        parse`${j.identifier(
          (match.captures.$b as any).name.toLowerCase()
        )} + $a`
    )
    expect(root.toSource()).to.equal(`foo + 1; bar + 3;`)
  })
  it(`.replace function returning string works`, function () {
    const root = j(`1 + FOO; 3 + BAR`)
    new Astx(j, root).find`$a + $b`().replace(
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
