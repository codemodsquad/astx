import { describe, it } from 'mocha'
import { expect } from 'chai'
import JscodeshiftAstx from '../src/Astx'
import j, { ASTPath as JscodeshiftASTPath } from 'jscodeshift'
import { formatMatches as _formatMatches } from './findReplace/findReplace.test'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe(`Astx`, function () {
  for (const { engine, createAstx, backend } of [
    // {
    //   engine: 'jscodeshift',
    //   backend: jscodeshiftBackend(j),
    //   createAstx: (code: string | JscodeshiftASTPath<any>[]) =>
    //     new JscodeshiftAstx(j, j(code).paths()),
    // },
  ]) {
    const formatMatches = (astx: JscodeshiftAstx) =>
      _formatMatches(astx.matches(), backend)
    const toSource = (astx: JscodeshiftAstx) =>
      backend.generate(astx.nodes()[0]).code
    describe(engine, function () {
      it(`.find tagged template works`, function () {
        expect(
          formatMatches(
            createAstx(`foo + bar`).find`${j.identifier('foo')} + $a`()
          )
        ).to.deep.equal([{ node: 'foo + bar', captures: { $a: 'bar' } }])
      })
      it(`cascading .find`, function () {
        expect(
          formatMatches(
            createAstx(`function foo() { foo(); bar() }`)
              .find`function $fn() { $$body }`().find`$fn()`()
          )
        ).to.deep.equal([
          {
            node: 'foo()',
            captures: { $fn: 'foo' },
            arrayCaptures: { $$body: ['foo();', 'bar()'] },
          },
        ])
      })
      it(`.find and .withCaptures`, function () {
        const astx = createAstx(`function foo() { foo(); bar() }`)

        const fnMatches = astx.find`function $fn() { $$body }`()
        expect(
          formatMatches(astx.withCaptures(fnMatches).find`$fn()`())
        ).to.deep.equal([
          {
            node: 'foo()',
            captures: { $fn: 'foo' },
            arrayCaptures: { $$body: ['foo();', 'bar()'] },
          },
        ])
      })
      it(`.match()`, function () {
        const astx = createAstx(`foo + bar; baz + qux, qlomb`).find`$a + $b`()
        expect(astx.match()).to.equal(astx.matches()[0])
      })
      it(`.at()`, function () {
        const astx = createAstx(`foo + bar; baz + qux, qlomb`).find`$a + $b`()
        expect(astx.at(1).matches()).to.deep.equal([astx.matches()[1]])
      })
      it(`.filter()`, function () {
        const astx = createAstx(`foo + bar; baz + qux, qlomb`).find`$a + $b`()
        expect(
          astx.filter((m) => (m.captures?.$a as any)?.name === 'baz').matches()
        ).to.deep.equal(astx.at(1).matches())
      })
      it(`.nodes()`, function () {
        const astx = createAstx(`foo + bar; baz + qux, qlomb`).find`$a + $b`()
        expect(astx.length).to.be.above(0)
        expect(astx.nodes()).to.deep.equal(astx.matches().map((m) => m.node))
      })
      it(`.paths()`, function () {
        const astx = createAstx(`foo + bar; baz + qux, qlomb`).find`$a + $b`()
        expect(astx.length).to.be.above(0)
        expect(astx.paths()).to.deep.equal(astx.matches().map((m) => m.path))
      })
      it(`.nodes() -- array capture`, function () {
        const astx = createAstx(
          `const a = [1, 2, 3, 4]; const b = [1, 4, 5, 6]`
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
        const astx = createAstx(
          `const a = [1, 2, 3, 4]; const b = [1, 4, 5, 6]`
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
            createAstx(`foo + bar; baz + qux`).find`$a + $b`().captures('$a')
          )
        ).to.deep.equal([{ node: 'foo' }, { node: 'baz' }])
      })
      it(`.arrayCaptures() works`, function () {
        expect(
          formatMatches(
            createAstx(`const a = [1, 2, 3, 4]; const b = [1, 4, 5, 6]`)
              .find`[1, $$a]`().arrayCaptures('$$a')
          )
        ).to.deep.equal([
          { nodes: ['2', '3', '4'] },
          { nodes: ['4', '5', '6'] },
        ])
      })
      it(`.closest tagged template works`, function () {
        expect(
          formatMatches(
            createAstx(`foo + bar; baz + qux`).find(`$Or(foo, bar, baz, qux)`)
              .closest`$a + $b`()
          )
        ).to.deep.equal([
          { node: 'foo + bar', captures: { $a: 'foo', $b: 'bar' } },
          { node: 'baz + qux', captures: { $a: 'baz', $b: 'qux' } },
        ])
      })
      it(`.find node argument works`, function () {
        expect(
          formatMatches(createAstx(`foo + bar`).find(j.identifier('foo')))
        ).to.deep.equal([{ node: 'foo' }])
      })
      it(`.find tagged template plus options works`, function () {
        expect(
          formatMatches(
            createAstx(`1 + 2; 3 + 4`).find`$a + $b`({
              where: {
                $b: (path: any) => path.node.value < 4,
              },
            })
          )
        ).to.deep.equal([{ node: '1 + 2', captures: { $a: '1', $b: '2' } }])
      })
      it(`.find tagged template plus options works`, function () {
        expect(
          formatMatches(
            createAstx(`1 + 2; 3 + 4`).find`$a + $b`({
              where: {
                $b: (path: any) => path.node.value < 4,
              },
            })
          )
        ).to.deep.equal([{ node: '1 + 2', captures: { $a: '1', $b: '2' } }])
      })
      it(`.replace tagged template works`, function () {
        const astx = createAstx(`1 + 2; 3 + 4`)
        astx.find`$a + $b`().replace`$b + $a`()
        expect(toSource(astx)).to.equal(`2 + 1; 4 + 3;`)
      })
      it(`.replace tagged template after find options works`, function () {
        const astx = createAstx(`1 + 2; 3 + 4`)
        astx.find`$a + $b`({
          where: { $b: (path: any) => path.node.value < 4 },
        }).replace`$b + $a`()
        expect(toSource(astx)).to.equal(`2 + 1; 3 + 4`)
      })
      it(`.replace tagged template interpolation works`, function () {
        const astx = createAstx(`1 + 2; 3 + 4`)
        astx.find`$a + $b`().replace`$b + ${j.identifier('foo')}`()
        expect(toSource(astx)).to.equal(`2 + foo; 4 + foo;`)
      })
      it(`.replace function returning parse tagged template literal works`, function () {
        const astx = createAstx(`1 + FOO; 3 + BAR`)
        astx.find`$a + $b`().replace(
          (match, parse) =>
            parse`${j.identifier(
              (match.captures.$b as any).name.toLowerCase()
            )} + $a`
        )
        expect(toSource(astx)).to.equal(`foo + 1; bar + 3;`)
      })
      it(`.replace function returning string works`, function () {
        const astx = createAstx(`1 + FOO; 3 + BAR`)
        astx.find`$a + $b`().replace(
          (match) => `${(match.captures.$b as any).name.toLowerCase()} + $a`
        )
        expect(toSource(astx)).to.equal(`foo + 1; bar + 3;`)
      })
      it(`.replace called with string works`, function () {
        const astx = createAstx(`1 + 2; 3 + 4`)
        astx.find('$a + $b').replace('$b + $a')
        expect(toSource(astx)).to.equal(`2 + 1; 4 + 3;`)
      })
    })
  }
})
