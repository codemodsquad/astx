# astx

[![CircleCI](https://circleci.com/gh/codemodsquad/astx.svg?style=svg)](https://circleci.com/gh/codemodsquad/astx)
[![Coverage Status](https://codecov.io/gh/codemodsquad/astx/branch/master/graph/badge.svg)](https://codecov.io/gh/codemodsquad/astx)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/astx.svg)](https://badge.fury.io/js/astx)

Super powerful structural search and replace for JavaScript and TypeScript to automate your refactoring

# Table of Contents

<!-- toc -->

- [astx](#astx)
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Usage examples](#usage-examples)
  - [Fixing eslint errors](#fixing-eslint-errors)
  - [Converting require statements to imports](#converting-require-statements-to-imports)
  - [Making code DRY](#making-code-dry)
- [Prior art and philosophy](#prior-art-and-philosophy)
- [API](#api)
  - [class Astx](#class-astx)
    - [`constructor(jscodeshift: JSCodeshift, paths: ASTPath<any>[] | Match[], options?: { withCaptures?: Match[] })`](#constructorjscodeshift-jscodeshift-paths-astpathany--match-options--withcaptures-match-)
    - [`.find(...)` (`Astx`)](#find-astx)
    - [`.closest(...)` (`Astx`)](#closest-astx)
    - [`FindOptions`](#findoptions)
      - [`FindOptions.where` (`{ [captureName: string]: (path: ASTPath<any>) => boolean }`)](#findoptionswhere--capturename-string-path-astpathany--boolean-)
      - [`FindOptions.withCaptures` (`Match | Match[]`)](#findoptionswithcaptures-match--match)
    - [`.find(...).replace(...)` (`void`)](#findreplace-void)
    - [`size()` (`number`)](#size-number)
    - [`length` (`number`)](#length-number)
    - [`matches()` (`Match[]`)](#matches-match)
    - [`match()` (`Match`)](#match-match)
    - [`paths()` (`ASTPath[]`)](#paths-astpath)
    - [`nodes()` (`ASTNode[]`)](#nodes-astnode)
    - [`.filter(iteratee)` (`Astx`)](#filteriteratee-astx)
    - [`.at(index)` (`Astx`)](#atindex-astx)
    - [`.withCaptures(matches)` (`Astx`)](#withcapturesmatches-astx)
    - [`.captures(name)` (`Astx`)](#capturesname-astx)
    - [`.captureNode(name)` (`ASTNode | null`)](#capturenodename-astnode--null)
    - [`.capturePath(name)` (`ASTPath<any> | null`)](#capturepathname-astpathany--null)
    - [`.arrayCaptures(name)` (`Astx`)](#arraycapturesname-astx)
    - [`arrayCaptureNodes(name)` (`ASTNode[] | null`)](#arraycapturenodesname-astnode--null)
    - [`arrayCapturePaths(name)` (`ASTPath<any>[] | null`)](#arraycapturepathsname-astpathany--null)
    - [`stringCapture(name)` (`string | null`)](#stringcapturename-string--null)
  - [Match](#match)
    - [`type`](#type)
    - [`.path`](#path)
    - [`.node`](#node)
    - [`.paths`](#paths)
    - [`.nodes`](#nodes)
    - [`.captures`](#captures)
    - [`.pathCaptures`](#pathcaptures)
    - [`.arrayCaptures`](#arraycaptures)
    - [`.arrayPathCaptures`](#arraypathcaptures)
    - [`.stringCaptures`](#stringcaptures)
- [Match Patterns](#match-patterns)
  - [Object Matching](#object-matching)
  - [List Matching](#list-matching)
    - [Support Table](#support-table)
  - [String Matching](#string-matching)
  - [Extracting nodes](#extracting-nodes)
  - [| Backreferences](#-backreferences)
- [Transform files](#transform-files)
  - [`exports.find` (optional)](#exportsfind-optional)
  - [`exports.where` (optional)](#exportswhere-optional)
  - [`exports.replace` (optional)](#exportsreplace-optional)
  - [`exports.parser` (optional)](#exportsparser-optional)
  - [`exports.astx` (optional)](#exportsastx-optional)
- [CLI](#cli)

<!-- tocstop -->

# Introduction

If you've ever refactored a function, and had to go through and change all the calls to that function by hand one by one, you know
how much time it can take. For example, let's say you decided to move an optional boolean `force` argument to your `rmdir` function
into an options hash argument:

```js
// before:
rmdir('old/stuff')
rmdir('new/stuff', true)

// after:
rmdir('old/stuff')
rmdir('new/stuff', { force: true })
```

Changing a bunch of calls to `rmdir` by hand would suck. You could try using regex replace, but it's fiddly and wouldn't tolerate whitespace and
linebreaks well unless you work really hard at the regex.

Now there's a better option...you can refactor with confidence using `astx`!

```sh
astx -f 'rmdir($path, $force)' -r 'rmdir($path, { force: $force })' src
```

What's going on here? Find and replace must be valid JS expressions or statements. `astx` parses them
into AST (Abstract Syntax Tree) nodes, and then looks for matching AST nodes in your code.
`astx` treats any identifier in starting with `$` in the find or replace expression as a placeholder - in this case, `$path` and `$force`.
(You can use leading `$_` as an escape, for instance `$_foo` will match literal identifier `$foo` in your code).

When it gets to a function call, it checks that the function name matches `rmdir`, and that it has the same number of arguments.
Then it checks if the arguments match.
Our patterns for both arguments (`$path`, `$force`) are placeholders, so they automatically match and capture the corresponding AST nodes
of the two arguments in your code.

Then `astx` replaces that function call it found with the replacement expression. When it finds placeholders in the replacement expression,
it substitutes the corresponding values that were captured for those placeholders (`$path` captured `'new/stuff'` and `$force` captured `true`).

# Usage examples

## Fixing eslint errors

Got a lot of `Do not access Object.prototype method 'hasOwnProperty' from target object` errors?

```js
// astx.js
exports.find = `$a.hasOwnProperty($b)`
exports.replace = `Object.prototype.hasOwnProperty.call($a, $b)`
```

## Converting require statements to imports

```js
// astx.js
exports.find = `const $id = require('$source')`
exports.replace = `import $id from '$source'`
```

## Making code DRY

In `jscodeshift-add-imports` I had a bunch of test cases following this pattern:

```js
it(`leaves existing default imports untouched`, function () {
  const code = `import Baz from 'baz'`
  const root = j(code)
  const result = addImports(root, statement`import Foo from 'baz'`)
  expect(result).to.deep.equal({ Foo: 'Baz' })
  expect(root.toSource()).to.equal(code)
})
```

I wanted to make them more DRY, like this:

```js
it(`leaves existing default imports untouched`, function () {
  testCase({
    code: `import Baz from 'baz'`,
    add: `import Foo from 'baz'`,
    expectedCode: `import Baz from 'baz'`,
    expectedReturn: { Foo: 'Baz' },
  })
})
```

Here was a transform for the above. (Of course, I had to run a few variations of this for
cases where the expected code was different, etc.)

```js
exports.find = `
const code = $code
const root = j(code)
const result = addImports(root, statement\`$add\`)
expect(result).to.deep.equal($expectedReturn)
expect(root.toSource()).to.equal(code)
`

exports.replace = `
testCase({
  code: $code,
  add: \`$add\`,
  expectedCode: $code,
  expectedReturn: $expectedReturn,
})
`
```

# Prior art and philosophy

While I was thinking about making this I discovered [grasp](https://www.graspjs.com/), a similar tool that inspired the `$` capture syntax.
There are several reasons I decided to make `astx` anyway:

- Grasp uses the Acorn parser, which doesn't support TypeScript or Flow code AFAIK
- Hasn't been updated in 4 years
- Grasp's replace pattern syntax is clunkier, placeholders don't match the find pattern syntax:
  `grasp -e 'setValue($k, $v, true)' -R 'setValueSilently({{k}}, {{v}})' file.js`
- It has its own DSL (SQuery) that's pretty limited and has a slight learning curve
- I wanted to leverage the power of jscodeshift for advanced use cases that are probably awkward/impossible in Grasp

So the philosophy of `astx` is:

- **Use jscodeshift (and recast) as a solid foundation**
- **Provide a simple find and replace API that's ideal for simple cases and has minimum learning curve**
- **Use javascript + jscodeshift for anything more complex, so that you have unlimited flexibility**

Jscodeshift has a learning curve, but it's worth learning if you want to do any nontrivial codemods.
Paste your code into [AST Explorer](https://astexplorer.net/) if you need to learn about the structure of the AST.

# API

Note: the identifier `j` in all code examples is an instance of `jscodeshift`, as per convention.

## class Astx

```ts
import { Astx } from 'astx'
import j from 'jscodeshift'

const astx = new Astx(j, j('your code here'))
```

### `constructor(jscodeshift: JSCodeshift, paths: ASTPath<any>[] | Match[], options?: { withCaptures?: Match[] })`

`jscodeshift` must be configured with your desired parser for methods to work correctly.
For instance, if you're using TypeScript, it could be `require('jscodeshift').withParser('ts')`.

`paths` specifies the `ASTPath`s or `Match`es you want `Astx` methods
to search/operate on.

### `.find(...)` (`Astx`)

Finds matches for the given pattern within this instance's starting paths and returns an `Astx` instance containing the matches.

If you call `astx.find('foo($$args)')` on the initial instance passed to your transform function, it will find all calls to `foo` within the file, and return those matches in a new `Astx` instance.

Methods on the returned instance will operate only on the matched paths.

For example if you do `astx.find('foo($$args)').find('$a + $b')`, the second `find` call will only search for `$a + $b` within matches to `foo($$args)`, rather than anywhere in the file.

You can call `.find` as a method or tagged template literal:

- `` .find`pattern`(options?: FindOptions) ``
- `.find(pattern: string | ASTNode | ASTNode[] | ASTPath | ASTPath[], options?: FindOptions)`

If you give the pattern as a string, it must be a valid expression or statement(s) as parsed by the `jscodeshift` instance. Otherwise it should be valid
AST node(s) you already parsed or constructed.
You can interpolate AST nodes in the tagged template literal; it uses `jscodeshift.template.expression` or `jscodeshift.template.statement` under the hood.

For example you could do `` astx.find`${j.identifier('foo')} + 3`() ``.

Or you could match multiple statements by doing

```ts
astx.findStatements`
  const $a = $b;
  $$c;
  const $d = $a + $e;
`()
```

This would match (for example) the statements `const foo = 1; const bar = foo + 5;`, with any number of statements between them.

### `.closest(...)` (`Astx`)

Like `.find()`, but searches up the AST ancestors instead of down into descendants; finds the closest enclosing node of each input path that matches the given pattern.

### `FindOptions`

An object with the following optional properties:

#### `FindOptions.where` (`{ [captureName: string]: (path: ASTPath<any>) => boolean }`)

Where conditions for node captures. For example if your find pattern is `$a()`, you could have
`{ where: { $a: path => /foo|bar/.test(path.node.name) } }`, which would only match zero-argument calls
to `foo` or `bar`.

#### `FindOptions.withCaptures` (`Match | Match[]`)

Allows you to backreference captures in matches from previous find operations.

### `.find(...).replace(...)` (`void`)

Finds and replaces matches for the given pattern within `root`.

There are several different ways you can call `.replace`. You can call `.find` in any way described above.

- `` .find(...).replace`replacement`() ``
- `.find(...).replace(replacement: string | ASTNode | ASTNode[])`
- `.find(...).replace(replacement: (match: Match<any>, parse: ParseTag) => string)`
- `.find(...).replace(replacement: (match: Match<any>, parse: ParseTag) => ASTNode | ASTNode[])`

If you give the replacement as a string, it must be a valid expression or statement as parsed by the `jscodeshift` instance.
You can give the replacement as AST node(s) you already parsed or constructed.
Or you can give a replacement function, which will be called with each match and must return a string or `ASTNode | ASTNode[]` (you can use the `parse` tagged template string function provided as the second argument to parse code into a string
via `jscodeshift.template.expression` or `jscodeshift.template.statement`).
For example, you could uppercase the function names in all zero-argument function calls (`foo(); bar()` becomes `FOO(); BAR()`) with this:

```
astx
  .find`$fn()`
  .replace(({ captures: { $fn } }) => `${$fn.name.toUpperCase()}()`)
```

### `size()` (`number`)

Returns the number of matches from the `.find()` or `.closest()` call that returned this instance.

### `length` (`number`)

Synonym for `size()`.

### `matches()` (`Match[]`)

Gets the matches from the `.find()` or `.closest()` call that returned this instance.

### `match()` (`Match`)

Gets the first match from the `.find()` or `.closest()` call that returned this instance.

Throws an error if there were no matches.

### `paths()` (`ASTPath[]`)

Returns the paths that `.find()` and `.closest()` will search within.
If this instance was returned by `.find()` or `.closest()`, these are
the paths of nodes that matched the search pattern.

### `nodes()` (`ASTNode[]`)

Returns the nodes that `.find()` and `.closest()` will search within.
If this instance was returned by `.find()` or `.closest()`, these are
the nodes that matched the search pattern.

### `.filter(iteratee)` (`Astx`)

Filters the matches.

`iteratee` is function that will be called with `match: Match, index: number, matches: Match[]` and returns `true` or `false`. Only matches for which `iteratee` returns `true` will be included in the result.

### `.at(index)` (`Astx`)

Selects the match at the given `index`.

### `.withCaptures(matches)` (`Astx`)

Returns an `Astx` instance that contains captures from the given `matches` in addition to captures present in this instance.

### `.captures(name)` (`Astx`)

Filters down to nodes captured with the given `name`. For example,
`astx.find('foo($arg)')` will have calls to `foo` as matches/paths,
but `astx.find('foo($arg)').captures('$arg')` will have just the
first arguments as matches/paths.

### `.captureNode(name)` (`ASTNode | null`)

Gets the first node that was captured with the given `name`.

### `.capturePath(name)` (`ASTPath<any> | null`)

Gets the path of the first node that was captured with the given `name`.

### `.arrayCaptures(name)` (`Astx`)

Filters down to arrays of nodes captured with the given `name`. For example,
`astx.find('foo($$arg)')` will have calls to `foo` as matches/paths,
but `astx.find('foo($$arg)').captures('$$arg')` will have just the
arguments as matches/paths.

### `arrayCaptureNodes(name)` (`ASTNode[] | null`)

Gets the first array of nodes that was captured with the given `name`.

### `arrayCapturePaths(name)` (`ASTPath<any>[] | null`)

Gets the paths of the first array of nodes that was captured with the given `name`.

### `stringCapture(name)` (`string | null`)

Gets the first string value that was captured with the given `name`.

## Match

### `type`

The type of match: `'node'` or `'nodes'`.

### `.path`

The `ASTPath` of the matched node. If `type` is `'nodes'`, this will be `paths[0]`.

### `.node`

The matched `ASTNode`. If `type` is `'nodes'`, this will be `nodes[0]`.

### `.paths`

The `ASTPaths` of the matched nodes.

### `.nodes`

The matched `ASTNode`s.

### `.captures`

The `ASTNode`s captured from placeholders in the match pattern. For example if the pattern was `foo($bar)`, `.captures.$bar` will be the `ASTNode` of the first argument.

### `.pathCaptures`

The `ASTPath`s captured from placeholders in the match pattern. For example if the pattern was `foo($bar)`, `.pathCaptures.$bar` will be the `ASTPath` of the first argument.

### `.arrayCaptures`

The `ASTNode[]`s captured from array placeholders in the match pattern. For example if the pattern was `foo({ ...$bar })`, `.arrayCaptures.$bar` will be the `ASTNode[]`s of the object properties.

### `.arrayPathCaptures`

The `ASTPath[]`s captured from array placeholders in the match pattern. For example if the pattern was `foo({ ...$bar })`, `.pathArrayCaptures.$bar` will be the `ASTPath[]`s of the object properties.

### `.stringCaptures`

The string values captured from string placeholders in the match
pattern. For example if the pattern was `import foo from '$foo'`,
`stringCaptures.$foo` will be the import path.

# Match Patterns

## Object Matching

An `ObjectExpression` (aka object literal) pattern will match any `ObjectExpression` in your code with the same properties in any order.
It will not match if there are missing or additional properties. For example, `{ foo: 1, bar: $bar }` will match `{ foo: 1, bar: 2 }` or `{ bar: 'hello', foo: 1 }`
but not `{ foo: 1 }` or `{ foo: 1, bar: 2, baz: 3 }`.

You can match additional properties by using `...$$captureName`, for example `{ foo: 1, ...$$rest }` will match `{ foo: 1 }`, `{ foo: 1, bar: 2 }`, `{ foo: 1, bar: 2, ...props }` etc.
The additional properties will be captured in `match.arrayCaptures`/`match.arrayPathCaptures`, and can be spread in replacement expressions. For example,
`` astx.find`{ foo: 1, ...$$rest }`.replace`{ bar: 1, ...$$rest }` `` will transform `{ foo: 1, qux: {}, ...props }` into `{ bar: 1, qux: {}, ...props }`.

A spread property that isn't of the form `/^\$\$[a-z0-9]+$/i` is not a capture variable, for example `{ ...foo }` will only match `{ ...foo }` and `{ ...$_$foo }` will only
match `{ ...$$foo }` (leading `$_` is an escape for `$`).

There is currently no way to match properties in a specific order, but it could be added in the future.

## List Matching

In many cases where there is a list of nodes in the AST you can match
multiple elements with a capture variable starting with `$$`. For example, `[$$before, 3, $$after]` will match any array expression containing an element `3`; elements before the
first `3` will be captured in `$$before` and elements after the first `3` will be captured in `$$after`.

This works even with block statements. For example, `function foo() { $$before; throw new Error('test'); $$after; }` will match `function foo()` that contains a `throw new Error('test')`,
and the statements before and after that throw statement will get captured in `$$before` and `$$after`, respectively.

### Support Table

Some items marked TODO probably actually work, but are untested.

| Type                                                  | Supports list matching?                    | Notes                                                             |
| ----------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| `ArrayExpression.elements`                            | ✅                                         |                                                                   |
| `ArrayPattern.elements`                               | ✅                                         |                                                                   |
| `BlockStatement.body`                                 | ✅                                         |                                                                   |
| `CallExpression.arguments`                            | ✅                                         |                                                                   |
| `Class(Declaration/Expression).implements`            | ✅                                         |                                                                   |
| `ClassBody.body`                                      | ✅                                         |                                                                   |
| `ComprehensionExpression.blocks`                      | TODO                                       |                                                                   |
| `DeclareClass.body`                                   | TODO                                       |                                                                   |
| `DeclareClass.implements`                             | TODO                                       |                                                                   |
| `DeclareExportDeclaration.specifiers`                 | TODO                                       |                                                                   |
| `DeclareInterface.body`                               | TODO                                       |                                                                   |
| `DeclareInterface.extends`                            | TODO                                       |                                                                   |
| `DoExpression.body`                                   | TODO                                       |                                                                   |
| `ExportNamedDeclaration.specifiers`                   | ✅                                         |                                                                   |
| `Function.decorators`                                 | TODO                                       |                                                                   |
| `Function.params`                                     | ✅                                         |                                                                   |
| `FunctionTypeAnnotation/TSFunctionType.params`        | ✅                                         |                                                                   |
| `GeneratorExpression.blocks`                          | TODO                                       |                                                                   |
| `ImportDeclaration.specifiers`                        | ✅                                         |                                                                   |
| `(TS)InterfaceDeclaration.body`                       | TODO                                       |                                                                   |
| `(TS)InterfaceDeclaration.extends`                    | TODO                                       |                                                                   |
| `IntersectionTypeAnnotation/TSIntersectionType.types` | ✅                                         |                                                                   |
| `JSX(Element/Fragment).children`                      | ✅                                         |                                                                   |
| `JSX(Opening)Element.attributes`                      | ✅                                         |                                                                   |
| `MethodDefinition.decorators`                         | TODO                                       |                                                                   |
| `NewExpression.arguments`                             | ✅                                         |                                                                   |
| `ObjectExpression.properties`                         | ✅                                         |                                                                   |
| `ObjectPattern.decorators`                            | TODO                                       |                                                                   |
| `ObjectPattern.properties`                            | ✅                                         |                                                                   |
| `(ObjectTypeAnnotation/TSTypeLiteral).properties`     | ✅                                         | Use `$a: any` to match one property, `$$a: any` to match multiple |
| `Program.body`                                        | ✅                                         |                                                                   |
| `Property.decorators`                                 | TODO                                       |                                                                   |
| `SequenceExpression`                                  | ✅                                         |                                                                   |
| `SwitchCase.consequent`                               | ✅                                         |                                                                   |
| `SwitchStatement.cases`                               | TODO                                       |                                                                   |
| `TemplateLiteral.quasis/expressions`                  | ❓ not sure if I can come up with a syntax |                                                                   |
| `TryStatement.guardedHandlers`                        | TODO                                       |                                                                   |
| `TryStatement.handlers`                               | TODO                                       |                                                                   |
| `TSFunctionType.parameters`                           | ✅                                         |                                                                   |
| `TSCallSignatureDeclaration.parameters`               | TODO                                       |                                                                   |
| `TSConstructorType.parameters`                        | TODO                                       |                                                                   |
| `TSConstructSignatureDeclaration.parameters`          | TODO                                       |                                                                   |
| `TSDeclareFunction.params`                            | TODO                                       |                                                                   |
| `TSDeclareMethod.params`                              | TODO                                       |                                                                   |
| `TSEnumDeclaration.members`                           | TODO                                       |                                                                   |
| `TSIndexSignature.parameters`                         | TODO                                       |                                                                   |
| `TSMethodSignature.parameters`                        | TODO                                       |                                                                   |
| `TSModuleBlock.body`                                  | TODO                                       |                                                                   |
| `TSTypeLiteral.members`                               | ✅                                         |                                                                   |
| `TupleTypeAnnotation/TSTupleType.types`               | ✅                                         |                                                                   |
| `(TS)TypeParameterDeclaration`                        | ✅                                         |                                                                   |
| `(TS)TypeParameterInstantiation`                      | ✅                                         |                                                                   |
| `UnionTypeAnnotation/TSUnionType.types`               | ✅                                         |                                                                   |
| `VariableDeclaration.declarations`                    | ✅                                         |                                                                   |
| `WithStatement.body`                                  | ❌ who uses with statements...             |                                                                   |

## String Matching

A string that's just a placeholder like `'$foo'` will match any string and capture its contents into `match.stringCaptures.$foo`.
The same escaping rules apply as for identifiers. This also works for template literals like `` `$foo` `` and tagged template literals like `` doSomething`$foo` ``.

This can be helpful for working with import statements. For example, see [Converting require statements to imports](#converting-require-statements-to-imports).

## Extracting nodes

An empty comment (`/**/`) in a pattern will "extract" a node for matching.
For example the pattern `const x = { /**/ $key: $value }` will just
match `ObjectProperty` nodes against `$key: $value`.

The parser wouldn't be able to parse `$key: $value` by itself or
know that you mean an `ObjectProperty`, as opposed to something different like the `x: number` in `const x: number = 1`, so using `/**/` enables you to work around this. You can use this to match any node type that isn't a valid expression or statement by itself. For example `type T = /**/ Array<number>`
would match `Array<number>` type annotations.

`/**/` also works in replacement patterns.

## | Backreferences

If you use the same capture variable more than once, subsequent positions will have to match what was captured for the first occurrence of the variable.

For example, the pattern `foo($a, $a, $b, $b)` will match only `foo(1, 1, {foo: 1}, {foo: 1})` in the following:

```js
foo(1, 1, { foo: 1 }, { foo: 1 }) // match
foo(1, 2, { foo: 1 }, { foo: 1 }) // no match
foo(1, 1, { foo: 1 }, { bar: 1 }) // no match
```

**Note**: array capture variables (like `$$a`) don't currently support backreferencing.

# Transform files

Like `jscodeshift`, you can put code to perform a transform in a `.js` file (defaults to `astx.js` in the working directory, unless you use the `-t` CLI option).

The transform file API is a bit different from `jscodeshift` though. You can have the following exports:

## `exports.find` (optional)

A code string or AST node of the pattern to find in the files being transformed.

## `exports.where` (optional)

Where conditions for capture variables in `exports.find`.
See [`FindOptions.where` (`{ [captureName: string]: (path: ASTPath<any>) => boolean }`)](#findoptionswhere--capturename-string-path-astpathany--boolean-) for more information.

## `exports.replace` (optional)

A code string, AST node, or replace function to replace matches of `exports.find` with.

The function arguments are the same as described in [`.find().replace()`](#findreplace) or
[`.findStatements().replace()`](#findstatementsreplace), depending on whether `exports.find`
is multiple statements or not.

## `exports.parser` (optional)

The parser name to use, or a `Parser` implementation:

```ts
interface Parser {
  parse(source: string, options?: any): types.ASTNode
}
```

## `exports.astx` (optional)

A function to perform an arbitrary transform using the `Astx` API. It gets called with an object with the following properties:

- `source` (`string`) - The source code of the file being transformed
- `path` (`string`) - The path to the file being transformed
- `root` (`Collection`) - the JSCodeshift Collection wrapping the parsed AST
- `astx` (`Astx`) - the `Astx` API instance
- `jscodeshift` (`JSCodeshift`) - the JSCodeshift instance
- `j` (`JSCodeshift`) - shorthand for the same JSCodeshift instance
- `expression` - tagged template literal for parsing code as an expression, like `jscodeshift.template.expression`
- `statement` - tagged template literal for parsing code as a statement, like `jscodeshift.template.statement`
- `statements` - tagged template literal for parsing code as an array of statements, like `jscodeshift.template.statements`
- `report` (`(message: any) => void`)

Unlike `jscodeshift`, your transform function can be async, and it doesn't have to return the transformed code,
but you can return a `string`. You can also return `null` to
skip the file.

# CLI

Astx includes a CLI for performing transforms. The CLI will process the given files, then print out a diff of what will be
changed, and prompt you to confirm you want to write the changes.

It will parse with babel by default using the version installed in your project and your project's babel config, if any.
You can pass other parsers with the `--parser` option, just like `jscodeshift`.

Also unlike `jscodeshift`, if `prettier` is installed in your project, it will format the transformed code with `prettier`.

```
Usage:

astx -f <code> [<files...>] [<directories...>]

  Searches for the -f pattern in the given files and directories
  and prints out the matches in context

astx -f <code> -r <code> [<files...>] [<directories...>]

  Quick search and replace in the given files and directories
  (make sure to quote code)

  Example:

    astx -f 'rmdir($path, $force)' -r 'rmdir($path, { force: $force })' src

astx -t <transformFile> [<files ...>] [<directories ...>]

  Applies a transform file to the given files and directories

astx [<files ...>] [<directories ...>]

  Applies the default transform file (astx.js in working directory)
  to the given files and directories


Options:
      --help       Show help                                           [boolean]
      --version    Show version number                                 [boolean]
  -t, --transform  path to the transform file. Can be either a local path or url
      --parser     parser to use                                        [string]
  -f, --find       search pattern                                       [string]
  -r, --replace    replace pattern                                      [string]
```
