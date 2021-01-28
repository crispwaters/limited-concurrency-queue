const Queue = require('./queue')

test('Queue respects FIFO', async () => {
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

  expect(order).toMatchObject([1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('Queue stop will prevent new requests from starting', async () => {
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
  expect(order).toMatchObject([1, 2, 3, 4])
})

test('Queue can add items while processing', async () => {
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
  expect(order).toMatchObject([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
})

test('Queue created with default settings', async () => {
  const queue = new Queue()
  expect(queue.maxConcurrency).toBe(10)
  expect(queue.threshold).toBe(Infinity)
})

test('User can change Queue default settings', async () => {
  const queue1 = new Queue()
  Queue.defaults.maxConcurrency = 16
  Queue.defaults.threshold = 10000
  const queue2 = new Queue()
  expect(queue1.maxConcurrency).toBe(10)
  expect(queue1.threshold).toBe(Infinity)
  expect(queue2.maxConcurrency).toBe(16)
  expect(queue2.threshold).toBe(10000)
})

test('Queue will not start new requeusts when threshold is exceeded', async () => {
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
  expect(order).toMatchObject([1, 2, 3, 4])
})

test('Queue clear removes remaining items from queue', async () => {
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
  expect(queue.items).toMatchObject([])
  expect(order.length).toBeLessThan(requeusts.length)
})

test('Queue will not start if already running', async () => {
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
  expect(order).toMatchObject([1, 2, 3, 4, 5, 6, 7, 8, 9])
})
