import test from 'ava'
import { Queue } from './queue.js'

test('Queue respects FIFO', async (t) => {
  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function simulateRequest (name) {
    order.push(name)
    const length = 50 - name
    await sleep(length)
  }

  function generator (item) {
    return { func: simulateRequest, params: [item] }
  }

  const order = []
  const requeusts = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const queue = new Queue({ maxConcurrency: 5, items: requeusts.map(generator) })

  await queue.start()

  t.deepEqual(order, [1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('Queue stop will prevent new requests from starting', async (t) => {
  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function simulateRequest (name) {
    order.push(name)
    if (name === 4) queue.stop()
    const length = 50 - name
    await sleep(length)
  }

  function generator (item) {
    return { func: simulateRequest, params: [item] }
  }

  const order = []
  const requeusts = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const queue = new Queue({ maxConcurrency: 5, items: requeusts.map(generator) })

  await queue.start()
  t.deepEqual(order, [1, 2, 3, 4])
})

test('Queue can add items while processing', async (t) => {
  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function simulateRequest (name) {
    order.push(name)
    if (name < 10) queue.add(generator(name + 10))
    const length = 100 - name
    await sleep(length)
  }

  function generator (item) {
    return { func: simulateRequest, params: [item] }
  }

  const order = []
  const requeusts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const queue = new Queue({ maxConcurrency: 5, items: requeusts.map(generator) })

  await queue.start()
  t.deepEqual(order, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
})

test('Queue created with default settings', async (t) => {
  const queue = new Queue()
  t.is(queue.maxConcurrency, 10)
  t.is(queue.threshold, Infinity)
})

test('User can change Queue default settings', async (t) => {
  const queue1 = new Queue()
  Queue.defaults.maxConcurrency = 16
  Queue.defaults.threshold = 10000
  const queue2 = new Queue()
  t.is(queue1.maxConcurrency, 10)
  t.is(queue1.threshold, Infinity)
  t.is(queue2.maxConcurrency, 16)
  t.is(queue2.threshold, 10000)
})

test('Queue will not start new requeusts when threshold is exceeded', async (t) => {
  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function simulateRequest (name) {
    order.push(name)
    const length = 50 - name
    await sleep(length)
  }

  function generator (item) {
    return { func: simulateRequest, params: [item] }
  }

  const order = []
  const requeusts = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const queue = new Queue({ maxConcurrency: 4, items: requeusts.map(generator), threshold: 25 })

  await queue.start()
  t.deepEqual(order, [1, 2, 3, 4])
})

test('Queue clear removes remaining items from queue', async (t) => {
  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function simulateRequest (name) {
    order.push(name)
    const length = 50 - name
    await sleep(length)
  }

  function generator (item) {
    return { func: simulateRequest, params: [item] }
  }

  const order = []
  const requeusts = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const queue = new Queue({ maxConcurrency: 4, items: requeusts.map(generator) })

  Promise.resolve(sleep(50)).then(() => queue.clear())
  await queue.start()
  t.deepEqual(queue.items, [])
  t.true(order.length < requeusts.length)
})

test('Queue will not start if already running', async (t) => {
  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function simulateRequest (name) {
    order.push(name)
    const length = 50 - name
    await sleep(length)
  }

  function generator (item) {
    return { func: simulateRequest, params: [item] }
  }

  const order = []
  const requeusts = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const queue = new Queue({ maxConcurrency: 4, items: requeusts.map(generator) })

  Promise.resolve(sleep(50)).then(() => queue.start())
  await queue.start()
  t.deepEqual(order, [1, 2, 3, 4, 5, 6, 7, 8, 9])
})
