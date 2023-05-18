export const input = `
  it(\`leaves existing default imports untouched\`, function() {
    const code = \`import Baz from 'baz'\`
    const root = j(code)
    const result = addImports(root, statement\`import Foo from 'baz'\`)
    expect(result).to.deep.equal({ Foo: 'Baz' })
    expect(root.toSource()).to.equal(code)
  })
  it(\`adds missing default imports\`, function() {
    const code = \`import {baz} from 'baz'\`
    const root = j(code)
    addImports(root, statement\`import Foo from 'baz'\`)
    expect(root.toSource()).to.equal(\`import Foo, { baz } from 'baz';\`)
  })
  it(\`adds missing default imports case 2\`, function() {
    const code = \`import bar from 'bar'\`
    const root = j(code)
    addImports(root, statement\`import Foo from 'baz'\`)
    expect(root.toSource()).to.equal(\`\${code}
import Foo from "baz";\`)
  })
  it(\`leaves existing funky default imports untouched\`, function() {
    const code = \`import {default as Baz} from 'baz'\`
    const root = j(code)
    const result = addImports(
      root,
      statement\`import {default as Foo} from 'baz'\`
    )
    expect(result).to.deep.equal({ Foo: 'Baz' })
    expect(root.toSource()).to.equal(code)
  })
`

export const find = `
const code = $code
const root = j(code)
const result = addImports(root, statement\`$add\`)
expect(result).to.deep.equal($expectedReturn)
expect(root.toSource()).to.equal(code)
`

export const replace = `
testCase({
  code: $code,
  add: \`$add\`,
  expectedCode: $code,
  expectedReturn: $expectedReturn,
})
`

export const expectedReplace = (parser: string): string =>
  parser.startsWith('recast/babel')
    ? `
it(\`leaves existing default imports untouched\`, function () {
  testCase({
    code: \`import Baz from 'baz'\`,
    add: \`import Foo from 'baz'\`,
    expectedCode: \`import Baz from 'baz'\`,
    expectedReturn: {
      Foo: "Baz"
    },
  });
});
it(\`adds missing default imports\`, function () {
  const code = \`import {baz} from 'baz'\`;
  const root = j(code);
  addImports(root, statement\`import Foo from 'baz'\`);
  expect(root.toSource()).to.equal(\`import Foo, { baz } from 'baz';\`);
});
it(\`adds missing default imports case 2\`, function () {
  const code = \`import bar from 'bar'\`;
  const root = j(code);
  addImports(root, statement\`import Foo from 'baz'\`);
  expect(root.toSource()).to.equal(\`\${code}
import Foo from "baz";\`);
});
it(\`leaves existing funky default imports untouched\`, function () {
  testCase({
    code: \`import {default as Baz} from 'baz'\`,
    add: \`import {default as Foo} from 'baz'\`,
    expectedCode: \`import {default as Baz} from 'baz'\`,
    expectedReturn: {
      Foo: "Baz"
    },
  });
});
`
    : `
it(\`leaves existing default imports untouched\`, function () {
  testCase({
    code: \`import Baz from 'baz'\`,
    add: \`import Foo from 'baz'\`,
    expectedCode: \`import Baz from 'baz'\`,
    expectedReturn: { Foo: "Baz" },
  });
});
it(\`adds missing default imports\`, function () {
  const code = \`import {baz} from 'baz'\`;
  const root = j(code);
  addImports(root, statement\`import Foo from 'baz'\`);
  expect(root.toSource()).to.equal(\`import Foo, { baz } from 'baz';\`);
});
it(\`adds missing default imports case 2\`, function () {
  const code = \`import bar from 'bar'\`;
  const root = j(code);
  addImports(root, statement\`import Foo from 'baz'\`);
  expect(root.toSource()).to.equal(\`\${code}
import Foo from "baz";\`);
});
it(\`leaves existing funky default imports untouched\`, function () {
  testCase({
    code: \`import {default as Baz} from 'baz'\`,
    add: \`import {default as Foo} from 'baz'\`,
    expectedCode: \`import {default as Baz} from 'baz'\`,
    expectedReturn: { Foo: "Baz" },
  });
});
`
