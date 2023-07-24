import test from 'ava'
import { parseThreshold } from './parseThreshold.js'

test('parseThreshold returns Infinity when Infinity is provided', (t) => {
  t.is(parseThreshold(Infinity), Infinity)
})

test('parseThreshold returns number value when number is provided', (t) => {
  t.is(parseThreshold(123), 123)
})

test('parseThreshold calculates number value when threshold object is provided', (t) => {
  t.is(parseThreshold({
    milliseconds: 123,
    seconds: 5
  }), 5123)
  t.is(parseThreshold({
    minutes: 12
  }), 720000)
  t.is(parseThreshold({}), 0)
  t.is(parseThreshold({
    minutes: 12,
    seconds: -1
  }), 719000)
})

test('parseThreshold ignores invalid properties', (t) => {
  t.is(parseThreshold({
    seconds: 10,
    foo: 'bar'
  }), 10000)
})

test('parseThreshold returns undefined when invalid parameter is provided', (t) => {
  t.is(parseThreshold('123'), undefined)
  t.is(parseThreshold(null), undefined)
})
