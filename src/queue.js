const parseThreshold = require('./parseThreshold')

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function thresholdExceeded (Queue) {
  return (Date.now() - Queue._start) > Queue.threshold
}

async function concurrencyControl (Queue) {
  while (!thresholdExceeded(Queue)) {
    if (Queue.concurrencyCount < Queue.maxConcurrency) return
    await sleep(100)
  }
}

function runNext (Queue) {
  const next = Queue.items.shift()
  if (next === undefined) return
  Queue.concurrencyCount++
  Promise.resolve(next.func(...next.params)).then(() => Queue.concurrencyCount--)
}

async function run (Queue) {
  Queue._start = Date.now()
  while (Queue._executing && Queue.items.length) {
    await concurrencyControl(Queue)
    if (Queue._executing === false) break
    if (thresholdExceeded(Queue)) break
    runNext(Queue)
  }
  while (Queue.concurrencyCount > 0) {
    await sleep(100)
  }
}

class Queue {
  static resetDefaults () {
    Queue.defaults = {
      maxConcurrency: 10,
      threshold: Infinity
    }
  }

  constructor ({ maxConcurrency, items = [], threshold } = {}) {
    this.items = []
    this._executing = false
    if (items.length) this.add(...items)
    this.maxConcurrency = maxConcurrency ?? Queue.defaults.maxConcurrency
    this.threshold = parseThreshold(threshold ?? Queue.defaults.threshold)
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

Queue.resetDefaults()

module.exports = Queue
