import { parseThreshold } from './parseThreshold.js'
import './parseThreshold.typedef.js'
import { run } from './queue.internal.js'

/**
 * A queue that manages the execution of asynchronous tasks.
 */
export class Queue {
  /**
   * Resets the default values for new instances of the `Queue` class.
   */
  static resetDefaults () {
    Queue.defaults = {
      maxConcurrency: 10,
      threshold: Infinity
    }
  }

  /**
   * Creates a new instance of the `Queue` class.
   * @param {Object} options - The options for the new queue.
   * @param {number} options.maxConcurrency - The maximum number of tasks to execute concurrently.
   * @param {Array} options.items - The initial items to add to the queue.
   * @param {Threshold|number} options.threshold - The threshold value for the queue.
   */
  constructor ({ maxConcurrency, items = [], threshold } = {}) {
    this.items = []
    this._executing = false
    if (items.length) this.add(...items)
    this.maxConcurrency = maxConcurrency ?? Queue.defaults.maxConcurrency
    this.threshold = parseThreshold(threshold ?? Queue.defaults.threshold)
  }

  /**
   * Adds one or more items to the queue.
   * @param {...*} items - The items to add to the queue.
   * @returns {Queue} The queue instance.
   */
  add (...items) {
    this.items.push(...items)
    return this
  }

  /**
   * Removes all items from the queue.
   * @returns {Queue} The queue instance.
   */
  clear () {
    this.items.length = 0
    return this
  }

  /**
   * Starts executing tasks in the queue.
   * @returns {Promise} A promise that resolves when all tasks have completed.
   */
  async start () {
    if (this._executing) return
    this._executing = true
    this.concurrencyCount = 0
    await run(this)
    this._executing = false
  }

  /**
   * Stops executing tasks in the queue.
   */
  stop () {
    this._executing = false
  }
}
Queue.resetDefaults()
