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
