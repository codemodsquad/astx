# astx

[![CircleCI](https://circleci.com/gh/codemodsquad/astx.svg?style=svg)](https://circleci.com/gh/codemodsquad/astx)
[![Coverage Status](https://codecov.io/gh/codemodsquad/astx/branch/master/graph/badge.svg)](https://codecov.io/gh/codemodsquad/astx)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/astx.svg)](https://badge.fury.io/js/astx)

structural search and replace for JavaScript and TypeScript, using jscodeshift

# Table of Contents

<!-- toc -->

- [astx](#astx)
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Prior art and philosophy](#prior-art-and-philosophy)
- [API](#api)
  - [class Astx](#class-astx)
    - [`constructor(jscodeshift: JSCodeshift, root: Collection)`](#constructorjscodeshift-jscodeshift-root-collection)
    - [`.on(root: Collection)`](#onroot-collection)
    - [`.find()`](#find)
    - [`.find().replace()`](#findreplace)
  - [Match](#match)
    - [`.path`](#path)
    - [`.node`](#node)
    - [`.captures`](#captures)
    - [`.pathCaptures`](#pathcaptures)
    - [`.arrayCaptures`](#arraycaptures)
    - [`.arrayPathCaptures`](#arraypathcaptures)
  - [class MatchArray](#class-matcharray)
- [Match Patterns](#match-patterns)
  - [Object Matching](#object-matching)
  - [List Matching](#list-matching)
    - [Support Table](#support-table)
  - [Backreferences](#backreferences)

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

Changing a bunch of calls to `rmdir` by hand would suck. Now you can do this automatically using `astx`!

```js
astx.find`rmdir($path, $force)`.replace`rmdir($path, { force: $force })`
```

What's going on here? Find and replace must be valid JS expressions or statements. `astx` parses them
into AST (Abstract Syntax Tree) nodes, and then looks for matching AST nodes in your code.
`astx` treats any identifier in starting with `$` in the find or replace expression as a placeholder - in this case, `$path` and `$force`.
(You can use `$$` as an escape, for instance `$$foo` will match literal identifier `$foo` in your code).

When it gets to a function call, it checks that the function name matches `rmdir`, and that it has the same number of arguments.
Then it checks if the arguments match.
Our patterns for both arguments (`$path`, `$force`) are placeholders, so they automatically match and capture the corresponding AST nodes
of the two arguments in your code.

Then `astx` replaces that function call it found with the replacement expression. When it finds placeholders in the replacement expression,
it substitutes the corresponding values that were captured for those placeholders (`$path` captured `'new/stuff'` and `$force` captured `true`).

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

### `constructor(jscodeshift: JSCodeshift, root: Collection)`

`jscodeshift` must be configured with your desired parser for methods to work correctly.
For instance, if you're using TypeScript, it could be `require('jscodeshift').withParser('ts')`.

`root` is the JSCodeshift Collection you want to operate on.

### `.on(root: Collection)`

Returns a different `Astx` instance for the given `root`. Use this if you want to filter down which nodes to operate on.

### `.find()`

Finds matches for the given pattern within `root`, and returns a `MatchArray` containing the matches.

There are several different ways you can call `.find`:

- `` .find`pattern`(options?: FindOptions) ``
- `.find(pattern: string, options?: FindOptions)`
- `.find(pattern: ASTNode, options?: FindOptions)`

If you give the pattern as a string, it must be a valid expression or statement as parsed by the `jscodeshift` instance. Otherwise it should be a valid
AST node you already parsed or constructed.
You can interpolate AST nodes in the tagged template literal; it uses `jscodeshift.template.expression` or `jscodeshift.template.statement` under the hood.

For example you could do `` astx.find`${j.identifier('foo')} + 3`() ``

### `.find().replace()`

Finds and replaces matches for the given pattern within `root`.

There are several different ways you can call `.replace`. Note that you can omit the `()` after `` .find`pattern` `` if you're calling `.replace`.
And you can call `.find` in any way described above in place of `` .find`pattern` ``.

- `` .find`pattern`.replace`replacement` ``
- `` .find`pattern`.replace(replacement: string) ``
- `` .find`pattern`.replace(replacement: ASTNode) ``
- `` .find`pattern`.replace(replacement: (match: Match<any>, parse: ParseTag) => string) ``
- `` .find`pattern`.replace(replacement: (match: Match<any>, parse: ParseTag) => ASTNode) ``

If you give the replacement as a string, it must be a valid expression or statement as parsed by the `jscodeshift` instance.
You can give the replacement as an AST node you already parsed or constructed.
Or you can give a replacement function, which will be called with each match and must return a string or `ASTNode` (you can use the `parse` tagged template string function provided as the second argument to parse code into a string
via `jscodeshift.template.expression` or `jscodeshift.template.statement`).
For example, you could uppercase the function names in all zero-argument function calls (`foo(); bar()` becomes `FOO(); BAR()`) with this:

```
astx
  .find`$fn()`
  .replace(({ captures: { $fn } }) => `${$fn.name.toUpperCase()}()`)
```

## Match

### `.path`

The `ASTPath` of the matched node.

### `.node`

The matched `ASTNode`.

### `.captures`

The `ASTNode`s captured from placeholders in the match pattern. For example if the pattern was `foo($bar)`, `.captures.$bar` will be the `ASTNode` of the first argument.

### `.pathCaptures`

The `ASTPath`s captured from placeholders in the match pattern. For example if the pattern was `foo($bar)`, `.pathCaptures.$bar` will be the `ASTPath` of the first argument.

### `.arrayCaptures`

The `ASTNode[]`s captured from array placeholders in the match pattern. For example if the pattern was `foo({ ...$bar })`, `.arrayCaptures.$bar` will be the `ASTNode[]`s of the object properties.

### `.arrayPathCaptures`

The `ASTPath[]`s captured from array placeholders in the match pattern. For example if the pattern was `foo({ ...$bar })`, `.pathArrayCaptures.$bar` will be the `ASTPath[]`s of the object properties.

## class MatchArray

Returned by [`.find()`](#find). Just an array of [`Match`](#match)es plus the [`.replace()`](#findreplace) method.

# Match Patterns

## Object Matching

An `ObjectExpression` (aka object literal) pattern will match any `ObjectExpression` in your code with the same properties in any order.
It will not match if there are missing or additional properties. For example, `{ foo: 1, bar: $bar }` will match `{ foo: 1, bar: 2 }` or `{ bar: 'hello', foo: 1 }`
but not `{ foo: 1 }` or `{ foo: 1, bar: 2, baz: 3 }`.

You can match additional properties by using `...$captureName`, for example `{ foo: 1, ...$rest }` will match `{ foo: 1 }`, `{ foo: 1, bar: 2 }`, `{ foo: 1, bar: 2, ...props }` etc.
The additional properties will be captured in `match.arrayCaptures`/`match.arrayPathCaptures`, and can be spread in replacement expressions. For example,
`` astx.find`{ foo: 1, ...$rest }`.replace`{ bar: 1, ...$rest }` `` will transform `{ foo: 1, qux: {}, ...props }` into `{ bar: 1, qux: {}, ...props }`.

A spread property that isn't of the form `/^\$[a-z0-9]+$/i` is not a capture variable, for example `{ ...foo }` will only match `{ ...foo }` and `{ ...$$foo }` will only
match `{ ...$foo }` (leading `$$` is an escape for `$`).

There is currently no way to match properties in a specific order, but it could be added in the future.

## List Matching

In many cases where there is a list of nodes in the AST you can match
multiple elements with a capture variable starting with `$_`. For example, `[$_before, 3, $_after]` will match any array expression containing an element `3`; elements before the
first `3` will be captured in `$_before` and elements after the first `3` will be captured in `$_after`.

This works even with block statements. For example, `function foo() { $_before; throw new Error('test'); $_after; }` will match `function foo()` that contains a `throw new Error('test')`,
and the statements before and after that throw statement will get captured in `$_before` and `$_after`, respectively.

### Support Table

| Type                                                  | Supports list matching?                    |
| ----------------------------------------------------- | ------------------------------------------ |
| `ArrayExpression.elements`                            | ✅                                         |
| `ArrayPattern.elements`                               | ✅                                         |
| `BlockStatement.body`                                 | ✅                                         |
| `CallExpression.arguments`                            | ✅                                         |
| `Class(Declaration/Expression).implements`            | ✅                                         |
| `ClassBody.body`                                      | ✅                                         |
| `ComprehensionExpression.blocks`                      | TODO                                       |
| `DeclareClass.body`                                   | TODO                                       |
| `DeclareClass.implements`                             | TODO                                       |
| `DeclareExportDeclaration.specifiers`                 | TODO                                       |
| `DeclareInterface.body`                               | TODO                                       |
| `DeclareInterface.extends`                            | TODO                                       |
| `DoExpression.body`                                   | TODO                                       |
| `ExportNamedDeclaration.specifiers`                   | ✅                                         |
| `Function.decorators`                                 | TODO                                       |
| `Function.params`                                     | ✅                                         |
| `FunctionTypeAnnotation/TSFunctionType.params`        | ✅                                         |
| `GeneratorExpression.blocks`                          | TODO                                       |
| `ImportDeclaration.specifiers`                        | TODO                                       |
| `(TS)InterfaceDeclaration.body`                       | TODO                                       |
| `(TS)InterfaceDeclaration.extends`                    | TODO                                       |
| `IntersectionTypeAnnotation/TSIntersectionType.types` | ✅                                         |
| `JSX(Element/Fragment).children`                      | TODO                                       |
| `JSX(Opening)Element.attributes`                      | TODO                                       |
| `MethodDefinition.decorators`                         | TODO                                       |
| `NewExpression.arguments`                             | TODO                                       |
| `ObjectExpression.properties`                         | ✅                                         |
| `ObjectPattern.decorators`                            | TODO                                       |
| `ObjectPattern.properties`                            | ✅                                         |
| `(ObjectTypeAnnotation/TSTypeLiteral).properties`     | ✅                                         |
| `Program.body`                                        | TODO                                       |
| `Property.decorators`                                 | TODO                                       |
| `SequenceExpression`                                  | ✅                                         |
| `SwitchCase.consequent`                               | ✅                                         |
| `SwitchStatement.cases`                               | TODO                                       |
| `TemplateLiteral.quasis/expressions`                  | ❓ not sure if I can come up with a syntax |
| `TryStatement.guardedHandlers`                        | TODO                                       |
| `TryStatement.handlers`                               | TODO                                       |
| `TSFunctionType.parameters`                           | TODO                                       |
| `TSCallSignatureDeclaration.parameters`               | TODO                                       |
| `TSConstructorType.parameters`                        | TODO                                       |
| `TSConstructSignatureDeclaration.parameters`          | TODO                                       |
| `TSDeclareFunction.params`                            | TODO                                       |
| `TSDeclareMethod.params`                              | TODO                                       |
| `TSEnumDeclaration.members`                           | TODO                                       |
| `TSIndexSignature.parameters`                         | TODO                                       |
| `TSMethodSignature.parameters`                        | TODO                                       |
| `TSModuleBlock.body`                                  | TODO                                       |
| `TSTypeLiteral.members`                               | ✅                                         |
| `TupleTypeAnnotation/TSTupleType.types`               | ✅                                         |
| `(TS)TypeParameterDeclaration`                        | ✅                                         |
| `(TS)TypeParameterInstantiation`                      | ✅                                         |
| `UnionTypeAnnotation/TSUnionType.types`               | ✅                                         |
| `VariableDeclaration.declarations`                    | ✅                                         |
| `WithStatement.body`                                  | ❌ who uses with statements...             |

## Backreferences

If you use the same capture variable more than once, subsequent positions will have to match what was captured for the first occurrence of the variable.

For example, the pattern `foo($a, $a, $b, $b)` will match only `foo(1, 1, {foo: 1}, {foo: 1})` in the following:

```js
foo(1, 1, { foo: 1 }, { foo: 1 })
foo(1, 2, { foo: 1 }, { foo: 1 })
foo(1, 1, { foo: 1 }, { bar: 1 })
```
