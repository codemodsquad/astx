export const input = `
const foo = <Foo>
  {a}
  <div>hello</div>
  {b}
  <div>world</div>
</Foo>

const bar = <Foo>
  {a}
  <div>goodbye</div>
  {b}
  <div>world</div>
</Foo>
`

export const find = `<$a>
  {$$a}
  <div>hello</div>
  {$$b}
</$a>`

export const expectedFind = [
  {
    node: `<Foo>
  {a}
  <div>hello</div>
  {b}
  <div>world</div>
</Foo>`,
    captures: {
      $a: 'Foo',
    },
    arrayCaptures: {
      $$a: ['\n  ', '{a}', '\n  '],
      $$b: ['\n  ', '{b}', '\n  ', '<div>world</div>', '\n'],
    },
  },
]

export const replace = `<$a>
  <div>blah</div>
  {$$b}
  {$$a}
</$a>`

export const expectedReplace = `
const foo = (
  <Foo>
    <div>blah</div>

    {b}
    <div>world</div>

    {a}
  </Foo>
);

const bar = (
  <Foo>
    {a}
    <div>goodbye</div>
    {b}
    <div>world</div>
  </Foo>
);
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
  replace,
  expectedReplace,
})
