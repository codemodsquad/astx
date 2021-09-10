export const input = `
/* eslint-disable no-console */

const testLib = require('test-lib')

const funcOne = (foo) => {
  console.log('foo', foo)
  return testLib(foo)
}

const funcTwo = (bar) => {
  console.log('bar', bar)
  return testLib(bar)
}

module.exports = (on, config) => {
  on('event', () => {
    funcOne(config.foo)
    funcTwo(config.bar)
  })
}

const json = {
  "foo": 123,
  "bar": true
}
`

export const find = `
$$header
module.exports = (on, config) => {
  $$functionBody
}
const json = { $$json }
`

export const replace = `
const { func } = require('some-module')

$$header

module.exports = func({
  $$json,
  events: {
    setupEvents(on, config) {
      $$functionBody
    }
  }
})
`

export const expectedReplace = `
const {
  func
} = require("some-module");

/* eslint-disable no-console */
const testLib = require("test-lib");

const funcOne = foo => {
  console.log("foo", foo);
  return testLib(foo);
};

const funcTwo = bar => {
  console.log("bar", bar);
  return testLib(bar);
};

module.exports = func({
  "foo": 123,
  "bar": true,

  events: {
    setupEvents(on, config) {
      on("event", () => {
        funcOne(config.foo);
        funcTwo(config.bar);
      });
    }
  }
});
`
