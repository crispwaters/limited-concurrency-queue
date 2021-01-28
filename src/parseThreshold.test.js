const parseThreshold = require('./parseThreshold')

test('parseThreshold returns Infinity when Infinity is provided', () => {
  expect(parseThreshold(Infinity)).toBe(Infinity)
})

test('parseThreshold returns number value when number is provided', () => {
  expect(parseThreshold(123)).toBe(123)
})

test('parseThreshold calculates number value when threshold object is provided', () => {
  expect(parseThreshold({
    milliseconds: 123,
    seconds: 5
  })).toBe(5123)
  expect(parseThreshold({
    minutes: 12
  })).toBe(720000)
  expect(parseThreshold({})).toBe(0)
  expect(parseThreshold({
    minutes: 12,
    seconds: -1
  })).toBe(719000)
})

test('parseThreshold ignores invalid properties', () => {
  expect(parseThreshold({
    seconds: 10,
    foo: 'bar'
  })).toBe(10000)
})

test('parseThreshold returns undefined when invalid parameter is provided', () => {
  expect(parseThreshold('123')).toBeUndefined()
  expect(parseThreshold(null)).toBeUndefined()
})
