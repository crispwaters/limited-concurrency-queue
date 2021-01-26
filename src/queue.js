const parseThreshold = require('./parseThreshold')
const { run } = require('./queue.internal')

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
