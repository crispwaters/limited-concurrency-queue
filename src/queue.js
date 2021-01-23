function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function concurrencyControl (Queue) {
  while (true) {
    if (Queue.concurrencyCount < Queue.maxConcurrency) {
      Queue.concurrencyCount++
      return
    }
    await sleep(100)
  }
}

async function run (Queue) {
  while (Queue._executing && Queue.items.length) {
    await concurrencyControl(Queue)
    if (Queue._executing === false) Queue.concurrencyCount--
    else {
      const next = Queue.items.shift()
      if (next === undefined) Queue.concurrencyCount--
      else Promise.resolve(next.func(...next.params)).then(() => Queue.concurrencyCount--)
    }
  }
  while (Queue.concurrencyCount > 0) {
    await sleep(100)
  }
}

class Queue {
  constructor ({ maxConcurrency, items = [] } = {}) {
    this.items = []
    this._executing = false
    if (items.length) this.add(...items)
    if (maxConcurrency !== undefined) this.maxConcurrency = maxConcurrency
  }

  add (...items) {
    this.items.push(...items)
    return this
  }

  clear () {
    this.items.length = 0
    return this
  }

  async start () {
    if (this._executing) return
    this._executing = true
    this.concurrencyCount = 0
    await run(this)
    this._executing = false
  }

  stop () {
    this._executing = false
  }
}

module.exports = Queue
