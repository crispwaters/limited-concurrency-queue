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
    while (this._executing && this.items.length) {
      await concurrencyControl(this)
      if (this._executing === false) this.concurrencyCount--
      else {
        const next = this.items.shift()
        if (next === undefined) this.concurrencyCount--
        else Promise.resolve(next.func(...next.params)).then(() => this.concurrencyCount--)
      }
    }
    while (this.concurrencyCount > 0) {
      await sleep(100)
    }
    this._executing = false
  }

  stop () {
    this._executing = false
  }
}

module.exports = Queue
